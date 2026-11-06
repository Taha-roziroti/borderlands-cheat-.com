# Search Console workflow (borderlandscheats.com)

You verify the domain at your DNS provider—no HTML meta tags in the repo.

## Setup (once)

1. Open [Google Search Console](https://search.google.com/search-console) and add the **domain** property for `borderlandscheats.com` if it is not already there.
2. Under **Sitemaps**, submit: `https://borderlandscheats.com/sitemap.xml`
3. Repeat in [Bing Webmaster Tools](https://www.bing.com/webmasters) if you use Bing.

## Monthly tune (15 minutes)

1. Search Console → **Performance** → **Search results**.
2. Sort by **Impressions** (last 28 days).
3. For each query that already maps to a page on your site, open the matching path in [`src/config/pageSeo.ts`](../src/config/pageSeo.ts).
4. Adjust `title` and `description` so the primary query appears naturally in the title (keep under ~60 characters for the title where possible).
5. Deploy. Allow 1–2 weeks before judging click-through changes.

## Path cheat sheet

| Common query intent | Edit path in `pageSeo.ts` |
| ------------------- | ------------------------- |
| Borderlands 3 cheats (broad) | `/` |
| aim, soft aim | `/borderlands-3-aimbot/` |
| ESP, loot, radar | `/borderlands-3-esp/` |
| price, plans | `/borderlands-3-pricing/` |
| Cloud DMA, Hyper-V | `/cloud-dma-borderlands-3/` |
| setup, Windows | `/borderlands-3-cheats-setup/` |
| FAQ | `/faq/` |
| support, orders | `/support/` |

Product and content pages use titles from MDX or overrides in `PAGE_SEO`; add entries only when you want a fixed override for a specific pathname.
