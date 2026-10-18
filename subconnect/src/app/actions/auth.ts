"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { burnPasswordCheck, createSession, destroySession, hashPassword, homeFor, verifyPassword } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { notify } from "@/lib/notify";

export type FormState = { error?: string; success?: string } | undefined;

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const ip = await clientIp();
  if (!rateLimit(`login:${ip}`, 30, 15 * 60_000) || !rateLimit(`login:${email}`, 8, 15 * 60_000)) {
    return { error: "Too many sign-in attempts. Please wait a few minutes and try again." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    await burnPasswordCheck(password);
    return { error: "That email and password don't match our records." };
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    return { error: "That email and password don't match our records." };
  }
  if (user.status === "PENDING") return { error: "Your account is waiting for approval from your school admin." };
  if (user.status === "DISABLED") return { error: "This account is turned off. Please contact your school office." };

  await createSession(user.id);
  // Teachers choose elementary vs. middle/high school once, right after their first sign-in.
  redirect(user.role === "TEACHER" && !user.teachingLevel ? "/welcome" : homeFor(user.role));
}

const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(160),
  password: z.string().min(10, "Use at least 10 characters for your password.").max(200),
  role: z.enum(["TEACHER", "SUBSTITUTE"], { message: "Choose teacher or substitute." }),
  joinCode: z.string().trim().toUpperCase().min(4, "Enter your school's join code.").max(32),
});

export async function signup(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, password, role, joinCode } = parsed.data;

  if (!rateLimit(`signup:${await clientIp()}`, 10, 60 * 60_000)) {
    return { error: "Too many sign-up attempts. Please try again later." };
  }

  const school = await prisma.school.findUnique({ where: { joinCode } });
  if (!school) return { error: "We couldn't find a school with that join code. Check with your school office." };

  const done = { success: "Thanks! Your account request was sent to your school admin. You can sign in once it's approved." };
  // Same response whether or not the email is already registered (avoids revealing who has an account).
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return done;

  const user = await prisma.user.create({
    data: { name, email, role, status: "PENDING", schoolId: school.id, passwordHash: await hashPassword(password) },
  });
  const admins = await prisma.user.findMany({ where: { schoolId: school.id, role: "ADMIN", status: "ACTIVE" }, select: { id: true, email: true } });
  await notify(admins, "New account request", `${user.name} asked to join as a ${role === "TEACHER" ? "teacher" : "substitute"}.`, "/admin/people");
  return done;
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
