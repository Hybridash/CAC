import { requireUser } from "@/lib/auth";
import { setTeachingLevel } from "@/app/actions/profile";
import { BookIllustration, ChalkboardIllustration } from "@/components/illustrations";
import { Card, cx } from "@/components/ui";

export const metadata = { title: "Welcome" };

const OPTIONS = [
  {
    level: "SECONDARY",
    title: "Middle or high school",
    body: "I teach different classes by period. My day can be split between substitutes, and I write a lesson plan and seating chart for each period.",
    Illustration: ChalkboardIllustration,
    alt: "A chalkboard",
  },
  {
    level: "ELEMENTARY",
    title: "Elementary school",
    body: "I teach one class all day. One substitute covers my whole day, and I write a daily schedule with arrival, dismissal, and classroom routines.",
    Illustration: BookIllustration,
    alt: "An open book",
  },
] as const;

export default async function WelcomePage() {
  const user = await requireUser("TEACHER");
  const first = !user.teachingLevel;
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight">{first ? `Welcome, ${user.name.split(" ")[0]}` : "Teaching level"}</h1>
      <p className="mt-1 mb-6 text-muted">
        {first ? "Before you start, tell us how your school day is organized. " : ""}
        This sets up your sub plans the right way. You can change it later from your home page.
      </p>
      <form action={setTeachingLevel} className="grid gap-4 sm:grid-cols-2">
        {OPTIONS.map(({ level, title, body, Illustration, alt }) => {
          const current = user.teachingLevel === level;
          return (
            <Card key={level} className={cx("flex flex-col p-0 sm:p-0", current && "border-primary ring-2 ring-primary-tint")}>
              <button type="submit" name="level" value={level} className="flex h-full flex-col items-center gap-3 rounded-2xl p-6 text-center hover:bg-primary-soft/50">
                <div className="w-36"><Illustration title={alt} /></div>
                <span className="text-xl font-semibold">{title}</span>
                <span className="text-muted">{body}</span>
                <span className="mt-auto pt-2 font-semibold text-primary">{current ? "Current choice" : `I teach ${level === "ELEMENTARY" ? "elementary" : "middle or high school"}`}</span>
              </button>
            </Card>
          );
        })}
      </form>
    </div>
  );
}
