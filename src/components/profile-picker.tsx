"use client";

import { createProfile, selectProfile } from "@/app/actions";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { InputField, InputGroup } from "@/components/ui/input-group";
import { displayName } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import { ChevronRight, Plus } from "lucide-react";
import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type { Tables } from "../../database.types";
import { Avatar } from "./ui/avatar";

interface ProfilePickerProps {
  users: Tables<"users">[];
}

export function ProfilePicker({ users }: ProfilePickerProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const pick = (userId: string) => {
    setPendingId(userId);
    startTransition(async () => {
      const result = await selectProfile(userId);
      // selectProfile redirects on success; reaching here means it failed.
      if (result && !result.ok) {
        toast.error(result.error);
        setPendingId(null);
      }
    });
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-surface-2 shadow-surface-2">
        {users.map((user) => (
          <button
            key={user.id}
            type="button"
            onClick={() => pick(user.id)}
            disabled={pendingId !== null}
            className={cn(
              "flex w-full cursor-pointer items-center gap-3 border-b border-border px-4 py-3 text-left outline-none transition-colors md:px-5 md:py-3.5",
              "hover:bg-hover focus-visible:bg-hover",
              pendingId !== null && pendingId !== user.id && "opacity-40",
              pendingId === user.id && "animate-pulse",
            )}
          >
            <Avatar
              name={user.email}
              seedSize={96}
              className="size-10 shrink-0 rounded-full md:size-11"
            />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[14px] font-medium md:text-[15px]">
                {displayName(user.email)}
              </span>
              <span className="truncate text-[12px] text-muted-foreground md:text-[13px]">
                {user.email}
              </span>
            </span>
            <ChevronRight
              size={16}
              className="ml-auto shrink-0 text-muted-foreground"
              aria-hidden
            />
          </button>
        ))}

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          disabled={pendingId !== null}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left outline-none transition-colors hover:bg-hover focus-visible:bg-hover md:px-5 md:py-3.5"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground md:size-11">
            <Plus size={18} aria-hidden />
          </span>
          <span className="text-[14px] font-medium text-muted-foreground md:text-[15px]">
            Nouveau profil
          </span>
        </button>
      </div>

      <ResponsiveDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Crée ton profil"
        description="Ton email sert juste à te reconnaître — et à générer ta tête. 😄"
      >
        <NewProfileForm />
      </ResponsiveDialog>
    </>
  );
}

function NewProfileForm() {
  const [state, formAction, pending] = useActionState(createProfile, null);
  const [email, setEmail] = useState("");

  // Live avatar preview while typing.
  const seed = email.trim().toLowerCase();

  useEffect(() => {
    if (state && !state.ok) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Avatar
          name={seed || "?"}
          seedSize={128}
          width={56}
          height={56}
          className="size-14 shrink-0 rounded-full"
        />
        <p className="text-[13px] text-muted-foreground">
          {seed.includes("@")
            ? `Salut ${displayName(seed)} !`
            : "Ton avatar apparaît ici au fil de la saisie."}
        </p>
      </div>
      <InputGroup>
        <InputField
          index={0}
          name="email"
          type="email"
          label="Email"
          placeholder="toi@exemple.com"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          maxLength={254}
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
        disabled={pending || !seed.includes("@")}
        className="w-full md:w-auto md:self-end"
      >
        C&apos;est moi !
      </Button>
    </form>
  );
}
