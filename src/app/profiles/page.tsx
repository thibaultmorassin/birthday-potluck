import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { ProfilePicker } from "@/components/profile-picker";

export const dynamic = "force-dynamic";

export default async function ProfilesPage() {
  if (!(await isAuthenticated())) {
    redirect("/pin");
  }

  const { data, error } = await getSupabase()
    .from("users")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load users: ${error.message}`);
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-10 md:py-16">
      <header className="mb-6 flex flex-col gap-2 md:mb-8 md:gap-3">
        <span className="text-5xl md:text-6xl" aria-hidden>
          👋
        </span>
        <h1 className="text-3xl font-bold tracking-tight md:text-[36px] md:leading-tight">
          C&apos;est qui ?
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Retrouve ton profil ou crée le tien — il signera ce que tu apportes.
        </p>
      </header>
      <ProfilePicker users={data ?? []} />
    </main>
  );
}
