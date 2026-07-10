# Dearly SEO/AIO Content Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make brooo.app/dearly generate organic search + AI-assistant traffic (guides, FAQ, llms.txt) and convert it via a live Play Store CTA.

**Architecture:** Astro 6 static site. New `guides` content collection (`src/content/guides/*.md`) rendered by one `GuideLayout.astro` via a `[...slug].astro` route under `/dearly/guides/`. Standalone FAQ page with `FAQPage` schema. Enriched `SoftwareApplication` JSON-LD on the landing page. `llms.txt` for AI crawlers.

**Tech Stack:** Astro ^6.2.2 (content collections via `astro:content` + `glob` loader), @astrojs/sitemap, Cloudflare Worker static assets (manual `wrangler deploy`).

**Spec:** `docs/superpowers/specs/2026-07-10-dearly-seo-content-hub-design.md`

## Global Constraints

- Node `>=22.12.0`; Astro `^6.2.2`; **no new runtime dependencies**.
- Play Store URL, exact: `https://play.google.com/store/apps/details?id=com.broooapps.dearly`
- Entity string used consistently: **"Dearly — voice journal app for Android by BroooApps."**
- Guide/FAQ **body text in sentence case**; site chrome and headlines may keep the lowercase brand voice.
- Every factual claim about the app (pricing, limits, privacy) must match `src/data/apps.ts` and the live privacy policy (`src/pages/dearly/privacy.astro`). When unsure, check the app repo at `~/Projects/Android/VoiceLog` — do not invent facts.
- **No `aggregateRating`** JSON-LD anywhere (no real reviews yet).
- Canonical URLs use trailing slashes (`/dearly/guides/<slug>/`).
- Conventional commits: `feat(dearly): ...`, `chore: ...`.
- Do NOT deploy until Task 9. `npm run build` must pass with zero new warnings after every task.
- "Verify" steps use `grep` against `dist/` output — this repo has no unit-test framework; the build IS the test.

## Delegation guide (token saving)

| Task | Delegable to Sonnet subagent? |
|---|---|
| 1, 2, 3, 8, 9 | Yes — mechanical, complete code given |
| 4, 5 | Yes — full outline + voice guide given; main loop reviews prose |
| 6 | Yes, but subagent MUST use WebSearch for competitor facts; main loop fact-checks |
| 7 | Yes — Q&A copy given verbatim |
| 10 | User-assisted (GSC + analytics token) — main loop drives |

---

### Task 1: Flip Dearly to live with Play Store URL

**Files:**
- Modify: `src/data/apps.ts:103-104` (the dearly entry)

**Interfaces:**
- Produces: `getApp('dearly').playStoreUrl` (string) and `status === 'live'` — consumed by AppHero/AppCard/Pricing/AppFooter CTAs and by Tasks 2, 3, 7.

- [ ] **Step 1: Edit the dearly entry**

In `src/data/apps.ts`, replace:

```ts
    status: 'beta',
    betaDate: 'JUN 26',
```

with:

```ts
    status: 'live',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.broooapps.dearly',
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 3: Verify CTAs render**

Run: `grep -c "id=com.broooapps.dearly" dist/dearly/index.html && grep -o "LIVE ON GOOGLE PLAY" dist/dearly/index.html | head -1 && grep -c "id=com.broooapps.dearly" dist/index.html`
Expected: count ≥ 1 in both files; `LIVE ON GOOGLE PLAY` printed. Also confirm no remaining `BETA · SHIPS`: `grep -c "BETA · SHIPS" dist/dearly/index.html` → `0` (grep exits 1, that's fine).

- [ ] **Step 4: Commit**

```bash
git add src/data/apps.ts
git commit -m "feat(dearly): flip to live with Play Store URL"
```

---

### Task 2: Full SoftwareApplication JSON-LD on the landing page

**Files:**
- Modify: `src/pages/dearly/index.astro:17-24` (the `jsonLd` const)

**Interfaces:**
- Consumes: `app.playStoreUrl`, `app.screenshots`, `app.pricing` from Task 1 / `apps.ts`.

- [ ] **Step 1: Replace the JSON-LD stub**

In `src/pages/dearly/index.astro`, replace the existing `const jsonLd = {...};` block with:

```ts
const siteUrl = 'https://brooo.app';
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Dearly',
  alternateName: 'Dearly — voice journal app for Android by BroooApps',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Android',
  description: app.hero?.blurb,
  url: `${siteUrl}/dearly/`,
  installUrl: app.playStoreUrl,
  downloadUrl: app.playStoreUrl,
  screenshot: (app.screenshots ?? []).map((s) => `${siteUrl}${s}`),
  author: { '@type': 'Organization', name: 'BroooApps', url: siteUrl },
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'USD',
      description: app.pricing?.free.description,
    },
    {
      '@type': 'Offer',
      name: 'Dearly Pro (yearly)',
      price: '24.99',
      priceCurrency: 'USD',
      description: app.pricing?.premium?.description,
    },
    {
      '@type': 'Offer',
      name: 'Dearly Pro (monthly)',
      price: '2.99',
      priceCurrency: 'USD',
      description: '7-day free trial, then $2.99/month.',
    },
  ],
};
```

- [ ] **Step 2: Build and verify**

Run: `npm run build && grep -o '"installUrl":"[^"]*"' dist/dearly/index.html && grep -c '"@type":"Offer"' dist/dearly/index.html`
Expected: installUrl shows the Play URL; Offer count output contains `3` occurrences (grep -c counts lines; JSON-LD is one line so use: `grep -o '"@type":"Offer"' dist/dearly/index.html | wc -l` → `3`).

- [ ] **Step 3: Commit**

```bash
git add src/pages/dearly/index.astro
git commit -m "feat(dearly): full SoftwareApplication JSON-LD with offers + screenshots"
```

---

### Task 3: Guides content collection + GuideLayout + routes (scaffold, shipped with the privacy guide)

**Files:**
- Create: `src/content.config.ts`
- Create: `src/layouts/GuideLayout.astro`
- Create: `src/pages/dearly/guides/[...slug].astro`
- Create: `src/pages/dearly/guides/index.astro`
- Create: `src/content/guides/private-voice-journal.md`

**Interfaces:**
- Produces: collection `guides` with frontmatter schema `{ title: string, description: string, pubDate: date, updatedDate?: date, targetQueries: string[], draft: boolean (default false) }`. Guide URL shape `/dearly/guides/<file-name-without-.md>/`. `GuideLayout` takes prop `guide: CollectionEntry<'guides'>`. Tasks 4–6 only add `.md` files.

- [ ] **Step 1: Create `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    targetQueries: z.array(z.string()),
    draft: z.boolean().default(false),
  }),
});

