"use client";

import { login } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";

export function PinForm() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <Input
        name="pin"
        type="password"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="••••"
        maxLength={8}
        required
        autoFocus
        aria-invalid={state && !state.ok ? true : undefined}
        aria-label="Code PIN"
        className="h-14 text-center text-2xl! tracking-[0.5em]"
      />
      {state && !state.ok ? (
        <p
          className="text-center text-[13px] text-destructive animate-in fade-in-0 duration-300 slide-in-from-bottom-5"
          key={state.error}
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <Button
        type="submit"
        size="lg"
        loading={pending}
        disabled={pending}
        className="w-full"
      >
        Entrer
      </Button>
    </form>
  );
}
