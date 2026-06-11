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

  // Rows created before the category migration have no category column.
  const contributions = (data ?? []).map((row) => ({
    ...row,
    category: row.category === "drink" ? "drink" : "food",
  })) as Contribution[];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 md:px-8 md:py-16">
      <header className="mb-8 flex flex-col gap-2 md:mb-12 md:gap-3">
        <span className="text-5xl md:text-6xl" aria-hidden>
          🎂
        </span>
        <h1 className="text-3xl font-bold tracking-tight md:text-[40px] md:leading-tight">
          Qui apporte quoi ?
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Ajoute ce que tu amènes à manger ou à boire, et jette un œil à ce que
          les autres ont prévu.
        </p>
      </header>
      <PartyBoard contributions={contributions} />
    </main>
  );
}
