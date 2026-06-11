"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createProfile, selectProfile } from "@/app/actions";
import { avatarUrl, displayName } from "@/lib/avatar";
import { Button } from "@/components/ui/button";
import { InputField, InputGroup } from "@/components/ui/input-group";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { cn } from "@/lib/utils";
import type { Tables } from "../../database.types";

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
      <div className="grid w-full max-w-md grid-cols-3 gap-4 sm:grid-cols-4 md:max-w-2xl md:gap-6">
        {users.map((user) => (
          <button
            key={user.id}
            type="button"
            onClick={() => pick(user.id)}
            disabled={pendingId !== null}
            className={cn(
              "group flex cursor-pointer flex-col items-center gap-2 rounded-xl p-2 outline-none transition-opacity",
              "hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring",
              pendingId !== null && pendingId !== user.id && "opacity-40",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl(user.email, 192)}
              alt=""
              width={96}
              height={96}
              className={cn(
                "size-20 rounded-[20px] transition-transform group-hover:scale-105 md:size-24",
                pendingId === user.id && "animate-pulse",
              )}
            />
            <span className="max-w-full truncate text-[13px] text-muted-foreground group-hover:text-foreground md:text-[15px]">
              {displayName(user.email)}
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          disabled={pendingId !== null}
          className="group flex cursor-pointer flex-col items-center gap-2 rounded-xl p-2 outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-20 items-center justify-center rounded-[20px] border-2 border-dashed border-border text-muted-foreground transition-colors group-hover:border-foreground/30 group-hover:text-foreground md:size-24">
            <Plus className="size-8" aria-hidden />
          </span>
          <span className="text-[13px] text-muted-foreground group-hover:text-foreground md:text-[15px]">
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl(seed || "?", 128)}
          alt=""
          width={64}
          height={64}
          className="size-16 shrink-0 rounded-[16px]"
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
