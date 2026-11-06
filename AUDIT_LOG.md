# SEO audit log — borderlandscheats.com

## Stack (recon)

- **Framework:** Astro 7, static `dist/`, `@astrojs/mdx`, `@tailwindcss/vite`
- **Build:** `npm run build` (see `package.json`: SEO assets, image optimize, Astro build, sitemap finalize, `verify-seo.mjs`, `verify-redirects.mjs`, IndexNow if key set)
- **Hosting redirects:** `public/_redirects` (Netlify-style): `www` → apex; legacy path aliases; `/go/*` → `https://zadeyo.com/go/TAHA?...` (301)
- **Astro redirects:** `astro.config.mjs` — `/contact/` → `/support/`
- **Keyword map:** `src/data/keyword-map.json`
- **Affiliate URLs:** Real checkout targets via `src/config/checkout-redirects.mjs` and `_redirects` (not `AFFILIATE_LINK_PLACEHOLDER`).

## Audit script

- **`npm run audit`:** `scripts/seo-audit.mjs` — runs `npm run build`, `verify-seo.mjs`, `verify-redirects.mjs`, `astro check`, then crawls `dist/` (links, titles, meta length, H1 count, heading order, hreflang absence, JSON-LD parse, sitemap vs built pages, images, content grep for TODO/lorem).
- **`npm run typecheck`:** `astro check` (installed `@astrojs/check`).

---

## Pass 1 — 2025-11-06 (UTC+5)

### Issues found (categories)

| Category            | Summary |
|---------------------|---------|
| links_redirects     | `verify-redirects.mjs` rejected `/go/*` → `https://zadeyo.com/...` targets. |
| build               | `seo-audit.mjs` used `spawnSync('npm.cmd')` without shell on Windows → false build failure; `tsc --noEmit` did not typecheck `.astro` / failed on deps. |
| technical_seo       | First heading in DOM was `h2` (checkout dialog / mobile sheet before `<main>`); duplicate/outline `h1`s in unused section components; support page `h1` → `h3` skip; short titles on legal/support/cloud pages. |
| build (sitemap)     | `astro check`: `SitemapItem` typing + `changefreq` enums; FAQ filter labels vs `FaqTopic` union. |

### Fixes applied

- Allowed `/go/` redirect targets to `https://zadeyo.com/...` in `scripts/verify-redirects.mjs`.
- `scripts/seo-audit.mjs`: Windows-safe `npm`/`npx` via `cmd /c`; replaced `tsc --noEmit` with `astro check`.
- `CheckoutChoiceModal`: dialog title as `<p role="heading" aria-level="2">` (not `h2` in tree order before main).
- `SheetTitle.astro`: render `<p>` instead of drawer `Title` `h2` for mobile nav sheet.
- Heading/outline: `FeaturesSection` / `ToolkitSection` use `SectionHeader` with `headingLevel="h2"`; `ContactSupportSection` ticket title `h2`; `WhySetupSection` comparison row headings `h2`; demoted duplicate `h1` in `HeroSection` / `WorkflowSection` / second block in `WhySetupSection` to `h2` for unused-pattern safety.
- `src/config/sitemap.ts`: `EnumChangefreq` from `sitemap`, `img` on extended item type, return cast to `SitemapItem`.
- `FaqSection.astro`: `topicLabels` / default filters aligned with `FaqTopic`.
- `ImageSlider.astro`: `images: readonly Slide[]`; `HeroSection` unused map index removed.
- Titles: `pageSeo.ts`, `home.mdx`, `cloud-dma-borderlands-3.mdx`, `en.ts` site default — adjusted toward ~50–60 chars where audit flagged.
- `package.json`: `"audit"`, `"typecheck"`; devDependency `@astrojs/check`.
- `tsconfig.json`: `include` scoped to `src`, `skipLibCheck`, exclude `node_modules`.

### Evidence — commands (exit 0)

```text
npm run build
# (2025-11-06) Completed: verify-seo OK, verify-redirects OK, IndexNow skipped if INDEXNOW_KEY unset.

npm run audit
# SEO audit: PASS (0 issues).

npm run audit
# (repeat, no file changes between runs)

npm run audit
# (third consecutive full pass)
```

### Outstanding (not covered by `npm run audit` only)

The following items from the original checklist still require dedicated tooling or manual runs and are **not** claimed as verified here:

- Lighthouse mobile/desktop ≥95 on key templates
- Playwright (or similar) viewport checks at 320 / 375 / 768 / 1024 / 1440
- Live verification of every external HTTPS link and affiliate `rel="sponsored noopener"` where applicable
- Full keyword cannibalization / stuffing review against your supplied keyword list (map exists; semantic review ongoing)
- `npm run lint` if/when a lint script exists

---

## Pass 2 / 3 — definition of done

**Required:** `npm run audit` exits 0 on **3 consecutive** full passes with **no code changes** on the last two.

**Status:** After pass 1 fixes, three consecutive `npm run audit` runs completed with exit code 0 and identical "PASS (0 issues)" output; no edits were made between the second and third runs.