export const collections = { guides };
```

- [ ] **Step 2: Create `src/layouts/GuideLayout.astro`**

```astro
---
import Base from './Base.astro';
import Nav from '../components/Nav.astro';
import AppFooter from '../components/AppFooter.astro';
import { getApp } from '../data/apps';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

interface Props {
  guide: CollectionEntry<'guides'>;
}
const { guide } = Astro.props;
const app = getApp('dearly');
if (!app) throw new Error('dearly app missing from apps.ts');

const siteUrl = 'https://brooo.app';
const pageUrl = `${siteUrl}/dearly/guides/${guide.id}/`;
const published = guide.data.pubDate.toISOString().slice(0, 10);
const modified = (guide.data.updatedDate ?? guide.data.pubDate).toISOString().slice(0, 10);
const others = await getCollection('guides', ({ id, data }) => !data.draft && id !== guide.id);

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: guide.data.title,
  description: guide.data.description,
  datePublished: published,
  dateModified: modified,
  author: { '@type': 'Organization', name: 'BroooApps', url: siteUrl },
  publisher: { '@type': 'Organization', name: 'BroooApps', url: siteUrl },
  mainEntityOfPage: pageUrl,
  about: {
    '@type': 'SoftwareApplication',
    name: 'Dearly',
    operatingSystem: 'Android',
    url: `${siteUrl}/dearly/`,
    installUrl: app.playStoreUrl,
  },
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'brooo.app', item: `${siteUrl}/` },
    { '@type': 'ListItem', position: 2, name: 'Dearly', item: `${siteUrl}/dearly/` },
    { '@type': 'ListItem', position: 3, name: 'Guides', item: `${siteUrl}/dearly/guides/` },
    { '@type': 'ListItem', position: 4, name: guide.data.title, item: pageUrl },
  ],
};
---
<Base
  title={`${guide.data.title} | Dearly`}
  description={guide.data.description}
  ogImage="/og/dearly.png"
>
  <script slot="head" type="application/ld+json" set:html={JSON.stringify(articleLd)} />
  <script slot="head" type="application/ld+json" set:html={JSON.stringify(breadcrumbLd)} />
  <Nav />
  <main id="main">
    <div class="crumbs">
      <div class="container">
        <a href="/">brooo.app</a> / <a href="/dearly/">dearly</a> / <a href="/dearly/guides/">guides</a> / <span class="crumbs__current">{guide.id}</span>
      </div>
    </div>
    <article class="container guide">
      <header class="guide__header">
        <h1>{guide.data.title}</h1>
        <p class="guide__meta">
          published {published}{guide.data.updatedDate ? ` · updated ${modified}` : ''} · by broooapps
        </p>
        <p class="guide__desc">{guide.data.description}</p>
      </header>
      <div class="guide__body">
        <slot />
      </div>
      <aside class="guide__cta">
        <p>
          <strong>Dearly — voice journal app for Android by BroooApps.</strong>
          tap the ink drop, talk for a minute, and it writes itself.
          recordings never leave your device. 10 free transcriptions a day.
        </p>
        <a href={app.playStoreUrl} target="_blank" rel="noopener">[ INSTALL ON PLAY STORE ↗ ]</a>
      </aside>
      <footer class="guide__more">
        <h2>more guides</h2>
        <ul>
          {others.map((o) => (
            <li><a href={`/dearly/guides/${o.id}/`}>{o.data.title}</a></li>
          ))}
        </ul>
        <p><a href="/dearly/faq/">dearly faq</a> · <a href="/dearly/">about dearly</a></p>
      </footer>
    </article>
  </main>
  <AppFooter app={app} />
</Base>

