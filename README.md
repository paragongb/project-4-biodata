# personal_website

Gerard Bobby’s portfolio features a 3D shelf with projects, skills, GitHub activity, and a record player.
Built with Next.js, TypeScript, and React Three Fiber.

## Run locally

```bash
npm ci
cp .env.example .env.local   # optional: add keys (see below)
npm run dev                  # http://localhost:3000
```

`npm run build` creates a production build and type-checks everything.

## Where things live

| Path | What |
|---|---|
| `src/content/` | Projects, skills, profile, and shelf section labels |
| `src/components/shelf/scene.ts` | Shelf layout: which object sits in which cubby |
| `src/components/shelf/ShelfCanvas.tsx` | The 3D shelf (dark line art ⇄ clay) |
| `src/components/Panel.tsx` | Popup content for each section |
| `src/app/` | Pages (`/`, `/projects`, `/projects/[slug]`, `/resume`, `/about`) and API routes |
| `src/app/api/github` | Contribution data for the skyline (cached 1h) |
| `planning/`, `mockups/`, `designref/` | Local only (git-ignored): planning docs, UI prototypes, design reference |

## Environment variables

Every key is optional. The GitHub skyline uses the public contribution calendar by default. The account and displayed stat snapshot are set in `src/content/site.ts`.
Add them in **`.env.local`** for local dev and in **Vercel → Project → Settings → Environment Variables** for production. Never commit them.

| Key | For |
|---|---|
| `GITHUB_TOKEN` | Prefer GitHub GraphQL for the skyline (fine-grained PAT with read-only public repo access) |

## Deploy

1. Push to a GitHub repository you own.
2. Import that repository as a Next.js project in Vercel.
3. Add the environment variables, then **Deploy**. You get a `*.vercel.app` URL; every later push redeploys automatically.

## Credits

The 3D shelf and site foundations were adapted from [kuagabriel8/personal_website](https://github.com/kuagabriel8/personal_website/tree/82ca446). Gerard Bobby's version adds his portfolio content, certificate gallery, and terminal résumé.
