import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, homeFor } from "@/lib/auth";
import { Card } from "@/components/ui";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user.role));
  return (
    <Card>
      <h1 className="mb-4 text-xl font-bold">Sign in</h1>
      <LoginForm />
      <p className="mt-5 text-center text-muted">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-primary underline underline-offset-2">
          Create an account
        </Link>
      </p>
    </Card>
  );
}
