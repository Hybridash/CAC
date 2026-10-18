import { SchoolIllustration } from "@/components/illustrations";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="w-36">
          <SchoolIllustration />
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight text-primary-strong">SubConnect</p>
        <p className="text-muted">Lesson plans and support for substitute days</p>
      </div>
      {children}
    </main>
  );
}
