# git wrapped

Paste a GitHub username → get roasted by your own commit history. No login, no
nonsense. A single minimal page, deployable to Vercel with zero config.

![preview](https://git-wrapped.vercel.app/api/og?u=torvalds)

## What it does

- Pulls a user's recent public commits via the GitHub **commit search API**
  (the only public endpoint that still returns commit messages + author-local
  timestamps).
- Turns them into affectionate burns: too many `"fix"` commits, 2am pushes,
  weekend grinding, one-word messages, repo obsession, etc.
- Spits out a shareable card with a 0–100 "chaos score" and a dev-spirit title.
- Every result has a shareable URL (`/?u=username`) with a **dynamic OG image**,
  so links unfurl into the card on X / Slack / Discord.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

## Deploy to Vercel

```bash
npm i -g vercel      # if you don't have it
vercel               # preview
vercel --prod        # production
```

Or push to GitHub and import the repo at vercel.com — it auto-detects Next.js.

## ⚠️ The rate limit (read this before going viral)

GitHub's API is rate-limited **per IP**, and unauthenticated it's tiny:

| Resource        | Unauthenticated | With `GITHUB_TOKEN` |
| --------------- | --------------- | ------------------- |
| Commit search   | 10 / min        | 30 / min            |
| Core (profile)  | 60 / hour       | 5,000 / hour        |

Vercel functions share outbound IPs, so **without a token you'll throttle fast**
under any real traffic. To fix:

1. Create a fine-grained / classic PAT at github.com/settings/tokens
   (no scopes needed — public data only).
2. Add it in Vercel → Project → Settings → Environment Variables:
   `GITHUB_TOKEN=ghp_...`
3. Redeploy.

Responses are edge-cached for 10 min (`s-maxage=600`), so repeat lookups of the
same username are free. For true scale, add a KV cache (Upstash/Vercel KV) keyed
by username, and/or rotate multiple tokens.

## Stack

- Next.js 15 (App Router) + React 19
- Tailwind CSS (monochrome theme)
- `next/og` for dynamic share images
- `html-to-image` for the "download PNG" button

## Layout

```
app/
  page.tsx            server component — dynamic OG metadata
  layout.tsx
  globals.css
  api/roast/route.ts  JSON roast endpoint (?u=username)
  api/og/route.tsx    dynamic OG image (?u=username)
components/
  RoastApp.tsx        client UI (input + result + share buttons)
  RoastCard.tsx       the card
lib/
  roast.ts            the roast engine (all the burns live here)
```

Tweak the burns, scoring, and titles in `lib/roast.ts`.
