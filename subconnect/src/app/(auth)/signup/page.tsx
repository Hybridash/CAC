import Link from "next/link";
import { Card } from "@/components/ui";
import { SignupForm } from "./SignupForm";

export const metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <Card>
      <h1 className="mb-1 text-xl font-bold">Create an account</h1>
      <p className="mb-4 text-muted">Your school admin will approve your account before you can sign in.</p>
      <SignupForm />
      <p className="mt-5 text-center text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary underline underline-offset-2">Sign in</Link>
      </p>
    </Card>
  );
}
