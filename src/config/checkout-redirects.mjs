/** Affiliate checkout destinations (Zadeyo go links). */
export const AFFILIATE_BASE = 'https://zadeyo.com/go/TAHA';

export const CHECKOUT_URLS = {
  borderlands3: `${AFFILIATE_BASE}?to=${encodeURIComponent('/products/borderlands-3')}`,
  cloudDma: `${AFFILIATE_BASE}?to=${encodeURIComponent('/products/cloud-dma')}`,
  hwidSpoofer: `${AFFILIATE_BASE}?to=${encodeURIComponent('/products/hwid-spoofer')}`,
};

/** Checkout paths → external URLs (middleware, static serve, internal /go/... pages). */
export const CHECKOUT_PATH_REDIRECTS = new Map([
  ['/go/borderlands-3', CHECKOUT_URLS.borderlands3],
  ['/go/borderlands-3/', CHECKOUT_URLS.borderlands3],
  ['/go/cloud-dma', CHECKOUT_URLS.cloudDma],
  ['/go/cloud-dma/', CHECKOUT_URLS.cloudDma],
  ['/go/hwid-spoofer', CHECKOUT_URLS.hwidSpoofer],
  ['/go/hwid-spoofer/', CHECKOUT_URLS.hwidSpoofer],
]);

export function resolveCheckoutPathRedirect(pathname) {
  const direct = CHECKOUT_PATH_REDIRECTS.get(pathname);
  if (direct) return direct;

  if (pathname !== '/' && !pathname.endsWith('/')) {
    return CHECKOUT_PATH_REDIRECTS.get(`${pathname}/`) ?? null;
  }

  return null;
}
