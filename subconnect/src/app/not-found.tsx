import { BookIllustration } from "@/components/illustrations";
import { ButtonLink, EmptyState } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <EmptyState illustration={<BookIllustration title="An open book" />} title="This page isn't available">
        It may have been removed, or you may not have access to it right now.
      </EmptyState>
      <div className="flex justify-center"><ButtonLink href="/">Go to your home page</ButtonLink></div>
    </main>
  );
}