<style>
  .crumbs {
    border-bottom: 1px dashed var(--border);
    padding: 16px 0;
    font-size: 12px;
    color: var(--muted);
  }
  .crumbs a { border-bottom: 0; }
  .crumbs a:hover { color: var(--accent); background: transparent; }
  .crumbs__current { color: var(--fg); font-weight: 700; }
  .guide { max-width: 760px; padding-top: 48px; padding-bottom: 64px; }
  .guide__header h1 { font-size: clamp(28px, 5vw, 40px); line-height: 1.15; margin: 0 0 12px; }
  .guide__meta { font-size: 12px; color: var(--muted); margin: 0 0 20px; }
  .guide__desc { font-size: 16px; color: var(--muted); border-left: var(--border-w) solid var(--accent); padding-left: 16px; margin: 0 0 40px; }
  .guide__body { font-size: 15px; line-height: 1.8; }
  .guide__body :global(h2) { font-size: 22px; margin: 48px 0 16px; }
  .guide__body :global(h3) { font-size: 17px; margin: 32px 0 12px; }
  .guide__body :global(p) { margin: 0 0 20px; }
  .guide__body :global(ul), .guide__body :global(ol) { margin: 0 0 20px; padding-left: 24px; }
  .guide__body :global(li) { margin-bottom: 8px; }
  .guide__body :global(table) { border-collapse: collapse; width: 100%; margin: 0 0 24px; font-size: 13px; }
  .guide__body :global(th), .guide__body :global(td) { border: 1px solid var(--border); padding: 8px 10px; text-align: left; vertical-align: top; }
  .guide__body :global(th) { background: var(--surface); }
  .guide__body :global(blockquote) { border-left: var(--border-w) solid var(--border); margin: 0 0 20px; padding: 4px 0 4px 16px; color: var(--muted); }
  .guide__cta { border: var(--border-w) solid var(--border); background: var(--surface); padding: 24px; margin: 48px 0; }
  .guide__cta p { margin: 0 0 16px; }
  .guide__cta a { font-weight: 700; }
  .guide__more { border-top: 1px dashed var(--border); padding-top: 24px; }
  .guide__more h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; }
