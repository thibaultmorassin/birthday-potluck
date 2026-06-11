import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfileId, isAuthenticated } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { avatarUrl, displayName } from "@/lib/avatar";
import { PartyBoard } from "@/components/party-board";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!(await isAuthenticated())) {
    redirect("/pin");
  }
  const profileId = await getProfileId();
  if (!profileId) {
    redirect("/profiles");
  }

  const supabase = getSupabase();
  const [{ data: profile }, { data, error }] = await Promise.all([
    supabase.from("users").select("*").eq("id", profileId).maybeSingle(),
    supabase
      .from("contributions")
      .select("*")
      .order("created_at", { ascending: true }),
  ]);

  if (!profile) {
    // The selected profile no longer exists — pick again.
    redirect("/profiles");
  }
  if (error) {
    throw new Error(`Failed to load contributions: ${error.message}`);
  }

  const name = displayName(profile.email);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 md:px-8 md:py-16">
      <div className="mb-6 flex justify-end md:mb-8">
        <Link
          href="/profiles"
          className="group flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 text-[12px] text-muted-foreground transition-colors hover:bg-hover hover:text-foreground md:text-[13px]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl(profile.email, 48)}
            alt=""
            width={24}
            height={24}
            className="size-6 rounded-full"
          />
          {name}
          <span className="text-muted-foreground/60 group-hover:text-muted-foreground">
            · changer
          </span>
        </Link>
      </div>
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
      <PartyBoard
        contributions={data ?? []}
        currentUserId={profile.id}
        guestName={name}
      />
    </main>
  );
}
