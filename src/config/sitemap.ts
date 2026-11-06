import type { SitemapItem } from '@astrojs/sitemap';
import { EnumChangefreq } from 'sitemap';
import { SITE_ORIGIN } from './seo';

const buildDate = new Date().toISOString();

const defaultSitemapImage = {
  url: `${SITE_ORIGIN}/og/default.jpg`,
  title: 'BorderlandsCheats',
  caption: 'Borderlands 3 PC cheat software — BorderlandsCheats',
};

/** Astro’s exported `SitemapItem` omits `img` even when `namespaces.image` is enabled. */
type SitemapItemWithImages = SitemapItem & { img?: typeof defaultSitemapImage[] };

function pathnameFromUrl(url: string): string {
  const path = new URL(url).pathname;
  return path.endsWith('/') ? path : `${path}/`;
}

export function sitemapSerialize(item: SitemapItem): SitemapItem | undefined {
  const path = pathnameFromUrl(item.url);

  if (path.includes('/404') || path.startsWith('/go/') || path.includes('/rss.xml')) {
    return undefined;
  }

  const next: SitemapItemWithImages = { ...item, lastmod: buildDate, img: [defaultSitemapImage] };

  if (path === '/') {
    next.priority = 1;
    next.changefreq = EnumChangefreq.WEEKLY;
    return next as SitemapItem;
  }

  if (
    path === '/borderlands-3-aimbot/' ||
    path === '/borderlands-3-esp/' ||
    path === '/borderlands-3-pricing/'
  ) {
    next.priority = 0.9;
    next.changefreq = EnumChangefreq.WEEKLY;
    return next as SitemapItem;
  }

  if (path === '/cloud-dma-borderlands-3/' || path === '/borderlands-3-cheats-setup/') {
    next.priority = 0.85;
    next.changefreq = EnumChangefreq.MONTHLY;
    return next as SitemapItem;
  }

  if (path === '/faq/') {
    next.priority = 0.7;
    next.changefreq = EnumChangefreq.MONTHLY;
    return next as SitemapItem;
  }

  if (path === '/about/' || path === '/support/' || path === '/privacy/' || path === '/terms/') {
    next.priority = 0.5;
    next.changefreq = EnumChangefreq.YEARLY;
    return next as SitemapItem;
  }

  next.priority = 0.6;
  next.changefreq = EnumChangefreq.MONTHLY;
  return next as SitemapItem;
}
