"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function setTeachingLevel(form: FormData) {
  const user = await requireApiUser("TEACHER");
  const level = z.enum(["ELEMENTARY", "SECONDARY"]).safeParse(form.get("level"));
  if (!level.success) redirect("/welcome");
  await prisma.user.update({ where: { id: user.id }, data: { teachingLevel: level.data } });
  redirect("/teacher");
}
