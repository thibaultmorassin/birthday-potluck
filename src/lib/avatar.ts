// Generated avatars via the DiceBear HTTP API (https://www.dicebear.com).
// "fun-emoji" draws a goofy emoji face deterministically derived from the seed.
export function avatarUrl(seed: string, size = 96): string {
  return `https://api.dicebear.com/10.x/thumbs/svg?seed=${encodeURIComponent(
    seed,
  )}&size=${size}&radius=50`;
}
