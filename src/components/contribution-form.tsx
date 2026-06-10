"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { saveContribution } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { InputField, InputGroup } from "@/components/ui/input-group";

export interface ContributionDraft {
  id: string;
  guest_name: string;
  item: string;
}

interface ContributionFormProps {
  contribution?: ContributionDraft;
  onSuccess: () => void;
}

export function ContributionForm({
  contribution,
  onSuccess,
}: ContributionFormProps) {
  const [state, formAction, pending] = useActionState(saveContribution, null);
  const [guestName, setGuestName] = useState(contribution?.guest_name ?? "");
  const [item, setItem] = useState(contribution?.item ?? "");

  useEffect(() => {
    if (state?.ok) {
      toast.success(contribution ? "C'est modifié !" : "Ajouté à la liste !");
      onSuccess();
    }
  }, [state, contribution, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {contribution ? (
        <input type="hidden" name="id" value={contribution.id} />
      ) : null}
      <InputGroup>
        <InputField
          index={0}
          name="guest_name"
          label="Qui ?"
          placeholder="Ton prénom"
          value={guestName}
          onChange={setGuestName}
          autoComplete="name"
          maxLength={80}
          required
        />
        <InputField
          index={1}
          name="item"
          label="Quoi ?"
          placeholder="Tarte aux pommes, rosé, chips…"
          value={item}
          onChange={setItem}
          maxLength={200}
          required
        />
      </InputGroup>
      {state && !state.ok ? (
        <p className="text-[13px] text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button
        type="submit"
        loading={pending}
        disabled={pending || !guestName.trim() || !item.trim()}
        className="w-full md:w-auto md:self-end"
      >
        {contribution ? "Enregistrer" : "Ajouter à la liste"}
      </Button>
    </form>
  );
}
