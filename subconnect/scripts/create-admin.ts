/**
 * Create the first school and its admin account (or add an admin to an existing school).
 *
 *   npm run create-admin -- --email you@school.org --name "Your Name" --school "Lincoln High" [--timezone America/Chicago]
 *   npm run create-admin -- --email you@school.org --name "Your Name" --school-id <existing school id>
 *
 * You will be prompted for a password (or pass --password, not recommended: it ends up in shell history).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import readline from "node:readline";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    email: { type: "string" },
    name: { type: "string" },
    school: { type: "string" },
    "school-id": { type: "string" },
    timezone: { type: "string", default: "America/New_York" },
    password: { type: "string" },
  },
});

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (a) => (rl.close(), resolve(a))));
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const email = values.email?.trim().toLowerCase();
    if (!email || !values.name || (!values.school && !values["school-id"])) {
      console.error('Usage: npm run create-admin -- --email you@school.org --name "Your Name" --school "School Name"');
      process.exit(1);
    }
    if (!Intl.supportedValuesOf("timeZone").includes(values.timezone!)) throw new Error(`Unknown timezone ${values.timezone}`);
    const password = values.password ?? (await ask("Password (min 10 characters): "));
    if (password.length < 10) throw new Error("Password must be at least 10 characters.");

    const school = values["school-id"]
      ? await prisma.school.findUniqueOrThrow({ where: { id: values["school-id"] } })
      : await prisma.school.create({
          data: {
            name: values.school!,
            timezone: values.timezone!,
            joinCode: crypto.randomBytes(4).toString("hex").toUpperCase(),
          },
        });
    const user = await prisma.user.create({
      data: { email, name: values.name, role: "ADMIN", status: "ACTIVE", schoolId: school.id, passwordHash: await bcrypt.hash(password, 12) },
    });
    console.log(`Created admin ${user.email} for "${school.name}".`);
    console.log(`School join code for teachers and substitutes: ${school.joinCode}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
