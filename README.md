# Star Spark

Star Spark is a playful reminder platform inspired by the "memories" project and built with the same conventions as hursey013's recent Node.js and Vite + Tailwind apps. It reconnects developers with their previously starred GitHub repositories through SendGrid-powered, Tailwind-styled emails and a whimsical web dashboard.

## Features

- **GitHub OAuth** authentication with cookie-based sessions and Prisma-backed persistence.
- **Curated digests** that remix your stars into themed highlights like "Fresh Sparks" and "Cosmic Serendipity".
- **Tailwind CSS email template** rendered through SendGrid with branded copy and deep links.
- **Cadence & filter controls** for notification email, cadence, languages, topics, and star thresholds.
- **Accessible Vite + React front-end** with consistent branding, responsive design, and account management (including deletion).
- **Background cron job** that respects cadence preferences and skips email delivery when SendGrid is not configured.

## Tech stack

| Area      | Tools |
|-----------|-------|
| Backend   | Node.js, Express, TypeScript, Prisma (SQLite), Passport (GitHub OAuth), SendGrid, node-cron |
| Frontend  | Vite, React, TypeScript, Tailwind CSS, Zustand, React Router |
| Tooling   | ESLint, Prettier, Vitest, tsup |

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   npm run prisma:generate --workspace @star-spark/api
   ```

2. **Create your environment file**

   ```bash
   cp .env.example .env
   ```

   Update the values with your GitHub OAuth credentials, SendGrid key (optional in non-production), and URLs.

3. **Run database migrations**

   ```bash
   npm run prisma:migrate --workspace @star-spark/api
   ```

4. **Start the development servers**

   In separate terminals run:

   ```bash
   npm run dev --workspace @star-spark/api
   npm run dev --workspace @star-spark/web
   ```

   The API listens on `http://localhost:4000` and the web client on `http://localhost:5173`.

5. **Authenticate with GitHub**

   Visit `http://localhost:5173` and click **Connect GitHub**. After authorizing, you'll land on the dashboard with a digest preview of your stars.

## Testing & linting

All linting, testing, and type-check commands are scoped per workspace:

```bash
npm run lint --workspaces
npm run test --workspaces
npm run typecheck --workspaces
```

Vitest runs light unit coverage (e.g., cadence logic) while linting enforces the same style conventions used in hursey013's other projects.

## Project structure

```
apps/
  api/        # Express API, Prisma schema, SendGrid integration
  web/        # Vite + React front-end with Tailwind styling
```

Key backend directories:

- `src/routes` – authentication, settings, stars preview, and account deletion endpoints.
- `src/services` – GitHub API client, reminder generator, and email delivery helpers.
- `src/jobs` – cron job that dispatches digests based on cadence.

Key frontend directories:

- `src/routes` – landing page, dashboard, settings, and account flows.
- `src/components` – shared Tailwind components (buttons, cards, form fields, nav).
- `src/store` – Zustand session store for authentication state.

## Email strategy

Star Spark crafts developer-centric digests with four highlight modes:

- **Fresh Sparks** – the newest stars to keep recent curiosity glowing.
- **Throwback Legends** – older favorites ready for a weekend deep dive.
- **Language Lounge** – clusters starring your most frequent programming language.
- **Cosmic Serendipity** – whimsical picks to inspire experimentation.

The email template mirrors the brand's Tailwind-driven aesthetic, renders in dark mode, and includes quick links back to the dashboard, settings, and account management.

## Deployment notes

- Set `SENDGRID_API_KEY` in production to enable email delivery. When absent, the API logs a warning and skips sending digests.
- Update `APP_BASE_URL` and `API_BASE_URL` to match your deployed origins.
- The cron schedule defaults to hourly in development and 14:00 UTC daily in production; adjust `startReminderJob` as needed.

---

Star Spark is designed to feel magical, optimistic, and builder-focused—encouraging developers to rediscover the projects that once lit up their imagination.
