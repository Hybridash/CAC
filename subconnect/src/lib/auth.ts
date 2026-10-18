import "server-only";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role, TeachingLevel } from "@prisma/client";
import { prisma } from "./db";

export const SESSION_COOKIE = "sc_session";
const TTL_HOURS = Number(process.env.SESSION_TTL_HOURS ?? 12);

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/** Used to keep login timing similar whether or not the email exists. */
let dummyHash: Promise<string> | undefined;
export async function burnPasswordCheck(password: string) {
  dummyHash ??= bcrypt.hash(crypto.randomBytes(16).toString("hex"), 12);
  await bcrypt.compare(password, await dummyHash);
}

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TTL_HOURS * 3600_000);
  await prisma.session.create({ data: { tokenHash: sha256(token), userId, expiresAt } });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: sha256(token) } });
  jar.delete(SESSION_COOKIE);
}

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  schoolId: string;
  teachingLevel: TeachingLevel | null;
  school: { id: string; name: string; timezone: string };
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: { user: { include: { school: { select: { id: true, name: true, timezone: true } } } } },
  });
  if (!session || session.expiresAt < new Date() || session.user.status !== "ACTIVE") return null;
  const { user } = session;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    schoolId: user.schoolId,
    teachingLevel: user.teachingLevel,
    school: user.school,
  };
});

export function homeFor(role: Role) {
  return role === "ADMIN" ? "/admin" : role === "TEACHER" ? "/teacher" : "/sub";
}

/** For pages: redirect to login (or the user's own home) when not allowed. */
export async function requireUser(...roles: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles.length && !roles.includes(user.role)) redirect(homeFor(user.role));
  return user;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** For route handlers and server actions: throw instead of redirecting. */
export async function requireApiUser(...roles: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "Please sign in again.");
  if (roles.length && !roles.includes(user.role)) throw new HttpError(404, "Not found");
  return user;
}

/** Basic CSRF defense for route handlers: reject cross-origin state-changing requests. */
export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return; // same-origin fetches from older browsers / non-browser clients with cookies are rare
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    if (new URL(origin).host !== host) throw new HttpError(403, "Forbidden");
  } catch {
    throw new HttpError(403, "Forbidden");
  }
}

export function errorResponse(err: unknown) {
  if (err instanceof HttpError) return Response.json({ error: err.message }, { status: err.status });
  console.error(err);
  return Response.json({ error: "Something went wrong." }, { status: 500 });
}
