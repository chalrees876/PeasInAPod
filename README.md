# PeasInAPod

A podcast social platform — like Goodreads, but for podcasts. Track what you're listening to, discover new shows, and write reviews.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env` and fill in your credentials:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |
| `GITHUB_CLIENT_ID/SECRET` | [GitHub OAuth Apps](https://github.com/settings/applications/new) — callback: `http://localhost:3000/api/auth/callback/github` |
| `GOOGLE_CLIENT_ID/SECRET` | [Google Console](https://console.cloud.google.com/) — callback: `http://localhost:3000/api/auth/callback/google` |
| `PODCAST_INDEX_API_KEY/SECRET` | [Podcast Index](https://api.podcastindex.org/) — free account |

### 3. Set up the database
```bash
npx prisma migrate dev --name init
```

### 4. Run the dev server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Features

- **Discover** — search 4M+ podcasts via Podcast Index API, browse trending by category
- **Shelves** — mark podcasts as Currently Listening / Want to Listen / Finished / Dropped
- **Reviews** — rate (1–5 stars) and review any podcast
- **Auth** — sign in with GitHub or Google

## Tech stack

- Next.js 15 (App Router)
- Prisma 5 + PostgreSQL
- NextAuth v5 (Beta)
- Tailwind CSS
- Podcast Index API
