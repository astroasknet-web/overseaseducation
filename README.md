# GrowQR Overseas Education

Standalone codebase for the **GrowQR Overseas Education** vertical of GrowQR, extracted from
[astroasknet-web/growqr.ai-final](https://github.com/astroasknet-web/growqr.ai-final) so it can be deployed on its own domain.

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind, MySQL, Razorpay, Resend.

## What is in this repo

- `/overseas-packages` — **Country packages**: Compare study-abroad packages by country, with what is included at each stage.
- `/study-abroad` — **Study destinations**: Explore countries and their partner universities, then shortlist the ones that fit your profile.
- `/ielts` — **IELTS preparation**: Lessons, writing and speaking practice, and full mock tests.
- `/abroad` — **My overseas journey**: Profile, matches, documents, visa, funds, loans and interview practice in one dashboard.
- `/counselor` — **Counsellor desk**: For counsellors: manage students, review journeys and run mock interviews.

It also carries the shared platform pieces the vertical needs to work end to end: sign-in and sign-up (`app/(auth)`), the portal shell
(`app/(portal)`), account, billing, support tickets, checkout and payments (`app/api/v1`, `app/api/razorpay`), the staff console and the
Skill Passport.

Only code the vertical actually imports is included. Routes that belong to another GrowQR vertical are not here; `middleware.ts` sends them
to the main site (`MARKETING_URL`, default https://growqr.ai). Set `SITE_MODE=full` to disable that redirect.

## Run it

```bash
npm install
cp migration/env.example .env.local   # fill in DATABASE_URL and the keys you need
npm run portal:migrate                # applies db/migrations to the MySQL database
npm run dev
```

Open http://localhost:3000. Without `DATABASE_URL` the public pages render, but sign-in, applications and payments need the database.

## Environment

See `migration/env.example`. Extra variables for the split:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` / site URL in `lib/seo.ts` | Canonical URL of this domain |
| `MARKETING_URL` | Where paths from other verticals are redirected (default https://growqr.ai) |
| `SITE_MODE=full` | Serve every route from this host instead of redirecting |

## Database

All GrowQR verticals share one schema, so `db/migrations` is the complete, ordered set. Point several domains at the same MySQL database to
share accounts and the Skill Passport across verticals, or give each its own database.

## Scripts

`npm run build` · `npm run start` · `npm test` · `npm run portal:migrate` · `npm run demo:admin`

Source of truth for shared platform code is the main repository; port fixes made there into this repo when they touch shared files.
