"use server";

import { displayName } from "@/lib/avatar";
import {
  createSession,
  getProfileId,
  isAuthenticated,
  isValidPin,
  setProfileId,
} from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Tables } from "../../database.types";

export interface ActionState {
  ok: boolean;
  error?: string;
}

export async function login(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const pin = String(formData.get("pin") ?? "").trim();
  if (!isValidPin(pin)) {
    return { ok: false, error: "Mauvais code, réessaie !" };
  }
  await createSession();
  redirect("/profiles");
}

async function getProfile(): Promise<Tables<"users"> | null> {
  const profileId = await getProfileId();
  if (!profileId) return null;
  const { data } = await getSupabase()
    .from("users")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();
  return data ?? null;
}

export async function selectProfile(userId: string): Promise<ActionState> {
  if (!(await isAuthenticated())) {
    return { ok: false, error: "Session expirée, recharge la page." };
  }
  const { data } = await getSupabase()
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (!data) {
    return { ok: false, error: "Ce profil n'existe plus." };
  }
  await setProfileId(userId);
  redirect("/");
}

export async function createProfile(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAuthenticated())) {
    return { ok: false, error: "Session expirée, recharge la page." };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return { ok: false, error: "Entre un email valide." };
  }

  const supabase = getSupabase();
  // If the email is already registered, just reuse that profile.
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  let userId = existing?.id;
  if (!userId) {
    const { data, error } = await supabase
      .from("users")
      .insert({ email })
      .select("id")
      .single();
    if (error || !data) {
      console.error("createProfile failed:", error);
      return { ok: false, error: "Oups, ça n'a pas marché. Réessaie ?" };
    }
    userId = data.id;
  }

  await setProfileId(userId);
  redirect("/");
}

export async function saveContribution(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAuthenticated())) {
    return { ok: false, error: "Session expirée, recharge la page." };
  }
  const profile = await getProfile();
  if (!profile) {
    redirect("/profiles");
  }

  const id = String(formData.get("id") ?? "").trim();
  const item = String(formData.get("item") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const guestName = displayName(profile.email);

  if (category !== "food" && category !== "drink") {
    return { ok: false, error: "Choisis une catégorie : à manger ou à boire." };
  }
  if (!item) {
    return { ok: false, error: "Dis-nous ce que tu apportes !" };
  }
  if (item.length > 200) {
    return { ok: false, error: "C'est un peu long… raccourcis !" };
  }

  const supabase = getSupabase();

  if (id) {
    const { data: row } = await supabase
      .from("contributions")
      .select("user_id")
      .eq("id", id)
      .maybeSingle();
    if (!row || row.user_id !== profile.id) {
      return {
        ok: false,
        error: "Tu ne peux modifier que tes propres lignes.",
      };
    }
  }

  const { error } = id
    ? await supabase
        .from("contributions")
        .update({
          guest_name: guestName,
          item,
          category,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
    : await supabase.from("contributions").insert({
        guest_name: guestName,
        item,
        category,
        user_id: profile.id,
      });

  if (error) {
    console.error("saveContribution failed:", error);
    return { ok: false, error: "Oups, ça n'a pas marché. Réessaie ?" };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function deleteContribution(id: string): Promise<ActionState> {
  if (!(await isAuthenticated())) {
    return { ok: false, error: "Session expirée, recharge la page." };
  }
  const profile = await getProfile();
  if (!profile) {
    return { ok: false, error: "Choisis d'abord un profil." };
  }

  const supabase = getSupabase();
  const { data: row } = await supabase
    .from("contributions")
    .select("user_id")
    .eq("id", id)
    .maybeSingle();
  if (!row || row.user_id !== profile.id) {
    return { ok: false, error: "Tu ne peux supprimer que tes propres lignes." };
  }

  const { error } = await supabase.from("contributions").delete().eq("id", id);
  if (error) {
    console.error("deleteContribution failed:", error);
    return { ok: false, error: "Oups, ça n'a pas marché. Réessaie ?" };
  }

  revalidatePath("/");
  return { ok: true };
}
