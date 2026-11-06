import type { FaqItem } from '../i18n/types';
import { SUPPORT_EMAIL } from '../config/site';
import { SITE_ORIGIN, absoluteAssetUrl, canonicalUrl, getOrganizationSameAs } from '../config/seo';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

const SITE_NAME = 'BorderlandsCheats';

/** Exactly six knowsAbout terms (site identity graph). */
const SITE_KNOWS_ABOUT = [
  'Borderlands 3',
  'PC game cheats',
  'Aim assist configuration',
  'Extra Sensory Perception overlays',
  'Cloud DMA',
  'Windows 10 and Windows 11',
] as const;

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_ORIGIN}/#website`,
    name: SITE_NAME,
    url: `${SITE_ORIGIN}/`,
    inLanguage: 'en-US',
    description:
      'Premium Borderlands 3 PC cheat software with soft aim, enemy ESP, loot ESP, radar and stream-proof overlay.',
    publisher: { '@id': `${SITE_ORIGIN}/#organization` },
  };
}

export function organizationSchema() {
  const sameAs = getOrganizationSameAs();

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_ORIGIN}/#organization`,
    name: SITE_NAME,
    url: `${SITE_ORIGIN}/`,
    logo: `${SITE_ORIGIN}/logo.svg`,
    email: SUPPORT_EMAIL,
    knowsAbout: [...SITE_KNOWS_ABOUT],
    ...(sameAs.length > 0 ? { sameAs } : {}),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: SUPPORT_EMAIL,
        url: canonicalUrl('/support/'),
        availableLanguage: ['English'],
        areaServed: 'Worldwide',
      },
    ],
  };
}

/** WebSite + Organization with stable @id (use on every page). */
export function siteIdentityGraphNodes() {
  return [websiteSchema(), organizationSchema()];
}

export function webPageSchema(input: { name: string; description: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: input.name,
    description: input.description,
    url: canonicalUrl(input.url),
    inLanguage: 'en-US',
    isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
    publisher: { '@id': `${SITE_ORIGIN}/#organization` },
  };
}

export function faqPageSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

function offerUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return canonicalUrl(path);
}

export function productSchema(input: {
  name: string;
  description: string;
  url: string;
  offerUrl: string;
  image?: string;
  sku?: string;
  price: number;
  priceCurrency?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    sku: input.sku ?? input.url.replace(/\//g, '-'),
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    ...(input.image ? { image: absoluteAssetUrl(input.image) } : {}),
    offers: {
      '@type': 'Offer',
      url: offerUrl(input.offerUrl),
      price: String(input.price),
      priceCurrency: input.priceCurrency ?? 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
  };
}

/** Multiple offers (e.g. monthly + lifetime) — verify prices at checkout before relying on schema. */
export function productMultiOfferSchema(input: {
  name: string;
  description: string;
  url: string;
  offerPageUrl: string;
  image?: string;
  sku?: string;
  offers: { name: string; price: number; description?: string }[];
  priceCurrency?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_ORIGIN}/#product`,
    name: input.name,
    description: input.description,
    sku: input.sku ?? input.url.replace(/\//g, '-'),
    brand: { '@id': `${SITE_ORIGIN}/#organization` },
    ...(input.image ? { image: absoluteAssetUrl(input.image) } : {}),
    offers: input.offers.map((o) => ({
      '@type': 'Offer',
      name: o.name,
      description: o.description,
      url: offerUrl(input.offerPageUrl),
      price: String(o.price),
      priceCurrency: input.priceCurrency ?? 'USD',
      availability: 'https://schema.org/InStock',
      seller: { '@id': `${SITE_ORIGIN}/#organization` },
    })),
  };
}

export function articleSchema(input: {
  name: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.name,
    description: input.description,
    url: canonicalUrl(input.url),
    image: absoluteAssetUrl(input.image),
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    inLanguage: 'en-US',
    author: { '@id': `${SITE_ORIGIN}/#organization` },
    publisher: { '@id': `${SITE_ORIGIN}/#organization` },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl(input.url),
    },
  };
}

export function parseBlogDate(date: string): string {
  const parsed = Date.parse(date);
  if (Number.isNaN(parsed)) return new Date().toISOString().slice(0, 10);
  return new Date(parsed).toISOString().slice(0, 10);
}
