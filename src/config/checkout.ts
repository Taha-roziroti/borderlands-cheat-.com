import { CHECKOUT_URLS } from './checkout-redirects.mjs';

/**
 * External checkout URLs — loaded in internal /go/... pages (instant navigation via meta refresh).
 * User-visible links use /go/ paths for a consistent on-site URL.
 */
export const CHECKOUT = CHECKOUT_URLS;

export type CheckoutProduct = keyof typeof CHECKOUT;

/** URL slug for /go/[slug]/ checkout pages. */
export const CHECKOUT_SLUGS: Record<CheckoutProduct, string> = {
  borderlands3: 'borderlands-3',
  cloudDma: 'cloud-dma',
  hwidSpoofer: 'hwid-spoofer',
};

export const CHECKOUT_SLUG_TO_PRODUCT = Object.fromEntries(
  Object.entries(CHECKOUT_SLUGS).map(([product, slug]) => [slug, product as CheckoutProduct]),
) as Record<string, CheckoutProduct>;

/** Internal checkout path shown to users. */
export function checkoutPath(product: CheckoutProduct = 'borderlands3'): string {
  return `/go/${CHECKOUT_SLUGS[product]}/`;
}

/** Default product checkout path (Borderlands 3 main). */
export const PRIMARY_CHECKOUT_PATH = checkoutPath('borderlands3');

/** Map content URL to a single product (direct checkout, no modal). */
export function checkoutProductForPathname(pathname: string): CheckoutProduct | null {
  let path = pathname || '/';
  if (!path.startsWith('/')) path = `/${path}`;
  if (path !== '/' && !path.endsWith('/')) path = `${path}/`;

  if (path.startsWith('/cloud-dma-borderlands-3')) {
    return 'cloudDma';
  }
  // Add more product-only routes here (e.g. HWID page) when they exist.

  return null;
}

export function checkoutForSlug(_slug: string): string {
  return checkoutPath('borderlands3');
}

/** Resolve blog CTA or legacy href values to internal checkout paths. */
export function resolveCheckoutHref(href: string): string {
  if (!href.startsWith('http')) {
    return href.startsWith('/') ? href : `/${href}`;
  }

  for (const [product, url] of Object.entries(CHECKOUT) as [CheckoutProduct, string][]) {
    if (href === url || href.startsWith(`${url}&`) || href.startsWith(`${url}?`)) {
      return checkoutPath(product);
    }
  }

  return href;
}
