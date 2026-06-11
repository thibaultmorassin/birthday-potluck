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
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6 md:gap-12">
      <div className="flex flex-col items-center gap-2 text-center md:gap-3">
        <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
          Qui est-ce ? 👀
        </h1>
        <p className="text-[13px] text-muted-foreground md:text-[15px]">
          Choisis ton profil, ou crée le tien.
        </p>
      </div>
      <ProfilePicker users={data ?? []} />
    </main>
  );
}
