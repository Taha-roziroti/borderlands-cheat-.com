/** Normalize internal paths to match trailingSlash: 'always' and canonical URLs. */
export function withTrailingSlash(path: string): string {
  if (!path || path.startsWith('http') || path.startsWith('#') || path.startsWith('mailto:')) {
    return path;
  }
  const [pathname, hash = ''] = path.split('#');
  const normalized = pathname === '/' || pathname.endsWith('/') ? pathname : `${pathname}/`;
  return hash ? `${normalized}#${hash}` : normalized;
}

export function normalizeInternalPath(href: string): string {
  if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('/go/')) {
    return href;
  }

  const hashIndex = href.indexOf('#');
  const rawPath = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';

  const pathname = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;

  return withTrailingSlash(pathname) + hash;
}

export const ROUTES = {
  home: '/',
  pricing: '/borderlands-3-pricing/',
  aimbot: '/borderlands-3-aimbot/',
  esp: '/borderlands-3-esp/',
  cloudDma: '/cloud-dma-borderlands-3/',
  setup: '/borderlands-3-cheats-setup/',
  faq: '/faq/',
  terms: '/terms/',
  about: '/about/',
  support: '/support/',
  privacy: '/privacy/',
} as const;