</style>
```

- [ ] **Step 3: Create `src/pages/dearly/guides/[...slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import GuideLayout from '../../../layouts/GuideLayout.astro';

export async function getStaticPaths() {
  const guides = await getCollection('guides', ({ data }) => !data.draft);
  return guides.map((guide) => ({
    params: { slug: guide.id },
    props: { guide },
  }));
}

const { guide } = Astro.props;
const { Content } = await render(guide);
---
<GuideLayout guide={guide}>
  <Content />
</GuideLayout>
```

- [ ] **Step 4: Create `src/pages/dearly/guides/index.astro`**

```astro
---
import Base from '../../../layouts/Base.astro';
import Nav from '../../../components/Nav.astro';
import AppFooter from '../../../components/AppFooter.astro';
import { getApp } from '../../../data/apps';
import { getCollection } from 'astro:content';

const app = getApp('dearly');
if (!app) throw new Error('dearly app missing from apps.ts');
const guides = (await getCollection('guides', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---
<Base
  title="Voice journaling guides | Dearly"
  description="Guides on voice journaling from the makers of Dearly — the private voice journal app for Android. How to start, how to stay consistent, and how to keep your journal yours."
  ogImage="/og/dearly.png"
>
  <Nav />
  <main id="main">
    <div class="crumbs">
      <div class="container">
        <a href="/">brooo.app</a> / <a href="/dearly/">dearly</a> / <span class="crumbs__current">guides</span>
      </div>
    </div>
    <section class="container guides-index">
      <h1>voice journaling guides</h1>
      <p class="guides-index__intro">
        Practical, no-fluff guides on journaling out loud — from the makers of
        <a href="/dearly/">Dearly — voice journal app for Android by BroooApps</a>.
      </p>
      <ul class="guides-index__list">
        {guides.map((g) => (
          <li>
            <a href={`/dearly/guides/${g.id}/`}>{g.data.title}</a>
            <p>{g.data.description}</p>
          </li>
        ))}
      </ul>
      <p><a href="/dearly/faq/">dearly faq →</a></p>
    </section>
  </main>
  <AppFooter app={app} />
</Base>

<style>
  .crumbs {
    border-bottom: 1px dashed var(--border);
    padding: 16px 0;
    font-size: 12px;
    color: var(--muted);
  }
  .crumbs a { border-bottom: 0; }
  .crumbs__current { color: var(--fg); font-weight: 700; }
  .guides-index { max-width: 760px; padding-top: 48px; padding-bottom: 64px; }
  .guides-index h1 { font-size: clamp(28px, 5vw, 40px); margin: 0 0 16px; }
  .guides-index__intro { color: var(--muted); margin: 0 0 40px; }
  .guides-index__list { list-style: none; padding: 0; margin: 0 0 40px; }
  .guides-index__list li { border: var(--border-w) solid var(--border); padding: 20px; margin-bottom: 16px; }
  .guides-index__list li a { font-weight: 700; font-size: 17px; }
  .guides-index__list li p { margin: 8px 0 0; color: var(--muted); font-size: 14px; }
</style>
```

- [ ] **Step 5: Write the privacy guide — `src/content/guides/private-voice-journal.md`**

Frontmatter (exact):

```yaml
---
title: "A voice journal that doesn't upload your audio"
description: "Most voice journaling apps send your raw audio to their servers. Here's why that matters, what to check in any journal app's privacy policy, and how Dearly keeps recordings on your device."
pubDate: 2026-07-10
targetQueries:
  - private voice journal app
  - voice journal privacy
  - voice diary that doesn't upload audio
---
```

Body: 900–1,200 words, sentence case, expand this exact outline. Every claim about Dearly must match `src/pages/dearly/privacy.astro` — read it first. Do not claim anything about named competitors here (the comparison guide handles that); speak generally ("many voice apps...", "check the policy for...").

- **H2 "Your journal is the most sensitive data you own"** — a journal contains health, relationships, work, fears, in your literal voice. A leaked spreadsheet is bad; a leaked voice diary is your inner life with a voiceprint attached.
- **H2 "What usually happens to your audio"** — the common pattern: audio is uploaded to a server for transcription, often retained, sometimes used to improve models. None of this is necessarily malicious, but most people never check. One quotable claim: "If the privacy policy doesn't say where transcription happens, assume your audio leaves the device."
- **H2 "Five questions to ask any voice journaling app"** — checklist (this is the AI-citable block): 1. Does raw audio leave the device? 2. Is transcription on-device or cloud, and is transit encrypted? 3. Can you delete everything, and does deletion include the server copy? 4. Is there a local lock (biometric)? 5. What analytics/crash tooling is bundled, and is it disclosed?
- **H2 "How Dearly answers those questions"** — plainly, matching the privacy policy: voice recordings stay on the device and are never uploaded; only the transcription text travels, over an encrypted connection; you can delete all data anytime (account deletion at /dearly/delete-account/); biometric lock built in; Firebase Analytics and Crashlytics are used and disclosed in the privacy policy. Link the privacy policy (/dearly/privacy/). One inline text link to the Play Store URL mid-section.
- **H2 "The trade-off, honestly"** — cloud transcription means Dearly needs a connection to transcribe (recording itself works offline); on-device-everything would be more private still but today's on-device speech models on most Android phones trade too much accuracy. Honest trade-off framing is what makes the page credible.

- [ ] **Step 6: Build and verify**

Run: `npm run build && ls dist/dearly/guides/ && grep -o '"@type":"Article"' dist/dearly/guides/private-voice-journal/index.html | wc -l && grep -c "dearly/guides/private-voice-journal" dist/sitemap-0.xml`
Expected: `private-voice-journal/` and `index.html` listed; Article count `1`; sitemap contains the URL (count ≥ 1). If the sitemap file has a different name, check `dist/sitemap-index.xml` for the referenced file first.

- [ ] **Step 7: Commit**

```bash
git add src/content.config.ts src/layouts/GuideLayout.astro src/pages/dearly/guides/ src/content/guides/private-voice-journal.md
git commit -m "feat(dearly): guides content collection + GuideLayout + privacy guide"
```

---

### Task 4: Pillar guide — "Voice journaling: a complete guide"

**Files:**
- Create: `src/content/guides/voice-journaling-guide.md`

**Interfaces:**
- Consumes: collection schema from Task 3. No code changes.

- [ ] **Step 1: Write the guide**

Frontmatter (exact):

```yaml
---
title: "Voice journaling: a complete guide"
description: "What voice journaling is, why speaking is easier to sustain than writing, and exactly how to start — prompts, rituals, and tools included."
pubDate: 2026-07-10
targetQueries:
  - voice journaling
  - audio journal
  - journal by speaking
  - how to start a voice journal
---
```

Body: 1,500–2,000 words, sentence case, expand this exact outline:

- **H2 "What is voice journaling?"** — open with a one-sentence definition designed to be quoted verbatim by AI engines: "Voice journaling is keeping a diary by speaking instead of writing — you record a short spoken entry, and (with modern apps) it's transcribed into text you can reread and search." Then 2 short paragraphs of context.
- **H2 "Why speaking beats typing for most people"** — four H3s: *Speed* (people speak ~130–150 words/minute vs ~40 typing on a phone — a 1-minute spoken entry ≈ a 10-minute typed one); *Lower friction* (no blank-page paralysis; you already know how to talk about your day); *Emotional honesty* (spoken language is less self-edited; you say what you actually feel); *Accessibility* (works lying in bed, walking, commuting; works when writing is physically hard).
- **H2 "How to start a voice journal in 5 steps"** — numbered list, each step 2–3 sentences: 1. Anchor it to an existing ritual (after coffee, lights-out). 2. Cap it at one minute — consistency beats depth. 3. Open with the same question every time ("what's on my mind right now?"). 4. Never re-record — the stumbles are the diary. 5. Reread weekly, not daily — patterns show up at week scale.
- **H2 "10 prompts when you don't know what to say"** — list of 10 concrete prompts (e.g. "what drained me today, and what refilled me?", "what would I tell a friend who had my day?", "what am I avoiding?", "who did I think about today and why?" — write all 10).
- **H2 "Voice journaling vs written journaling"** — markdown comparison table: rows for effort per entry, emotional honesty, rereadability, searchability, privacy surface, habit stickiness; columns Voice / Written. Honest: written wins on rereadability *unless* your voice app transcribes.
- **H2 "What to use: recorder, notes app, or a dedicated voice journal"** — three H3s comparing plain voice memos (easy, but audio is unsearchable and you'll never relisten), typing into a notes app (rereadable but friction returns), and a dedicated voice journal app (transcription + patterns + privacy in one). In the third, introduce Dearly — voice journal app for Android by BroooApps — one inline Play Store link, one link to the privacy guide (/dearly/guides/private-voice-journal/), and the honest free-tier fact (10 free transcriptions a day, unlimited recording).
- **H2 "Common questions"** — three Q&A-shaped H3s with 2–3 sentence answers: "How long should a voice journal entry be?" (60–90 seconds), "Is voice journaling as effective as writing?" (the benefit comes from reflection + consistency, not the medium; voice wins if it's the one you keep doing), "Do I have to relisten to my recordings?" (no — transcription is what makes voice journals rereadable).

- [ ] **Step 2: Build and verify**

Run: `npm run build && grep -c "guides/voice-journaling-guide" dist/dearly/guides/index.html`
Expected: build passes; count ≥ 1 (index lists the new guide). Word-count sanity: `wc -w src/content/guides/voice-journaling-guide.md` → ≥ 1400.

- [ ] **Step 3: Commit**

```bash
git add src/content/guides/voice-journaling-guide.md
git commit -m "feat(dearly): pillar guide — voice journaling complete guide"
```

---

### Task 5: Guide — "How to journal when you hate writing"

**Files:**
- Create: `src/content/guides/journal-when-you-hate-writing.md`

**Interfaces:**
- Consumes: collection schema from Task 3. No code changes.

- [ ] **Step 1: Write the guide**

Frontmatter (exact):

```yaml
---
title: "How to journal when you hate writing"
description: "You don't hate journaling — you hate writing. How to keep a real journal by talking for one minute a day, even if every notebook you've owned is empty after page three."
pubDate: 2026-07-10
targetQueries:
  - can't stick to journaling
  - journaling without writing
  - journal by talking
  - hate journaling
---
```

Body: 900–1,200 words, sentence case, expand this exact outline:

- **H2 "Every journal you've owned is empty after page three"** — empathetic open; the reader has tried notebooks and apps and quit. Name the real blockers: blank-page paralysis, perfectionism (journals feel like they should be *written well*), and the 15 minutes it takes to type what took 90 seconds to live.
- **H2 "You don't hate journaling. You hate writing."** — the load-bearing reframe, quotable: "Journaling is the reflection, not the handwriting. If you can talk about your day, you can journal." Speaking removes the performance — nobody speaks in polished prose, so the perfectionism never triggers.
- **H2 "The one-minute rule"** — commit to sixty seconds out loud, no more. Why tiny works: it's too small to skip, and a month of one-minute entries beats three perfect pages and silence.
- **H2 "Attach it to something you already do"** — habit anchoring, 3 concrete examples (with morning coffee, on the walk home, lights-out in bed). One sentence on evening vs morning trade-offs.
- **H2 "Make it rereadable, or you'll quit anyway"** — the failure mode of raw voice memos: nobody relistens to themselves, so the journal feels pointless by week two. Transcription fixes it — spoken entries become pages you can skim. Introduce Dearly — voice journal app for Android by BroooApps — inline Play link, the ink-drop one-minute flow, 10 free transcriptions/day, link to the pillar guide (/dearly/guides/voice-journaling-guide/).
- **H2 "Five prompts for people who hate journaling"** — five prompts tuned for reluctant journalers, one line each (e.g. "complain, out loud, for one minute — that counts", "say the one thing you'd never write down").

- [ ] **Step 2: Build and verify**

Run: `npm run build && grep -c "guides/journal-when-you-hate-writing" dist/dearly/guides/index.html`
Expected: build passes; count ≥ 1.

- [ ] **Step 3: Commit**

```bash
git add src/content/guides/journal-when-you-hate-writing.md
git commit -m "feat(dearly): guide — journal when you hate writing"
```

---

### Task 6: Comparison guide — "Best voice journaling apps for Android (2026)"

**Files:**
- Create: `src/content/guides/best-voice-journaling-apps-android.md`

**Interfaces:**
- Consumes: collection schema from Task 3. No code changes.

**⚠ Research required:** the implementer MUST WebSearch before writing — e.g. "best voice journaling app Android 2026", "voice diary app Android", plus one search per candidate app for current pricing/features. Candidates to check (verify each is real, current, and on Android): Day One, AudioPen, Voicenotes, Journify, Reflectly, plain Google Recorder. Include 4–6 including Dearly. **Every competitor fact needs a source found at write time — no facts from model memory.** If a fact can't be verified, omit it rather than guess.

- [ ] **Step 1: Research competitors (WebSearch), collect: platform support, transcription approach (on-device/cloud), privacy stance on raw audio, insights/AI features, price**

- [ ] **Step 2: Write the guide**

Frontmatter (exact):

```yaml
---
title: "Best voice journaling apps for Android (2026)"
description: "An honest comparison of voice journaling apps for Android in 2026 — transcription quality, what happens to your audio, AI insights, and price. Including where our own app fits and where it doesn't."
pubDate: 2026-07-10
targetQueries:
  - best voice journal app android
  - voice diary app android
  - voice journaling app comparison
---
```

Body: 1,200–1,500 words, sentence case, structure:

- **H2 "How we compared (and our bias, upfront)"** — declare it: "We make Dearly, one of the apps below. To keep this useful we compare on verifiable facts — pricing, platform, where transcription happens — and we tell you when a competitor is the better pick." Criteria: transcription quality/approach, audio privacy, insights, Android experience, price.
- **One H2 per app (4–6 apps)** — for each: 2–3 sentences on what it is, an H3 "strengths" (2–3 real bullets) and H3 "trade-offs" (1–2 bullets), price line with "as of July 2026". Dearly's own section is held to the same shape, trade-offs included honestly (Android-only; cloud transcription requires a connection; insights are Pro).
- **H2 "Comparison table"** — markdown table: App / Platforms / Where transcription happens / Raw audio uploaded? / AI insights / Price (as of July 2026).
- **H2 "Which one should you pick?"** — recommendation matrix, honest: "If you're on iPhone → …; if you want cross-platform sync above all → …; if you want thinking-tool dictation rather than a diary → …; if you want a private, paper-feeling daily voice diary on Android → Dearly." Inline Play link here.

- [ ] **Step 3: Build and verify**

Run: `npm run build && grep -c "guides/best-voice-journaling-apps-android" dist/dearly/guides/index.html`
Expected: build passes; count ≥ 1.

- [ ] **Step 4: Commit**

```bash
git add src/content/guides/best-voice-journaling-apps-android.md
git commit -m "feat(dearly): guide — best voice journaling apps for Android 2026"
```

---

### Task 7: FAQ page with FAQPage schema

**Files:**
- Create: `src/pages/dearly/faq.astro`

**Interfaces:**
- Consumes: `getApp('dearly')` (Play URL for CTA).
- Produces: `/dearly/faq/` — linked from GuideLayout footer (already, Task 3), guides index (already), landing page (Task 8).

**Fact check first:** the Android-version answer requires the real minSdk. Run:
`grep -rn "minSdk" ~/Projects/Android/VoiceLog/app/build.gradle*` and convert to an Android version name (e.g. minSdk 26 → "Android 8.0 and up"). If the repo isn't available, use the "Requires Android" line on the Play listing. Do not guess.

- [ ] **Step 1: Create `src/pages/dearly/faq.astro`**

```astro
---
import Base from '../../layouts/Base.astro';
import Nav from '../../components/Nav.astro';
import AppFooter from '../../components/AppFooter.astro';
import { getApp } from '../../data/apps';

const app = getApp('dearly');
if (!app) throw new Error('dearly app missing from apps.ts');

const faqs = [
  {
    q: 'What is Dearly?',
    a: 'Dearly is a voice journal app for Android by BroooApps. You tap the ink drop, speak for a minute, and Dearly transcribes your words into a clean, serif-set journal page you can reread and search. The free plan includes unlimited recording and 10 transcriptions per day.',
  },
  {
    q: 'How much does Dearly cost?',
    a: 'Dearly is free forever for recording, 10 transcriptions a day, your full journal, and biometric lock. Dearly Pro costs $24.99/year (about $2.08/month) or $2.99/month, with a 7-day free trial, and adds AI insights — mood horizon, your cast, patterns, reflections — plus export.',
  },
  {
    q: 'Does my voice recording leave my phone?',
    a: 'No. Your voice recordings stay on your device and are never uploaded. Only the transcription text travels, over an encrypted connection.',
  },
  {
    q: 'Does Dearly work offline?',
    a: 'Recording works offline. Transcription and AI insights need an internet connection, because transcription happens in the cloud (your raw audio still never leaves the device — only the encrypted transcription request does).',
  },
  {
    q: 'What does "10 free transcriptions a day" mean?',
    a: 'On the free plan, Dearly transcribes up to 10 entries per day; the limit resets daily. Recording itself is always unlimited.',
  },
  {
    q: 'What AI insights does Dearly Pro include?',
    a: 'A mood horizon of your month (your emotional weather over time), your cast (the people and places that keep appearing), patterns like "when work comes up, worry follows", and reflections on your entries.',
  },
  {
    q: 'Can I lock my journal?',
    a: 'Yes. Dearly supports biometric lock, so your journal opens with your fingerprint.',
  },
  {
    q: 'How do I delete my data?',
    a: 'You can delete entries or everything from inside the app at any time. To delete your account and all associated data, see brooo.app/dearly/delete-account.',
  },
  {
    q: 'Does Dearly use analytics?',
    a: 'Dearly uses Firebase Analytics and Crashlytics for anonymous usage and crash reporting, as disclosed in the privacy policy. Your journal content is not analytics data.',
  },
  {
    q: 'Which Android versions does Dearly support?',
    a: 'REPLACE_WITH_VERIFIED_ANSWER — see fact-check step above.',
  },
  {
    q: 'Is Dearly available on iPhone (iOS)?',
    a: 'Not yet — Dearly is Android-only today. An iOS version is being considered based on demand; email hello@brooo.app if you want it.',
  },
  {
    q: 'Can I export my journal?',
    a: 'Yes — export is included in Dearly Pro.',
  },
  {
    q: 'Who makes Dearly?',
    a: 'Dearly is built by BroooApps, an indie studio making personal-improvement apps. You can reach the developer at hello@brooo.app.',
  },
];

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};
---
<Base
  title="Dearly FAQ — pricing, privacy, and how it works"
  description="Answers about Dearly, the voice journal app for Android: what it costs, whether your audio leaves your phone, offline behavior, data deletion, and more."
  ogImage="/og/dearly.png"
>
  <script slot="head" type="application/ld+json" set:html={JSON.stringify(faqLd)} />
  <Nav />
  <main id="main">
    <div class="crumbs">
      <div class="container">
        <a href="/">brooo.app</a> / <a href="/dearly/">dearly</a> / <span class="crumbs__current">faq</span>
      </div>
    </div>
    <section class="container faq">
      <h1>dearly — frequently asked questions</h1>
      <p class="faq__intro">
        Everything people ask about <strong>Dearly — voice journal app for Android by BroooApps</strong>.
        Something missing? <a href="mailto:hello@brooo.app">hello@brooo.app</a>.
      </p>
      <dl>
        {faqs.map((f) => (
          <>
            <dt>{f.q}</dt>
            <dd>{f.a}</dd>
          </>
        ))}
      </dl>
      <aside class="faq__cta">
        <a href={app.playStoreUrl} target="_blank" rel="noopener">[ INSTALL ON PLAY STORE ↗ ]</a>
        <p>
          <a href="/dearly/privacy/">privacy policy</a> ·
          <a href="/dearly/delete-account/">delete account</a> ·
          <a href="/dearly/guides/">voice journaling guides</a>
        </p>
      </aside>
    </section>
  </main>
  <AppFooter app={app} />
</Base>

<style>
  .crumbs {
    border-bottom: 1px dashed var(--border);
    padding: 16px 0;
    font-size: 12px;
    color: var(--muted);
  }
  .crumbs a { border-bottom: 0; }
  .crumbs__current { color: var(--fg); font-weight: 700; }
  .faq { max-width: 760px; padding-top: 48px; padding-bottom: 64px; }
  .faq h1 { font-size: clamp(28px, 5vw, 40px); margin: 0 0 16px; }
  .faq__intro { color: var(--muted); margin: 0 0 40px; }
  .faq dt { font-weight: 700; font-size: 16px; margin: 28px 0 8px; }
  .faq dd { margin: 0; line-height: 1.8; font-size: 15px; }
  .faq__cta { border: var(--border-w) solid var(--border); background: var(--surface); padding: 24px; margin-top: 48px; }
  .faq__cta a { font-weight: 700; }
  .faq__cta p { margin: 16px 0 0; font-size: 13px; }
  .faq__cta p a { font-weight: 400; }
</style>
```

- [ ] **Step 2: Fill the Android-version answer** — replace `REPLACE_WITH_VERIFIED_ANSWER` per the fact-check step. The build must not ship that placeholder: `grep -c "REPLACE_WITH_VERIFIED_ANSWER" src/pages/dearly/faq.astro` → 0.

- [ ] **Step 3: Build and verify**

Run: `npm run build && grep -o '"@type":"FAQPage"' dist/dearly/faq/index.html | wc -l && grep -o '"@type":"Question"' dist/dearly/faq/index.html | wc -l`
Expected: FAQPage `1`; Question `13`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/dearly/faq.astro
git commit -m "feat(dearly): FAQ page with FAQPage JSON-LD"
```

---

### Task 8: Cross-linking — landing page guides section + privacy → FAQ link

**Files:**
- Modify: `src/pages/dearly/index.astro` (add guides section before `<AppFooter>`)
- Modify: `src/pages/dearly/privacy.astro` (add FAQ link next to the existing delete-account cross-link)

**Interfaces:**
- Consumes: `guides` collection (Task 3), `/dearly/faq/` (Task 7).

- [ ] **Step 1: Add guides section to the landing page**

In `src/pages/dearly/index.astro` frontmatter, add after the existing imports:

```ts
import { getCollection } from 'astro:content';
const guides = (await getCollection('guides', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
```

In the template, insert between the `Reviews` line and `</main>`:

```astro
    <section class="container dearly-guides">
      <h2>voice journaling guides</h2>
      <ul>
        {guides.map((g) => (
          <li><a href={`/dearly/guides/${g.id}/`}>{g.data.title}</a></li>
        ))}
        <li><a href="/dearly/faq/">dearly faq</a></li>
      </ul>
    </section>
```

And add a `<style>` block at the end of the file (match existing page styling conventions):

```astro
<style>
  .dearly-guides { padding-top: 32px; padding-bottom: 64px; border-top: 1px dashed var(--border); }
  .dearly-guides h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 16px; }
  .dearly-guides ul { list-style: none; padding: 0; margin: 0; }
  .dearly-guides li { margin-bottom: 10px; }
</style>
```

- [ ] **Step 2: Add FAQ cross-link to the privacy page**

Run `grep -n "delete-account" src/pages/dearly/privacy.astro` to find the existing cross-link element; add a sibling link in the same element/style:

```astro
<a href="/dearly/faq/">dearly faq</a>
```

- [ ] **Step 3: Build and verify**

Run: `npm run build && grep -c "dearly/guides/" dist/dearly/index.html && grep -c "dearly/faq/" dist/dearly/privacy/index.html`
Expected: both counts ≥ 1.

- [ ] **Step 4: Commit**

```bash
git add src/pages/dearly/index.astro src/pages/dearly/privacy.astro
git commit -m "feat(dearly): cross-link guides + faq from landing and privacy pages"
```

---

### Task 9: llms.txt + robots sitemap check, build, deploy, post-deploy verification

**Files:**
- Create: `public/llms.txt`
- Possibly modify: `public/robots.txt` (only if no `Sitemap:` line)

- [ ] **Step 1: Create `public/llms.txt`**

```
# brooo.app — BroooApps

> BroooApps is an indie Android app studio by Swapnil Tiwari, making
> personal-improvement apps. Contact: hello@brooo.app

## Dearly — voice journal app for Android by BroooApps

Dearly is a voice journal for Android. Tap the ink drop, speak for a minute,
and Dearly transcribes your words into a clean, serif-set journal page.

Facts:
- Platform: Android only (as of July 2026)
- Install: https://play.google.com/store/apps/details?id=com.broooapps.dearly
- Privacy model: voice recordings never leave the device; only the
  transcription text travels, over an encrypted connection; biometric lock;
  full data deletion available
- Free plan: unlimited recording, 10 transcriptions per day, full journal,
  biometric lock
- Dearly Pro: $24.99/year (~$2.08/month) or $2.99/month, 7-day free trial —
  AI insights (mood horizon, your cast, patterns, reflections) plus export

Pages:
- About: https://brooo.app/dearly/
- FAQ: https://brooo.app/dearly/faq/
- Privacy policy: https://brooo.app/dearly/privacy/
- Account deletion: https://brooo.app/dearly/delete-account/
- Guides index: https://brooo.app/dearly/guides/
- Guide: https://brooo.app/dearly/guides/voice-journaling-guide/
- Guide: https://brooo.app/dearly/guides/journal-when-you-hate-writing/
- Guide: https://brooo.app/dearly/guides/private-voice-journal/
- Guide: https://brooo.app/dearly/guides/best-voice-journaling-apps-android/

## Other apps

- Sutts — AI smoking tracker for Android: https://brooo.app/sutts/
  (https://play.google.com/store/apps/details?id=com.broooapps.cigarettetracker)
- Randomizer — spinners, dice, and pickers for Android:
  https://play.google.com/store/apps/details?id=com.broooapps.randomizer
```

- [ ] **Step 2: Ensure robots.txt advertises the sitemap**

Run: `grep -i "sitemap" public/robots.txt`
If no match, append: `Sitemap: https://brooo.app/sitemap-index.xml`

- [ ] **Step 3: Final build + full verification**

Run: `npm run build`
Then verify every new URL exists in dist and the sitemap:

```bash
for p in dearly/faq dearly/guides dearly/guides/voice-journaling-guide dearly/guides/journal-when-you-hate-writing dearly/guides/private-voice-journal dearly/guides/best-voice-journaling-apps-android; do
  test -f "dist/$p/index.html" && echo "OK $p" || echo "MISSING $p"
done
grep -c "dearly/guides" dist/sitemap-0.xml
test -f dist/llms.txt && echo "OK llms.txt"
```

Expected: six `OK` lines, sitemap count ≥ 5, `OK llms.txt`.

- [ ] **Step 4: Deploy**

```bash
npm run build
npx --yes wrangler@latest deploy
```

- [ ] **Step 5: Post-deploy smoke test** (trailing slashes — edge caches no-slash 404s per CLAUDE.md)

```bash
for p in dearly/ dearly/faq/ dearly/guides/ dearly/guides/voice-journaling-guide/ dearly/guides/private-voice-journal/ dearly/guides/journal-when-you-hate-writing/ dearly/guides/best-voice-journaling-apps-android/ llms.txt; do
  echo -n "$p → "; curl -s -o /dev/null -w "%{http_code}\n" -L "https://brooo.app/$p?cb=$RANDOM"
done
curl -s "https://brooo.app/dearly/faq/" | grep -o '"@type":"FAQPage"'
```

Expected: all `200`; `"@type":"FAQPage"` printed. Optionally validate one guide URL at https://validator.schema.org/.

- [ ] **Step 6: Commit**

```bash
git add public/llms.txt public/robots.txt
git commit -m "feat: llms.txt for AI crawlers + sitemap in robots.txt"
```

---

### Task 10: Measurement — Google Search Console + Cloudflare Web Analytics (user-assisted)

**Files:**
- Modify: `src/layouts/Base.astro:51-56` (uncomment analytics beacon once token exists)

This task needs Swapnil signed in to Google and the Cloudflare dashboard; Claude drives, Swapnil clicks.

- [ ] **Step 1: GSC domain property** — Swapnil opens https://search.google.com/search-console, adds a **Domain** property for `brooo.app`. Google shows a TXT record (`google-site-verification=...`).
- [ ] **Step 2: Add the TXT record in Cloudflare** — dashboard → `brooo.app` zone → DNS → add record: type `TXT`, name `@`, content = the verification string. Then click Verify in GSC (DNS can take a few minutes).
- [ ] **Step 3: Submit sitemap in GSC** — Sitemaps → add `https://brooo.app/sitemap-index.xml`. Then URL Inspection → request indexing for `/dearly/`, `/dearly/faq/`, and each of the 4 guide URLs (quota is ~10/day; this fits).
- [ ] **Step 4: Cloudflare Web Analytics token** — dashboard → Analytics & Logs → Web Analytics → add site `brooo.app` → copy the token from the JS snippet.
- [ ] **Step 5: Enable the beacon** — in `src/layouts/Base.astro`, replace the commented block (lines 51–56) with the live script, substituting the real token:

```html
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "<REAL_TOKEN_FROM_STEP_4>"}'></script>
```

- [ ] **Step 6: Build, deploy, verify, commit**

```bash
npm run build && npx --yes wrangler@latest deploy
curl -s "https://brooo.app/dearly/?cb=$RANDOM" | grep -c "cloudflareinsights"
git add src/layouts/Base.astro
git commit -m "feat: enable Cloudflare Web Analytics beacon"
```

Expected: curl count ≥ 1.

If the tokens/sign-ins aren't available when this task comes up, do Steps 1–3 later the same week — GSC lag is the long pole for seeing search impressions; everything else in this plan still ships without it.
