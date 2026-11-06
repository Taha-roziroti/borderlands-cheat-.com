import type { IconName } from '../components/icons/types';
import { normalizeInternalPath } from '../utils/path';

export type FaqTopic = 'all' | 'setup' | 'pricing' | 'cloud' | 'safety' | 'features';

export interface SiteFaqItem {
  id: string;
  topic: FaqTopic;
  icon: IconName;
  q: string;
  a: string;
  aHtml?: string;
}

function a(text: string): string {
  return text;
}

function link(text: string, href: string): string {
  return `<a href="${normalizeInternalPath(href)}">${text}</a>`;
}

const home = link('homepage', '/');
const aim = link('Borderlands 3 aimbot page', '/borderlands-3-aimbot/');
const esp = link('Borderlands 3 ESP page', '/borderlands-3-esp/');
const pricing = link('pricing page', '/borderlands-3-pricing/');
const dma = link('Cloud DMA page', '/cloud-dma-borderlands-3/');
const setup = link('setup guide', '/borderlands-3-cheats-setup/');

export const siteFaqs: SiteFaqItem[] = [
  {
    id: 'what-is',
    topic: 'features',
    icon: 'faqStatus',
    q: 'What are these Borderlands 3 cheats focused on?',
    a: a(
      'This product emphasizes configurable soft aim, enemy and boss ESP, loot rarity ESP, radar, gunfeel adjustments, stream-proof overlay, and profile save/load — not unlimited health, god mode, or unlimited ammo like many free trainers.',
    ),
  },
  {
    id: 'platform',
    topic: 'setup',
    icon: 'faqPlatforms',
    q: 'Which platform is supported?',
    a: a('PC Borderlands 3 on supported Windows builds with the documented Cloud DMA / Hyper-V prerequisites. Verify your exact storefront and client version against the seller’s current documentation.'),
  },
  {
    id: 'dma',
    topic: 'cloud',
    icon: 'navFeatures',
    q: 'What is Cloud DMA and do I need a second PC or DMA card?',
    a: `Cloud DMA is infrastructure for the supported cheat stack — typically a single-PC Hyper-V environment. This site does not state that you must buy an external DMA device or second computer; see the ${dma} for requirements.`,
  },
  {
    id: 'pricing-check',
    topic: 'pricing',
    icon: 'faqAfterBuy',
    q: 'How much does access cost?',
    a: `Pricing is shown on the ${pricing} and must be confirmed at checkout — amounts can change without this static site updating immediately.`,
  },
  {
    id: 'plans-same',
    topic: 'pricing',
    icon: 'faqComparePlans',
    q: 'Do monthly and lifetime include the same features?',
    a: a('The current product listing describes the same feature set for monthly and lifetime plans; always confirm on the live checkout page before paying.'),
  },
  {
    id: 'trainer-diff',
    topic: 'features',
    icon: 'faqPrivateCheats',
    q: 'How is this different from a free Borderlands 3 trainer?',
    a: `Free trainer pages often push god-mode style toggles. This paid product is positioned around soft aim, ESP, radar, and stream-proofing — read the ${home}, ${aim}, and ${esp} before comparing.`,
  },
  {
    id: 'ban-risk',
    topic: 'safety',
    icon: 'faqBanRisk',
    q: 'Can my account be penalized?',
    a: a('Yes. Third-party software can violate game terms and anti-cheat policies. Assume risk exists; read vendor status and accept it before using any cheat.'),
  },
  {
    id: 'setup-help',
    topic: 'setup',
    icon: 'faqBlogSetupLoader',
    q: 'Where are installation steps?',
    a: `Use the ${setup} for requirements and high-level preparation, then follow the current official product documentation from the seller for activation — we do not invent proprietary commands here.`,
  },
];

export function getLandingFaqs(): SiteFaqItem[] {
  return siteFaqs.filter((f) =>
    ['what-is', 'platform', 'dma', 'pricing-check', 'ban-risk', 'setup-help'].includes(f.id),
  );
}

export function getAllFaqs(): SiteFaqItem[] {
  return siteFaqs;
}

export const SITE_FAQ_SECTION_COPY = {
  eyebrow: 'All topics',
  title: 'Browse by category',
  subtitle: 'Filter answers about features, Cloud DMA, pricing, and setup.',
} as const;

export const SITE_FAQ_FILTER_TOPICS: FaqTopic[] = ['all', 'features', 'cloud', 'pricing', 'setup', 'safety'];

export const CONTEXTUAL_FAQ_SECTION_COPY = {
  eyebrow: 'FAQ',
  title: 'Questions about this page',
  subtitle: 'Short answers — see the FAQ page for the full list.',
} as const;

export function faqFilterTopicsForItems(items: SiteFaqItem[]): FaqTopic[] {
  const present = new Set(items.map((item) => item.topic));
  const topics: FaqTopic[] = ['all'];
  for (const topic of SITE_FAQ_FILTER_TOPICS) {
    if (topic !== 'all' && present.has(topic)) topics.push(topic);
  }
  return topics;
}
