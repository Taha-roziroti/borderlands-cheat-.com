/**
 * Central titles/descriptions for routes.
 */

export interface PageSeoEntry {
  title: string;
  description: string;
}

export const PAGE_SEO: Record<string, PageSeoEntry> = {
  '/': {
    title: 'Borderlands 3 PC cheat tools | soft aim, ESP & radar',
    description:
      'Borderlands 3 cheats for PC: configurable soft aim, enemy and loot ESP, radar, and stream-proof overlay. Compare plans and setup notes on borderlandscheats.com.',
  },
  '/borderlands-3-aimbot/': {
    title: 'Borderlands 3 Aimbot & Soft Aim Settings | PC',
    description:
      'Borderlands 3 aimbot page: FOV, smoothing, target bone, aim key, and visible checks for soft aim on PC. Read the feature list before checkout.',
  },
  '/borderlands-3-esp/': {
    title: 'Borderlands 3 ESP | Enemy, Boss & Loot on PC',
    description:
      'Borderlands 3 ESP: enemy and boss highlights, loot rarity filters, radar range, and markers. See what the ESP menu can display on PC before you buy.',
  },
  '/borderlands-3-pricing/': {
    title: 'Borderlands 3 Cheat Price | Monthly or Lifetime',
    description:
      'Borderlands 3 cheat pricing: monthly and lifetime access with the same listed feature set. Confirm current price and term on the seller checkout page before paying.',
  },
  '/cloud-dma-borderlands-3/': {
    title: 'Cloud DMA Borderlands 3 setup | Hyper-V host guide',
    description:
      'Cloud DMA for Borderlands 3: Hyper-V on one PC, firmware and Windows security checks, and how it fits the supported cheat stack. Read requirements before purchase.',
  },
  '/borderlands-3-cheats-setup/': {
    title: 'Borderlands 3 Cheat Setup | Windows & Cloud DMA',
    description:
      'Borderlands 3 cheat setup for Windows 10 and 11: RAM, virtualization, Hyper-V, and Cloud DMA steps. Use this guide with the seller’s loader documentation.',
  },
  '/faq/': {
    title: 'Borderlands 3 Cheats FAQ | Features & Checkout',
    description:
      'FAQ for Borderlands 3 soft aim, ESP, Cloud DMA, Steam or Epic PC clients, pricing, and checkout links. Short answers with links to full pages on this site.',
  },
  '/terms/': {
    title: 'Terms of use for BorderlandsCheats visitors | BL3 site',
    description:
      'Terms for using borderlandscheats.com and for purchases started through outbound checkout links. Read together with the Privacy Policy.',
  },
  '/privacy/': {
    title: 'Privacy policy for borderlandscheats.com | data & cookies',
    description:
      'How borderlandscheats.com uses analytics, cookies, and contact details when you browse or email support. No sale of personal data; see full policy.',
  },
  '/about/': {
    title: 'About BorderlandsCheats | Borderlands 3 Info Site',
    description:
      'BorderlandsCheats explains Borderlands 3 PC cheat features, Cloud DMA context, and setup. Purchases and delivery are handled by the linked seller after checkout.',
  },
  '/support/': {
    title: 'Support and contact for BorderlandsCheats | orders & FAQ',
    description:
      'Contact BorderlandsCheats for site and link questions. Order and loader issues go through the seller’s channels tied to your checkout receipt.',
  },
};

export function normalizeSeoPath(pathname: string): string {
  let path = pathname || '/';
  if (!path.startsWith('/')) path = `/${path}`;
  if (path !== '/' && !path.endsWith('/')) path = `${path}/`;
  return path;
}

export function getPageSeoEntry(pathname: string): PageSeoEntry | undefined {
  return PAGE_SEO[normalizeSeoPath(pathname)];
}
