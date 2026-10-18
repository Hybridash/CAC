import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { setUserStatus } from "@/app/actions/admin";
import { CreateUserForm, ResetPasswordForm } from "@/components/admin/PeopleForms";
import { PeopleIllustration, TeacherDeskIllustration } from "@/components/illustrations";
import { Button, Card, cx, PageHeader, SectionTitle } from "@/components/ui";

export const metadata = { title: "People" };

const roleLabel = { ADMIN: "Admin", TEACHER: "Teacher", SUBSTITUTE: "Substitute" } as const;

export default async function PeoplePage() {
  const admin = await requireUser("ADMIN");
  const users = await prisma.user.findMany({ where: { schoolId: admin.schoolId }, orderBy: [{ status: "asc" }, { name: "asc" }] });
  const pending = users.filter((u) => u.status === "PENDING");
  const groups = (["TEACHER", "SUBSTITUTE", "ADMIN"] as const).map((role) => ({ role, list: users.filter((u) => u.role === role && u.status !== "PENDING") }));

  const StatusButton = ({ id, status, label, variant = "secondary" }: { id: string; status: "ACTIVE" | "DISABLED"; label: string; variant?: "secondary" | "danger" | "primary" }) => (
    <form action={setUserStatus}>
      <input type="hidden" name="userId" value={id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" variant={variant}>{label}</Button>
    </form>
  );

  return (
    <>
      <PageHeader title="People" subtitle="Teachers and substitutes at your school." illustration={<PeopleIllustration />} />
      <div className="flex flex-col gap-8">
        {pending.length > 0 && (
          <Card aria-labelledby="pending-heading" className="border-accent/30">
            <SectionTitle id="pending-heading" illustration={<PeopleIllustration />}>Waiting for approval</SectionTitle>
            <ul className="divide-y divide-line">
              {pending.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-semibold">{u.name} <span className="font-normal text-muted">· {roleLabel[u.role]}</span></p>
                    <p className="text-muted break-all">{u.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <StatusButton id={u.id} status="ACTIVE" label="Approve" variant="primary" />
                    <StatusButton id={u.id} status="DISABLED" label="Decline" variant="danger" />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {groups.map(({ role, list }) => (
          <section key={role} aria-labelledby={`${role}-heading`}>
            <SectionTitle id={`${role}-heading`}>{roleLabel[role]}s <span className="font-normal text-muted">({list.length})</span></SectionTitle>
            <ul className="flex flex-col gap-2">
              {list.map((u) => (
                <li key={u.id} className={cx("flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4", u.status === "DISABLED" && "opacity-75")}>
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {u.name}
                      {u.status === "DISABLED" && <span className="ml-2 rounded-full bg-canvas px-2 py-0.5 text-sm font-medium text-muted">Turned off</span>}
                      {u.id === admin.id && <span className="ml-2 text-sm font-normal text-muted">(you)</span>}
                    </p>
                    <p className="text-muted break-all">{u.email}{u.role === "TEACHER" && [u.teachingLevel === "ELEMENTARY" ? "Elementary" : u.teachingLevel === "SECONDARY" ? "Middle/high school" : "Level not chosen yet", u.subject, u.room && `Room ${u.room}`].filter(Boolean).map((x) => ` · ${x}`).join("")}{u.phone && ` · ${u.phone}`}</p>
                  </div>
                  {u.id !== admin.id && (
                    <div className="flex flex-wrap items-center gap-2">
                      <ResetPasswordForm userId={u.id} name={u.name} />
                      {u.status === "ACTIVE" ? <StatusButton id={u.id} status="DISABLED" label="Turn off" variant="danger" /> : <StatusButton id={u.id} status="ACTIVE" label="Turn on" />}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <Card aria-labelledby="create-heading">
          <SectionTitle id="create-heading" illustration={<TeacherDeskIllustration />}>Add an account</SectionTitle>
          <p className="mb-4 text-muted">People can also request an account themselves using your school join code (see School settings).</p>
          <CreateUserForm />
        </Card>
      </div>
    </>
  );
}
