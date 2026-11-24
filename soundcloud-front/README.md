# Allure Web (soundcloud-front)

> Frontend of the Allure music streaming app. See the [root README](../README.md) for the full project overview, architecture and screenshots.

Single-page application built with **React 19 + TypeScript + Vite**.

## Scripts

```bash
npm install      # the repo has no package-lock.json, so use install (not ci)
npm run dev      # dev server on http://localhost:5173
npm run build    # type check (tsc -b) + production build into dist/
npm run preview  # serve the production build locally
npm run lint     # ESLint
```

## Environment

Create `.env.local` (git-ignored) to override the defaults:

```dotenv
# Base URL of the API (axios instance). Default: http://localhost:5122/api
VITE_BASE_URL=http://localhost:5122/api
```

The backend must allow the frontend origin in its CORS policy (`http://localhost:5173` by default).

## Source layout

```
src/
├── components/   # layout (header, sidebar, footer), player, catalog & detail building blocks
├── pages/        # route pages: main_pages, detail, profile, admin, login_signup, support, subscription…
├── services/     # API clients (axios): tracks, albums, playlists, genres, follow, auth, admin
├── store/        # Redux Toolkit (user session) + Zustand (player, subscription)
├── styles/       # page and component CSS (Tailwind 4 + plain CSS)
├── utilities/    # axios instance, token helpers
└── App.tsx       # routes
```
