# 🎂 Birthday Potluck

Petit site semi-public pour l'anniversaire : chaque invité entre un code PIN,
voit qui apporte quoi (à manger ou à boire), et peut ajouter ou modifier une ligne.

Mobile-first, construit avec :

- [Next.js 16](https://nextjs.org) (App Router, Server Actions)
- [shadcn/ui](https://ui.shadcn.com) + le registre [Fluid Functionalism](https://www.fluidfunctionalism.com/docs) (`@fluid`)
- [Supabase](https://supabase.com) pour le stockage
- Déployé sur [Vercel](https://vercel.com)

## Fonctionnement

1. L'invité arrive sur l'écran PIN (`/pin`). Le bon code pose un cookie de
   session (30 jours) — pas de « vraie » sécurité, c'est voulu.
2. Écran de profils façon Netflix (`/profiles`) : avatars générés par
   [DiceBear](https://www.dicebear.com) (style *fun-emoji*, seed = email).
   On choisit son profil ou on en crée un (juste un email).
3. La page d'accueil liste les contributions dans un tableau **Qui / Quoi /
   Type**, triable et filtrable.
4. « Ajouter » ouvre un `ResponsiveDialog` : Dialog (Fluid) sur desktop,
   Drawer en bas d'écran sur mobile. Le champ « Qui ? » est pré-rempli
   depuis le profil et en lecture seule.
5. Chacun ne peut modifier/supprimer que ses propres lignes : crayon →
   formulaire direct, corbeille → `AlertDialog` de confirmation.

Toute la base est accédée côté serveur avec la clé publishable ; des policies
RLS ouvrent select/insert/update (pas de delete) — semi-public, assumé.

## Setup

### 1. Supabase

Crée un projet sur [supabase.com](https://supabase.com), puis exécute
[`supabase/schema.sql`](supabase/schema.sql) dans le SQL editor.

### 2. Variables d'environnement

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet (Settings → API) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clé publishable (Settings → API) |
| `PARTY_PIN` | Le code à donner aux invités (défaut : `1234`) |

Pour une base existante créée avant l'ajout des catégories, exécute
[`supabase/migration-category-and-policies.sql`](supabase/migration-category-and-policies.sql).
Pour les profils (table `users` + colonne `user_id` + policies), exécute
[`supabase/migration-profiles.sql`](supabase/migration-profiles.sql).

Changer `PARTY_PIN` invalide toutes les sessions existantes.

### 3. Lancer en local

```bash
npm install
npm run dev
```

### 4. Déployer sur Vercel

```bash
npx vercel
```

Ajoute les trois variables d'environnement dans les settings du projet Vercel
(Production), puis redeploie. C'est tout.

## Composants UI

Le registre Fluid Functionalism est configuré dans `components.json` sous le
namespace `@fluid` :

```bash
npx shadcn@latest add @fluid/button        # composants Fluid
npx shadcn@latest add alert-dialog         # composants shadcn classiques
```

`src/components/responsive-dialog.tsx` combine le Dialog Fluid (desktop) et le
Drawer shadcn/vaul (mobile) derrière une seule API.
