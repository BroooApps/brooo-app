# CLAUDE.md — broooapps-site (brooo.app)

Marketing + legal site for BroooApps. One static site, one page tree per app
(`/<slug>/`, `/<slug>/privacy`, `/<slug>/terms`, `/<slug>/delete-account`).

## Tech
- **Astro** (static output — no SSR adapter). Build emits pure static HTML to `dist/`.
- **@astrojs/sitemap** — generates `sitemap-index.xml`. `site` is `https://brooo.app`.
- Node **>= 22.12.0**.

## Hosting / deploy (READ THIS BEFORE DEPLOYING)
brooo.app is served by an **assets-only Cloudflare Worker** named **`brooo-app`**
(NOT Cloudflare Pages — there are zero Pages projects). The custom domain
`brooo.app` is attached to that Worker in the `brooo.app` zone (production).

- **There is NO Git auto-deploy.** Pushing to GitHub does nothing. Deploys are
  **manual via `wrangler deploy`**. (History: created via the "Deploy to
  Cloudflare" template, then maintained by hand with wrangler.)
- Cloudflare account: `Swapniltiwari775@gmail.com's Account`
  (`a1ce3b64374288f239b417c4716d48f5`).

### Deploy steps
```bash
# one-time per machine: authenticate wrangler (opens browser OAuth)
npx --yes wrangler@latest login

# every deploy:
npm run build                 # regenerate dist/
npx --yes wrangler@latest deploy   # uploads dist/ to the brooo-app Worker
```
`wrangler deploy` reads `wrangler.jsonc` (Worker name `brooo-app`, `assets.directory = ./dist`).
Deploying the same Worker name preserves the `brooo.app` custom domain.

### Verify after deploy
```bash
# canonical URLs use a TRAILING SLASH; the no-slash path 307-redirects to it.
curl -s -o /dev/null -w "%{http_code}\n" -L https://brooo.app/dearly/privacy/
curl -s -o /dev/null -w "%{http_code}\n" -L https://brooo.app/dearly/delete-account/
```
Cloudflare's edge caches responses (incl. 404s). Right after a deploy, a newly
added path may briefly show a stale 404 on the no-slash URL — confirm with the
trailing-slash URL or a `?cb=<random>` cache-buster before worrying.

### Notes / gotchas
- The live Worker also had autoconfig bindings `IMAGES` and `SESSION` (KV) added
  by the "Deploy to Cloudflare" template. They are **inert for a static site**
  (no Cloudflare/SSR adapter). `wrangler.jsonc` omits them, so a deploy drops
  them — harmless today. If the site ever moves to SSR, re-add them here.
- No `wrangler.toml` — config is `wrangler.jsonc`.

## Structure
```
src/
├── pages/<slug>/{index,privacy,terms,delete-account}.astro   # one folder per app
├── layouts/    Base.astro, PrivacyLayout.astro, TermsLayout.astro
├── components/ Nav, Footer, AppFooter, Breadcrumb, Hero, Pricing, ...
└── data/apps.ts   # app registry: slug, name, status, pricing, screenshots. getApp(slug)
```

### Adding a legal page for an app
1. Confirm the app exists in `src/data/apps.ts` (`getApp('<slug>')` must resolve).
2. Add `src/pages/<slug>/<page>.astro`. For privacy, reuse `PrivacyLayout`
   (`<PrivacyLayout appSlug="<slug>" lastUpdated="YYYY-MM-DD">`). For a custom
   header (e.g. account deletion), import `Base`/`Nav`/`Breadcrumb`/`AppFooter`
   directly (see `src/pages/dearly/delete-account.astro`).
3. Cross-link related pages (privacy ↔ delete-account).
4. `npm run build` then deploy.

## Conventions
- Slugs are lowercase, match the app registry (e.g. `dearly`, not `voicelog`).
  When renaming an app's slug, rename the `src/pages/<slug>/` folder AND update
  `apps.ts`; old URLs will 404 until the next deploy.
- Match existing component/layout patterns; keep pages presentational.
- Conventional commits: `feat(<slug>): ...`, `chore: ...`.
