import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/session";
import { PinForm } from "@/components/pin-form";

export default async function PinPage() {
  if (await isAuthenticated()) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="flex w-full max-w-xs flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-4xl" aria-hidden>
            🎂
          </span>
          <h1 className="text-xl font-semibold">
            C&apos;est bientôt la fête !
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Entre le code reçu avec l&apos;invitation pour voir qui apporte
            quoi.
          </p>
        </div>
        <PinForm />
      </div>
    </main>
  );
}
