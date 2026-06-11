"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, isAuthenticated, isValidPin } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

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
  redirect("/");
}

export async function saveContribution(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAuthenticated())) {
    return { ok: false, error: "Session expirée, recharge la page." };
  }

  const id = String(formData.get("id") ?? "").trim();
  const guestName = String(formData.get("guest_name") ?? "").trim();
  const item = String(formData.get("item") ?? "").trim();
  const category = String(formData.get("category") ?? "");

  if (category !== "food" && category !== "drink") {
    return { ok: false, error: "Choisis une catégorie : à manger ou à boire." };
  }

  if (!guestName || !item) {
    return { ok: false, error: "Il faut un nom et quelque chose à apporter !" };
  }
  if (guestName.length > 80 || item.length > 200) {
    return { ok: false, error: "C'est un peu long… raccourcis !" };
  }

  const supabase = getSupabase();
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
    : await supabase
        .from("contributions")
        .insert({ guest_name: guestName, item, category });

  if (error) {
    console.error("saveContribution failed:", error);
    return { ok: false, error: "Oups, ça n'a pas marché. Réessaie ?" };
  }

  revalidatePath("/");
  return { ok: true };
}
