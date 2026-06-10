import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/session";
import { getSupabase, type Contribution } from "@/lib/supabase";
import { PartyBoard } from "@/components/party-board";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!(await isAuthenticated())) {
    redirect("/pin");
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("contributions")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load contributions: ${error.message}`);
  }

  const contributions = (data ?? []) as Contribution[];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-4 md:py-10">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Qui apporte quoi ? 🎂</h1>
        <p className="text-[13px] text-muted-foreground">
          Ajoute ce que tu amènes à manger ou à boire, et jette un œil à ce que
          les autres ont prévu.
        </p>
      </header>
      <PartyBoard contributions={contributions} />
    </main>
  );
}
