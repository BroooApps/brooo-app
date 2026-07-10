# Dearly SEO/AIO Content Hub — Design Spec

**Date:** 2026-07-10
**Status:** Approved (Swapnil, 2026-07-10)
**Goal:** Make brooo.app/dearly generate organic search + AI-assistant traffic and convert it to Play Store installs. Success proxy: pages indexed and impressions visible in 4–8 weeks; contributes to the 100-organic-DAU goal for Dearly.

## Context

Dearly (voice journal for Android, `com.broooapps.dearly`) just went live on Play. The existing `/dearly/` page tree (landing, privacy, terms, delete-account) is presentational only: it still says beta, has no store link, and a single landing page ranks for nothing beyond the brand name. Search and AI-citation traffic requires content pages answering real queries.

## Scope

Four workstreams. No app-code changes. SMM kit explicitly out of scope (future add-on).

### 1. Funnel fixes (existing pages)

- `src/data/apps.ts`: Dearly `status: 'beta'` → `'live'`, remove `betaDate`, add
  `playStoreUrl: 'https://play.google.com/store/apps/details?id=com.broooapps.dearly'`.
  Every existing CTA surface (AppHero, AppCard, Pricing, AppFooter) should light up with the install link — verify each renders it.
- `src/pages/dearly/index.astro`: replace the 5-field JSON-LD stub with a full
  `SoftwareApplication`: `name`, `operatingSystem: 'Android'`,
  `applicationCategory: 'LifestyleApplication'`, `description`, `url`,
  `downloadUrl`/`installUrl` (Play link), `screenshot` (absolute URLs),
  `offers` as an array: free tier (price 0) and Dearly Pro ($24.99/yr, USD).
  **No `aggregateRating`** until real reviews exist.
- Cloudflare Web Analytics: add the beacon snippet to `Base.astro` (site-wide),
  token from the Cloudflare dashboard (pending from launch to-do). If the token
  isn't at hand during implementation, leave a clearly-marked follow-up task —
  do not block the content work on it.

### 2. Content architecture

- Astro **content collection** `guides` at `src/content/guides/*.md` with schema
  (zod, `src/content/config.ts`): `title`, `description`, `pubDate`, `updatedDate?`,
  `targetQueries` (string[], for our own tracking), `draft?`.
- New `GuideLayout.astro`: renders a guide with
  - `Article` JSON-LD (headline, description, datePublished, dateModified, author = BroooApps),
  - `BreadcrumbList` JSON-LD + visible breadcrumb (Home → Dearly → Guides → page),
  - install CTA block (Play badge + one-liner) mid-article and at end,
  - "More guides" cross-link footer listing the other guides,
  - canonical URL, per-page meta description + OG tags (reuse `/og/dearly.png`).
- Routes: `src/pages/dearly/guides/[...slug].astro` renders the collection at
  `/dearly/guides/<slug>/`; `src/pages/dearly/guides/index.astro` is a simple
  linked index. Landing page gains a "guides" section linking to all of them.
- Sitemap: `@astrojs/sitemap` picks new routes up automatically — verify in build output.

### 3. The pages

Guide body copy in **sentence case** (brand lowercase stays in chrome/headlines). Each guide: direct factual claims, Q&A-shaped H2/H3s, written to be quotable by AI engines. Lengths are targets, not padding quotas.

| Page | URL slug | Target query cluster | ~Words |
|---|---|---|---|
| Voice journaling: a complete guide | `voice-journaling-guide` | voice journaling, audio journal, journal by speaking | 1,500–2,000 |
| How to journal when you hate writing | `journal-when-you-hate-writing` | can't stick to journaling, journaling without writing, journal by talking | 900–1,200 |
| A voice journal that doesn't upload your audio | `private-voice-journal` | private voice journal app, voice journal privacy | 900–1,200 |
| Best voice journaling apps for Android (2026) | `best-voice-journaling-apps-android` | best voice journal app android, voice diary app | 1,200–1,500 |
| FAQ (standalone page, not a guide) | `/dearly/faq/` | long-tail "does dearly…" questions | 10–12 Q&As |

- **Comparison page:** research the real competitor set at implementation time
  (WebSearch — e.g. Day One, AudioPen-adjacent tools, voice diary apps current in 2026).
  Honest treatment: real strengths of competitors, Dearly listed in its lane
  (on-device audio privacy, paper aesthetic, mood insights). Honest comparisons get
  cited; shill pages don't. Include a feature/price comparison table.
- **Privacy guide:** states the model plainly and accurately per the app's actual
  behavior (must match privacy policy): recordings stay on-device, transcription
  travels encrypted, biometric lock, full deletion. No claims beyond the policy.
- **FAQ page:** `FAQPage` JSON-LD. Questions: what is Dearly, price/trial mechanics
  (10 free transcriptions/day, $24.99/yr or $2.99/mo, 7-day trial), does audio leave
  the device, offline behavior, data deletion, Android versions, export, iOS plans
  (answer honestly: Android-only today). Cross-link privacy ↔ FAQ ↔ delete-account.

### 4. AIO layer

- `public/llms.txt`: plain-text site map per the llms.txt convention — brooo.app
  one-liner, then a factual Dearly block (what it is, pricing, privacy model, Play
  link, guide URLs), brief entries for other live apps (Sutts, Randomizer).
- Consistent entity string across all pages: **"Dearly — voice journal app for
  Android by BroooApps."**

## Error handling / correctness constraints

- All factual claims about the app (pricing, limits, privacy) must match
  `apps.ts` + the live privacy policy — single source of truth is the app's actual
  behavior; when unsure, check the VoiceLog repo or ask.
- Competitor claims must come from research done at write time, dated "2026".
- Build must pass `npm run build` with zero new warnings; verify all new URLs in
  `dist/` and in the sitemap before deploy.

## Deploy

Manual, per CLAUDE.md: `npm run build` → `npx wrangler deploy`. Post-deploy: curl
the new trailing-slash URLs, spot-check JSON-LD with a validator, request indexing
for the new URLs in Google Search Console (if property exists — else flag as
follow-up to set up GSC, which this project should have anyway).

## Out of scope

- SMM kit (reel scripts, Reddit posts, X/LinkedIn copy) — option C, future add-on.
- brooo.app-wide blog; guides live under `/dearly/` only.
- Any Dearly app-code changes; `aggregateRating` schema until real reviews exist.
