"use client";

import { saveContribution } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { InputField, InputGroup } from "@/components/ui/input-group";
import { RadioGroup, RadioItem } from "@/components/ui/radio-group";
import { CATEGORIES } from "@/lib/categories";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Enums, Tables } from "../../database.types";

interface ContributionFormProps {
  contribution?: Tables<"contributions">;
  /** Display name of the selected profile — fills the read-only "Qui ?" field. */
  guestName: string;
  onSuccess: () => void;
}

export function ContributionForm({
  contribution,
  guestName,
  onSuccess,
}: ContributionFormProps) {
  const [state, formAction, pending] = useActionState(saveContribution, null);
  const [item, setItem] = useState(contribution?.item ?? "");
  const [category, setCategory] = useState<Enums<"contribution_category">>(
    (contribution?.category as Enums<"contribution_category">) ?? "food",
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success(contribution ? "C'est modifié !" : "Ajouté à la liste !");
      onSuccess();
    }
  }, [state, contribution, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-1">
        <legend className="pl-3 pb-1 text-[13px] text-muted-foreground">
          Catégorie
        </legend>
        <RadioGroup
          selectedIndex={Object.keys(CATEGORIES).indexOf(category)}
          className="max-w-1/2"
        >
          {(Object.keys(CATEGORIES) as Enums<"contribution_category">[]).map(
            (key, i) => (
              <RadioItem
                key={key}
                index={i}
                label={`${CATEGORIES[key].emoji} ${CATEGORIES[key].label}`}
                selected={category === key}
                onSelect={() => setCategory(key)}
              />
            ),
          )}
        </RadioGroup>
      </fieldset>
      {contribution ? (
        <input type="hidden" name="id" value={contribution.id} />
      ) : null}
      <input type="hidden" name="category" value={category} />
      <InputGroup>
        {/* Auto-filled from the selected profile; the server derives the
            name from the session anyway, this field is display-only. */}
        <InputField
          index={0}
          name="guest_name"
          label="Qui ?"
          value={guestName}
          onChange={() => {}}
          readOnly
          tabIndex={-1}
          className="opacity-70"
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
        disabled={pending || !item.trim()}
        className="w-full md:w-auto md:self-end"
      >
        {contribution ? "Enregistrer" : "Ajouter à la liste"}
      </Button>
    </form>
  );
}
