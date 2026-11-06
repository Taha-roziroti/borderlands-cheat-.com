/**
 * Single source of truth for Borderlands 3 product pricing shown on the site.
 * Verify against the live product page before each deploy — prices can change.
 */
export const BL3_PRICING = {
  currency: 'USD',
  monthly: {
    label: 'Monthly access',
    price: 35,
    durationDays: 31,
    description: '31 days of access with the full feature set.',
  },
  lifetime: {
    label: 'Lifetime access',
    price: 150,
    description: 'Unlimited access with the same feature set as monthly.',
  },
} as const;
