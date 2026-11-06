import type { Translations } from './types';
import { PRIMARY_CHECKOUT_PATH } from '../config/checkout';
import { SUPPORT_EMAIL } from '../config/site';

export const en: Translations = {
  site: {
    name: 'BorderlandsCheats',
    domain: 'borderlandscheats.com',
    title: 'Borderlands 3 cheats for PC | soft aim, ESP & radar',
    description:
      'Borderlands 3 cheats overview for PC: soft aim, enemy and loot ESP, radar, and stream-proof overlay. Compare plans and setup on borderlandscheats.com.',
    discord: PRIMARY_CHECKOUT_PATH,
  },
  nav: [
    { href: '/#features', label: 'Features', scrollTarget: 'features' },
    { href: '/borderlands-3-aimbot/', label: 'Aimbot' },
    { href: '/borderlands-3-esp/', label: 'ESP' },
    { href: '/borderlands-3-pricing/', label: 'Pricing' },
    { href: '/cloud-dma-borderlands-3/', label: 'Cloud DMA' },
    { href: '/borderlands-3-cheats-setup/', label: 'Setup' },
    { href: '/support/', label: 'Support' },
  ],
  hero: {
    status: 'Borderlands 3 — PC',
    eyebrow: 'Premium PC software',
    titleLine1: 'Borderlands 3',
    titleLine2: 'Borderlands 3 Cheats for PC',
    subtitle:
      'Premium Borderlands 3 cheats built around configurable soft aim, enemy and boss ESP, loot rarity ESP, radar and a stream-proof overlay—so you can tune visibility and aiming without the unlimited-health trainer playbook.',
    ctaPrimary: 'Explore features',
    ctaDiscord: 'View available plans',
    modesLabel: 'Platform',
    modes: ['Windows 10 & 11', 'Steam / Epic (PC)', 'External overlay'],
    metrics: [
      { label: 'Focus', strong: 'Soft aim' },
      { label: 'Visibility', strong: 'ESP + radar' },
      { label: 'Capture', strong: 'Stream-proof' },
      { label: 'Setup', strong: 'Cloud DMA' },
    ],
  },
  features: {
    eyebrow: 'Features',
    title: 'Advanced Borderlands 3 cheat features',
    subtitle:
      'These modules are designed to work together: aim assistance stays in soft-aim territory, ESP and radar answer positioning questions, and overlays can stay off your stream.',
    items: [
      {
        title: 'Precision soft aim',
        subtitle: 'FOV, smoothing, bones',
        desc:
          'Configurable soft aim with aim key, FOV, smoothing, and bone selection (for example head, chest, or closest)—plus visible checks, FOV display, target lines, distance caps, and filters for teammates.',
        bullets: [
          'Adjust FOV and smoothing to match your sensitivity',
          'Pick head, chest, or closest bone per loadout',
          'Visible checks reduce wasted snaps through cover',
        ],
        tags: ['Borderlands 3 aimbot', 'soft aim', 'Borderlands 3 aim assist cheat'],
        bento: 'sm:col-span-2 lg:col-span-6 lg:col-start-1 lg:row-start-1',
      },
      {
        title: 'Enemy ESP & bosses',
        subtitle: 'Elites, weak points, health',
        desc:
          'Enemy ESP with health bars, elite and boss markers, weak-point highlights, and distance readouts so you can prioritize threats in crowded fights.',
        bullets: ['Boss and elite markers for target-rich moments', 'Weak-point highlighting where supported', 'Distance cues for engagement range'],
        tags: ['Borderlands 3 ESP', 'enemy ESP', 'boss markers'],
        bento: 'sm:col-span-2 lg:col-span-6 lg:col-start-7 lg:row-start-1',
      },
      {
        title: 'Loot ESP & radar',
        subtitle: 'Rarity, chests, objectives',
        desc:
          'Loot rarity ESP with gear filters, chest and cache markers, mission objective markers, and a 2D radar with range and zoom—different from enemy ESP, which answers who is dangerous right now.',
        bullets: ['Loot filters by rarity and gear type', 'Chest and cache markers for route planning', 'Radar zoom and range to match your playstyle'],
        tags: ['loot ESP', 'Borderlands 3 loot ESP', 'radar'],
        bento: 'sm:col-span-2 lg:col-span-8 lg:col-start-1 lg:row-start-2',
      },
      {
        title: 'Gunfeel controls',
        subtitle: 'Recoil & spread',
        desc:
          'Tune recoil and spread behavior to keep firefights readable—this is not a traditional infinite-ammo trainer package.',
        bullets: ['Recoil and spread options tied to the supported build', 'Works alongside soft aim for stable tracking'],
        tags: ['recoil', 'spread', 'Borderlands 3 hack'],
        bento: 'sm:col-span-2 lg:col-span-4 lg:col-start-9 lg:row-start-2',
      },
      {
        title: 'Stream-proof overlay',
        subtitle: 'Hide from capture',
        desc:
          'Keep overlays on your monitor while capture software records a clean gameplay feed—useful if you create content or share clips.',
        bullets: ['Designed for common capture paths—verify in your own setup', 'Toggle per session based on what you need visible'],
        tags: ['stream proof', 'overlay', 'OBS'],
        bento: 'sm:col-span-2 lg:col-span-6 lg:col-start-1 lg:row-start-3',
      },
      {
        title: 'Profiles & Cloud DMA',
        subtitle: 'Save configs — required stack',
        desc:
          'Save and load configuration presets after you find stable settings. Full functionality on supported builds is tied to the Cloud DMA setup (single-PC Hyper-V)—see the Cloud DMA page for requirements.',
        bullets: ['Named profiles for different characters or Mayhem levels', 'Cloud DMA is infrastructure, not a feature menu by itself'],
        tags: ['Cloud DMA', 'Hyper-V', 'Borderlands 3 cheats setup'],
        bento: 'sm:col-span-2 lg:col-span-6 lg:col-start-7 lg:row-start-3',
      },
    ],
  },
  whyUs: {
    eyebrow: 'Why this product',
    title: 'Built for BL3 — not a generic trainer paste',
    subtitle:
      'Free trainer sites often push unlimited health, ammo, and god-mode toggles. This product focuses on soft aim, ESP, radar, and stream-proofing instead—know what you are buying before checkout.',
    usLabel: 'BorderlandsCheats',
    otherLabel: 'Typical free trainer page',
    rows: [
      {
        title: 'Feature focus',
        desc: 'Soft aim, ESP, loot filters, radar, and stream-proof overlay—as described for the Borderlands 3 build—not a grab bag of every Valve-style console cheat.',
      },
      {
        title: 'Cloud DMA path',
        desc: 'Supported setups use Cloud DMA on a single PC (Hyper-V). You should not need an external DMA card or a second tower just to match the documented stack.',
      },
      {
        title: 'Configuration depth',
        desc: 'Sliders and toggles exist so you can tune aggression, visibility range, and radar zoom instead of running one-size defaults.',
      },
      {
        title: 'Honest positioning',
        desc: 'Third-party tools always carry risk. We do not claim undetected status or duplicate fake review scores—verify pricing and compatibility on the seller page.',
      },
      {
        title: 'Support channel',
        desc: 'After purchase, follow the official loader and portal documentation for activation—contact the seller support tied to your order if you are stuck.',
      },
      {
        title: 'What we do not advertise',
        desc: 'No unlimited health, god mode, or unlimited ammo as selling points here—those show up on competing trainer downloads, not this specification.',
      },
    ],
    metrics: [
      { value: 'PC', title: 'Platform', desc: 'Windows 10/11 with the documented Cloud DMA prerequisites.' },
      { value: 'ESP', title: 'Visibility stack', desc: 'Enemy, boss, loot, radar—described separately so pages stay distinct.' },
      { value: '$', title: 'Plans', desc: 'Monthly and lifetime options share the same feature set on the current listing—confirm before paying.' },
    ],
  },
  setup: {
    eyebrow: 'Setup guide',
    titleLead: 'From requirements to',
    titleHighlight: 'first launch',
    intro:
      'Start on the setup page for Windows version, RAM, GPU, Hyper-V, and security settings. Activation steps beyond high-level checks should follow the current official documentation from the seller.',
    ctaPrimary: 'Read setup guide',
    ctaSecondary: 'Cloud DMA overview',
    ctaPrimaryHref: '/borderlands-3-cheats-setup/',
    ctaSecondaryHref: '/cloud-dma-borderlands-3/',
    steps: [
      {
        step: 'Step 1',
        title: 'Confirm hardware & OS',
        desc: 'Match Windows 10 or 11, RAM, GPU, and virtualization support with the published requirements before purchase.',
      },
      {
        step: 'Step 2',
        title: 'Prepare Cloud DMA host',
        desc: 'Enable the Hyper-V role where required, configure isolation settings per the guide, and complete Cloud DMA activation.',
      },
      {
        step: 'Step 3',
        title: 'Configure modules',
        desc: 'Import or build soft aim and ESP profiles, set radar range, and test stream-proof behavior with your capture software.',
      },
    ],
  },
  compatibility: {
    eyebrow: 'Platform support',
    title: 'Runs where Borderlands 3 runs—on supported PC builds',
    subtitle: 'Compatibility is limited to the supported PC client and Windows stack described on the setup pages.',
    items: [
      'Windows 10 & 11 (64-bit)',
      '8 GB+ system RAM',
      'Dedicated GPU',
      'Hyper-V / virtualization capable CPU',
      'HVCI / Core Isolation awareness',
      'TPM & Secure Boot considerations',
      'Cloud DMA activation',
    ],
  },
  cheats: {
    eyebrow: 'Product',
    title: 'Borderlands 3 cheats',
    subtitle: 'One premium Borderlands 3 cheat for PC—feature detail on dedicated pages.',
    viewAll: 'Borderlands 3 pricing',
    explore: 'Explore',
    items: [],
  },
  products: {
    eyebrow: 'Guides',
    title: 'Deep dives',
    subtitle: 'Feature and infrastructure pages stay separate so each URL keeps a single primary keyword.',
    viewAll: 'Home',
    get: 'Open',
    explore: 'Read',
    items: [],
  },
  blog: {
    eyebrow: 'Updates',
    title: 'Articles',
    subtitle: '',
    latestTitle: '',
    latestSubtitle: '',
    filterAll: '',
    sortLabel: '',
    sortNewest: '',
    sortOldest: '',
    sortShortRead: '',
    sortLongRead: '',
    emptyFilter: '',
    viewAll: '',
    read: '',
    items: [],
  },
  toolkit: {
    eyebrow: 'Interface',
    title: 'Organized modules',
    subtitle: 'Groupings mirror how you tune a session: aim, visibility, loot, capture.',
    items: [
      { num: '01', label: 'Aim', title: 'Soft aim stack', desc: 'Keys, FOV, smoothing, bones, visibility checks.' },
      { num: '02', label: 'ESP', title: 'Combat awareness', desc: 'Enemies, bosses, health bars, weak points.' },
      { num: '03', label: 'Loot', title: 'Economy route', desc: 'Rarity ESP, filters, chest markers.' },
      { num: '04', label: 'Radar', title: 'Spatial picture', desc: '2D radar, zoom, and range.' },
      { num: '05', label: 'Gunfeel', title: 'Recoil & spread', desc: 'Tune weapon behavior alongside aim.' },
      { num: '06', label: 'Capture', title: 'Stream-proof', desc: 'Keep overlays off the recorded feed.' },
    ],
  },
  workflow: {
    eyebrow: 'How it works',
    badge: '4 steps',
    titleBefore: 'From plan selection to',
    titleHighlight: 'saved profile',
    subtitle: 'High-level flow before you rely on the seller’s step-by-step docs.',
    ctaLabel: 'View pricing',
    ctaHref: '/borderlands-3-pricing/',
    ctaSecondary: 'Setup requirements',
    ctaSecondaryHref: '/borderlands-3-cheats-setup/',
    items: [
      {
        num: '01',
        phase: 'Research',
        title: 'Read feature pages',
        desc: 'Skim aim, ESP, Cloud DMA, and setup so expectations match the supported build.',
      },
      {
        num: '02',
        phase: 'Purchase',
        title: 'Choose monthly or lifetime',
        desc: 'Plans currently advertise the same feature set—double-check the checkout screen for current price and duration.',
      },
      {
        num: '03',
        phase: 'Infrastructure',
        title: 'Activate Cloud DMA',
        desc: 'Complete the Hyper-V-based Cloud DMA environment on the supported single-PC layout.',
      },
      {
        num: '04',
        phase: 'Play',
        title: 'Load your profile',
        desc: 'Dial in soft aim and ESP, save configs, and verify stream-proof toggles.',
      },
    ],
  },
  fieldNotes: {
    eyebrow: 'Notes',
    title: 'Before you queue',
    items: [
      { num: '01', title: 'Match documentation', desc: 'Game patches can change behavior—follow the seller’s current guide.' },
      { num: '02', title: 'Tune conservatively', desc: 'Start with wider FOV, slower smoothing, and shorter ESP ranges.' },
      { num: '03', title: 'Know the risk', desc: 'Anti-cheat and reporting policies evolve; third-party tools can lead to account action.' },
    ],
  },
  support: {
    eyebrow: 'Support',
    title: 'BorderlandsCheats support',
    subtitle: 'Questions about this site or checkout links? Reach out with your order details.',
    channels: [
      {
        icon: 'users',
        title: 'Purchases & portal',
        desc: 'Use checkout from pricing or the header—your order flow is handled by the linked seller.',
        linkLabel: 'Go to checkout',
        href: PRIMARY_CHECKOUT_PATH,
      },
      {
        icon: 'headphones',
        title: 'Email',
        desc: 'Include your order email and Windows build when asking for help.',
        linkLabel: SUPPORT_EMAIL,
        href: `mailto:${SUPPORT_EMAIL}`,
      },
      {
        icon: 'navFaq',
        title: 'FAQ on this site',
        desc: 'Ordering, Cloud DMA, and setup—without duplicating the seller’s activation manual.',
        linkLabel: 'Read FAQ',
        href: '/faq/',
      },
    ],
    ticketTitle: 'Include in your message',
    ticketItems: [
      { title: 'Order email', desc: 'The address used when you completed checkout.' },
      { title: 'OS build', desc: 'Windows 10 or 11 version and whether Hyper-V is enabled.' },
      { title: 'What you tried', desc: 'Screenshot or exact text from loader or Cloud DMA steps you already followed.' },
    ],
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Straight answers before checkout',
    subtitle: 'Compatibility, pricing, and Cloud DMA—visible on-page for schema.',
    items: [],
  },
  footer: {
    tagline: 'Borderlands 3 cheats for PC — soft aim, ESP, radar & Cloud DMA. borderlandscheats.com',
    explore: 'Explore',
    exploreLinks: [
      { href: '/#features', label: 'Feature overview', ariaLabel: 'Features', scrollTarget: 'features' },
      { href: '/borderlands-3-aimbot/', label: 'Borderlands 3 aimbot', ariaLabel: 'Aimbot' },
      { href: '/borderlands-3-esp/', label: 'Borderlands 3 ESP', ariaLabel: 'ESP' },
      { href: '/borderlands-3-pricing/', label: 'Pricing', ariaLabel: 'Pricing' },
      { href: '/cloud-dma-borderlands-3/', label: 'Cloud DMA', ariaLabel: 'Cloud DMA' },
      { href: '/borderlands-3-cheats-setup/', label: 'Setup guide', ariaLabel: 'Setup' },
      { href: '/faq/', label: 'FAQ', ariaLabel: 'FAQ' },
    ],
    support: 'Support',
    legal: 'Legal',
    privacy: 'Privacy Policy',
    terms: 'Terms & Conditions',
    about: 'About',
  },
  legalPages: {
    about: {
      title: 'About BorderlandsCheats',
      description:
        'About BorderlandsCheats: informational pages on premium Borderlands 3 PC cheat software, Cloud DMA context, and setup at borderlandscheats.com.',
      sections: [
        {
          heading: 'Who we are',
          paragraphs: [
            'BorderlandsCheats is a marketing and documentation site for a third-party Borderlands 3 cheat product sold through an external checkout. We outline features such as soft aim, ESP, radar, and Cloud DMA requirements so you can compare against free trainer downloads.',
            'Gearbox, Borderlands, and related marks belong to their owners; this site is not affiliated with them.',
          ],
        },
        {
          heading: 'What we publish',
          paragraphs: [
            'Feature pages (aim, ESP), pricing context, Cloud DMA infrastructure notes, setup guidance, FAQs, and legal notices. Purchase fulfillment and loader delivery are handled by the seller after checkout.',
          ],
        },
        {
          heading: 'Support',
          paragraphs: [
            'Use the email on the Support page for questions about borderlandscheats.com. Product-specific loader issues should go through the seller’s support tied to your order.',
          ],
        },
      ],
    },
    privacy: {
      title: 'BorderlandsCheats privacy policy',
      description:
        'BorderlandsCheats privacy policy: how borderlandscheats.com uses analytics, cookies, and contact data when you browse or email support.',
      sections: [
        {
          heading: 'Information we collect',
          paragraphs: [
            'We may collect standard analytics such as page views, device type, browser, and approximate region when enabled. Checkout happens on external pages—we do not store payment card data on this domain.',
          ],
        },
        {
          heading: 'How we use data',
          paragraphs: [
            'Analytics help us improve content. Support messages retain your email and text until the thread is resolved.',
          ],
        },
        {
          heading: 'Cookies',
          paragraphs: [
            'We use minimal cookies for analytics and theme storage. You can block cookies in your browser.',
          ],
        },
        {
          heading: 'Contact',
          paragraphs: [
            'Privacy questions: use the Support page. Purchase terms are in Terms & Conditions.',
          ],
        },
      ],
    },
    terms: {
      title: 'BorderlandsCheats terms of use',
      description:
        'BorderlandsCheats terms for borderlandscheats.com and purchases you start through linked checkout pages.',
      sections: [
        {
          heading: 'Agreement',
          paragraphs: [
            'By using borderlandscheats.com or completing checkout through our links, you agree to these Terms and our Privacy Policy.',
          ],
        },
        {
          heading: 'Third-party products',
          paragraphs: [
            'Software for Borderlands 3 is sold and delivered by a third party. Feature lists and prices on this site are informational—verify at checkout before paying.',
          ],
        },
        {
          heading: 'Risk',
          paragraphs: [
            'Cheating violates most game terms of service and may result in bans. You use third-party tools at your own risk.',
          ],
        },
        {
          heading: 'Support',
          paragraphs: [
            'Site questions via our Support page; product and license issues through the seller’s channels.',
          ],
        },
      ],
    },
    support: {
      title: 'BorderlandsCheats Support',
      description:
        'Contact options for borderlandscheats.com.',
    },
  },
  ui: {
    skipLink: 'Skip to main content',
    browseCheats: 'Checkout',
    browseCheatsMobile: 'Checkout',
    homeAria: 'BorderlandsCheats home',
    checkoutAria: 'Open checkout options',
    checkoutChoiceTitle: 'Choose a product',
    checkoutChoiceSubtitle: 'Select which plan you want to open at checkout.',
    checkoutChoiceBl3: 'Borderlands 3 — main cheat',
    checkoutChoiceCloudDma: 'Cloud DMA',
    checkoutChoiceSpoofer: 'HWID spoofer',
    checkoutChoiceCancel: 'Cancel',
    discordAria: 'View pricing plans',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    themeLight: 'Switch to light mode',
    themeDark: 'Switch to dark mode',
  },
};
