# Bask

**Bask** is a social network for the sports community. Players, Teams, Scouts and Fans can post content, follow each other, chat in real time, enter hashtag challenges with leaderboards, and find upcoming events. Admins get a separate panel to manage users, posts, events and challenges.

This repository is the **Next.js frontend** only. The REST API and Socket.IO server are a separate backend service hosted on Render (see [Backend](#backend)).

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Backend](#backend)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Testing & Code Quality](#testing--code-quality)
- [Deployment](#deployment)
- [Known Limitations](#known-limitations)

---

## Features

### Users (`/home`, `/profile`, `/messages`, `/events`, `/leaderboard`)

- **Accounts & roles** – Sign up as a Player, Team, Scout or Fan with email and password. The backend issues a JWT, stored in `localStorage`. Admin accounts are sent to `/admin` when they log in.
- **Feed & posts** – A paginated feed with infinite scroll. Posts can include text, images and videos (stored on Cloudinary by the backend), and support likes and comments.
- **AI post enhancement** – A Genkit flow running Gemini 2.5 Flash, called from a Next.js server action (`src/app/actions.ts`), rewrites a draft post with extra context such as a location, a time, a sports fact and hashtags.
- **Profiles** – Edit your profile picture, cover image and bio. See follower and following lists, and follow or unfollow other users.
- **Real-time messaging** – One-to-one and group conversations over Socket.IO, with typing indicators.
- **Events** – Browse upcoming events. The **Register** button links to an external Paystack payment page.
- **Challenges & leaderboard** – Challenges are identified by a hashtag. Users enter by posting with that hashtag, and the leaderboard ranks entrants by the total likes on their challenge posts.

### Admins (`/admin`)

- A dashboard with totals for users, posts and events
- Manage users, moderate posts and comments (delete), create events, create challenges, and view challenge leaderboards

---

## Architecture

```
┌──────────────────────────┐   REST (axios, JWT)    ┌──────────────────────────────┐
│  Next.js frontend        │ ─────────────────────▶ │  Bask backend (Render)       │
│  (this repo)             │                        │  /api/...  + Socket.IO       │
│                          │ ◀──── Socket.IO ─────▶ │  media stored on Cloudinary  │
│  server action ──▶ Genkit ──▶ Google Gemini       └──────────────────────────────┘
└──────────────────────────┘
```

- **API client:** `src/api/auth.ts` holds the shared axios instance and every API call. It attaches the `Authorization: Bearer <token>` header, and on a `401` response it clears the token and redirects to `/login`.
- **Auth state:** `src/context/auth-context.tsx` (`AuthProvider` / `useAuth`).
- **Realtime:** `src/lib/socket.ts` manages a single authenticated Socket.IO connection, and `src/lib/socketHelper.ts` holds the helpers built on it.
- **AI:** `src/ai/genkit.ts` configures Genkit, and `src/ai/flows/` contains the post-enhancement flow.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, Turbopack in dev) |
| Language | TypeScript, React 18 |
| Styling / UI | Tailwind CSS, [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives), lucide-react icons |
| Forms & validation | React Hook Form + Zod |
| HTTP | axios |
| Real-time | socket.io-client |
| AI | [Genkit](https://genkit.dev/) with the Google GenAI plugin (`gemini-2.5-flash`) |
| Hosting | Firebase App Hosting (`apphosting.yaml`) |
| Package manager | pnpm |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- [pnpm](https://pnpm.io/): `npm install -g pnpm`
- A [Gemini API key](https://aistudio.google.com/app/apikey) (only needed for the AI post enhancement)
- A running Bask backend (see [Backend](#backend))

### Setup

```bash
git clone https://github.com/mofopeadegoke/studio.git
cd studio
pnpm install
# create .env.local (see below)
pnpm dev
```

The app runs at **http://localhost:9002**. Visiting `/` redirects to `/login`.

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Used by Genkit's Google GenAI plugin for AI post enhancement
GEMINI_API_KEY=your_gemini_api_key

# Optional: origin of the Bask backend (REST API + Socket.IO), no trailing /api.
# Defaults to https://bask-backend-slo6.onrender.com
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

`.env*` files are git-ignored. Never commit secrets.

`NEXT_PUBLIC_*` variables are inlined at **build time**, so rebuild after changing `NEXT_PUBLIC_BACKEND_URL`.

---

## Backend

The frontend talks to a separately deployed backend. Both URLs come from `src/lib/config.ts`:

| Purpose | URL |
|---|---|
| REST API | `${NEXT_PUBLIC_BACKEND_URL}/api` |
| Socket.IO | `${NEXT_PUBLIC_BACKEND_URL}` |

To point the app at a different backend (e.g. a local one), set `NEXT_PUBLIC_BACKEND_URL` (see [Environment Variables](#environment-variables)). If it isn't set, the app uses the hosted backend at `https://bask-backend-slo6.onrender.com`.

**Troubleshooting API errors.** The backend runs on Render, so check it directly:

```bash
curl -sI https://bask-backend-slo6.onrender.com/ | grep -iE "^HTTP|x-render-routing"
```

- `x-render-routing: suspend` with a `503` means the Render service is **suspended**. Resume it, or check billing, in the Render dashboard.
- A slow first response (30–60s) that then succeeds means a free-tier instance was spinning up after being idle. This is expected.
- A `5xx` without that header means the backend itself is failing. Check the service logs in Render.

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the dev server on port 9002 (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint (`next lint`) |
| `pnpm typecheck` | Type-check with `tsc --noEmit` |
| `pnpm test` | Run the unit tests once (Vitest) |
| `pnpm test:watch` | Run the unit tests in watch mode |
| `pnpm genkit:dev` | Start the Genkit developer UI for testing AI flows |
| `pnpm genkit:watch` | Same, restarting when files change |

---

## Project Structure

```
src/
├── ai/
│   ├── genkit.ts            # Genkit + Gemini configuration
│   ├── dev.ts               # Entry point for the Genkit dev UI
│   └── flows/               # AI flows (post enhancement)
├── api/
│   ├── auth.ts              # axios client + all backend API calls
│   └── auth.test.ts         # Tests for the user mappers
├── app/
│   ├── (auth)/              # /login, /signup
│   ├── (app)/               # Authenticated user area (shared sidebar layout)
│   │   ├── home/            # Feed + create post
│   │   ├── profile/[userId] # Profile, followers/following, edit profile
│   │   ├── messages/        # Real-time chat
│   │   ├── events/          # Events and challenges
│   │   └── leaderboard/     # Challenge leaderboards
│   ├── admin/               # Admin panel (users, posts, events, challenges, leaderboard)
│   ├── auth/callback/       # Loads the user profile after authentication
│   ├── actions.ts           # Server actions (AI post enhancement)
│   ├── layout.tsx           # Root layout (fonts, AuthProvider, Toaster)
│   └── page.tsx             # Redirects to /login
├── components/
│   ├── app/                 # App components (post card, create-post form, event card, logo)
│   └── ui/                  # shadcn/ui components
├── context/auth-context.tsx # Auth state provider
├── hooks/                   # use-toast, use-mobile
├── lib/
│   ├── config.ts            # Backend URLs (reads NEXT_PUBLIC_BACKEND_URL)
│   ├── socket.ts            # Socket.IO connection management
│   ├── socketHelper.ts      # Conversation helpers
│   └── types.ts             # Shared types and Zod schemas
└── public/                  # Logos
```

---

## Testing & Code Quality

- **Unit tests:** [Vitest](https://vitest.dev/), configured in `vitest.config.mts`. Test files sit next to the code as `*.test.ts`. Run them with `pnpm test`.
- **Linting:** ESLint 9 with `next/core-web-vitals` and `next/typescript` (`eslint.config.mjs`).
- **Builds are strict:** `pnpm build` fails on any TypeScript or ESLint error, so run `pnpm typecheck && pnpm lint && pnpm test` before pushing.

---

## Deployment

The app is set up for **Firebase App Hosting**. `apphosting.yaml` sets `maxInstances: 1`. Set `GEMINI_API_KEY` (and `NEXT_PUBLIC_BACKEND_URL`, if you're not using the default backend) as secrets or environment variables in App Hosting.

Remote images are allowed from `res.cloudinary.com` only (`next.config.ts`).
