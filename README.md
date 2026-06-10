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
2. La page d'accueil liste les contributions dans un tableau **Qui / Quoi**.
3. « Ajouter » ouvre un `ResponsiveDialog` : Dialog (Fluid) sur desktop,
   Drawer en bas d'écran sur mobile.
4. Taper une ligne ouvre d'abord un `AlertDialog` de confirmation
   (« Modifier cette ligne ? »), puis le formulaire pré-rempli.

Toute la base est accédée côté serveur avec la clé service role ; la table a
RLS activé sans policy, donc la clé anon ne donne accès à rien.

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
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (Settings → API, garde-la secrète) |
| `PARTY_PIN` | Le code à donner aux invités (défaut : `1234`) |

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
