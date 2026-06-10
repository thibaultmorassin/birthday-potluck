import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "party_session";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

function getPin(): string {
  return process.env.PARTY_PIN ?? "1234";
}

// The session token is just a hash of the PIN: changing PARTY_PIN
// invalidates every existing session. No real security by design.
function sessionToken(): string {
  return createHash("sha256").update(`party:${getPin()}`).digest("hex");
}

export function isValidPin(pin: string): boolean {
  return pin === getPin();
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: THIRTY_DAYS,
    path: "/",
  });
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === sessionToken();
}
