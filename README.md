# Random Quotes

A small Next.js app for reading one approved quote at a time, filtering by category, and — once signed in — liking, adding, editing, or deleting quotes.

## Features

- Home page shows a single quote and a **Next Quote** button that picks another one at random
- Category filter: All, Life, Health, Motivation, Wisdom (`/?category=life`)
- Auth0 login and logout
- Signed-in users can add a quote, edit or delete quotes they created, and like or unlike approved quotes
- Liked quotes live on `/user/quotes/liked`
- Light, dark, and system theme
- Quote forms are validated with Zod on both the client and the server

New and edited quotes are saved with `adminApproved: false`. The home page, the liked list, and `GET /api/quotes` only return quotes where `adminApproved` is `true`. There is no admin screen in the app. To publish a quote, set `adminApproved` to `true` in MongoDB.

Editing a quote sets `adminApproved` back to `false`, so it leaves the public feed until it is approved again. Only the user who created a quote can edit or delete it.

## Stack

- Next.js (App Router) and React
- Auth0 (`@auth0/nextjs-auth0`)
- MongoDB
- Tailwind CSS, Radix UI, and shadcn-style components
- React Hook Form and Zod
- `next-themes`

## Routes

| Path | Who can open it | What it does |
| --- | --- | --- |
| `/` | Anyone | One approved quote, category filter, like, next quote |
| `/user/quotes/new` | Signed-in | Create a quote |
| `/user/quotes/edit/[id]` | Owner | Edit that quote |
| `/user/quotes/delete?id=` | Owner | Confirm and delete that quote |
| `/user/quotes/liked` | Signed-in | Quotes the current user has liked |
| `/api/quotes` | Anyone | JSON list of approved quotes |
| `/auth/login`, `/auth/logout`, `/auth/callback` | Auth0 | Sign-in flow |

Protected pages live under `src/app/(protected)` and redirect to `/auth/login` when there is no session.

## Quote document

Collection name: `quotes` (`MONGODB_DB_NAME`).

| Field | Meaning |
| --- | --- |
| `quote` | Quote text |
| `author` | Author name |
| `category` | One of `life`, `health`, `motivation`, `wisdom` |
| `createdBy` | Auth0 user id (`sub`) |
| `adminApproved` | Public only when `true` |
| `likedBy` | Auth0 user ids |
| `likeCount` | Length of `likedBy` |
| `createdAt`, `updatedAt` | Dates |

## Local setup

Requirements: Node.js, npm, a MongoDB database, and an Auth0 application (Regular Web Application).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Create a `.env.local` in the project root:

```bash
MONGODB_URI=
MONGODB_DB_NAME=

APP_BASE_URL=http://localhost:3000
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_SECRET=
```

`AUTH0_SECRET` is a long random string used to encrypt the session cookie. Generate one with:

```bash
openssl rand -hex 32
```

In the Auth0 application settings, for local development:

- Allowed Callback URLs: `http://localhost:3000/auth/callback`
- Allowed Logout URLs: `http://localhost:3000`
- Allowed Web Origins: `http://localhost:3000`

Auth0 routes are handled in `src/proxy.ts`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint |

## Project layout

```text
src/app/                  Home page, providers, API route
src/app/(protected)/      Pages that require a session
src/components/           Nav, quote card, form, theme switcher
src/lib/db.ts             MongoDB client
src/lib/auth0.js          Auth0 client
src/types/quotes.ts       Quote shape and Zod schema
```

