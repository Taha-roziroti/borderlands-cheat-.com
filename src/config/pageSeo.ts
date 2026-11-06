/**
 * Central titles/descriptions for routes.
 */

export interface PageSeoEntry {
  title: string;
  description: string;
}

export const PAGE_SEO: Record<string, PageSeoEntry> = {
  '/': {
    title: 'Borderlands 3 cheats for PC | soft aim, ESP & radar',
    description:
      'Borderlands 3 cheats overview for PC: soft aim, enemy and loot ESP, radar, and stream-proof overlay. Compare plans and setup on borderlandscheats.com.',
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
    title: 'Borderlands 3 cheat price | monthly or lifetime access',
    description:
      'Borderlands 3 cheat price: monthly and lifetime plans share the same listed feature set. Confirm current amount and term on the seller checkout page before you pay.',
  },
  '/cloud-dma-borderlands-3/': {
    title: 'Cloud DMA Borderlands 3 | Hyper-V host setup guide',
    description:
      'Cloud DMA Borderlands 3: single-PC Hyper-V host, firmware and Windows checks, and how it fits the cheat stack. Read requirements before purchase.',
  },
  '/borderlands-3-cheats-setup/': {
    title: 'Borderlands 3 Cheat Setup | Windows & Cloud DMA',
    description:
      'Borderlands 3 cheat setup for Windows 10 and 11: RAM, virtualization, Hyper-V, and Cloud DMA steps. Use this guide with the seller’s loader documentation.',
  },
  '/faq/': {
    title: 'Borderlands 3 cheats FAQ | features, DMA & checkout',
    description:
      'Borderlands 3 cheats FAQ: soft aim, ESP, Cloud DMA, Steam or Epic on PC, pricing, and checkout links—short answers with links to full pages here.',
  },
  '/terms/': {
    title: 'BorderlandsCheats terms of use | checkout & site rules',
    description:
      'BorderlandsCheats terms for borderlandscheats.com and purchases started through outbound checkout links. Read together with the Privacy Policy.',
  },
  '/privacy/': {
    title: 'BorderlandsCheats privacy policy | data, cookies, email',
    description:
      'BorderlandsCheats privacy policy: how borderlandscheats.com uses analytics, cookies, and contact details when you browse or email support—no sale of personal data.',
  },
  '/about/': {
    title: 'About BorderlandsCheats | Borderlands 3 cheat info',
    description:
      'About BorderlandsCheats: Borderlands 3 PC cheat features, Cloud DMA context, and setup—purchases and delivery run through the linked seller after checkout.',
  },
  '/support/': {
    title: 'BorderlandsCheats support | contact & order help',
    description:
      'BorderlandsCheats support for borderlandscheats.com and checkout links. Order and loader help goes through the seller channels on your receipt.',
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
