import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

/** Teachers pick their teaching level once, on first sign-in, before using the teacher area. */
export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("TEACHER");
  if (!user.teachingLevel) redirect("/welcome");
  return children;
}
