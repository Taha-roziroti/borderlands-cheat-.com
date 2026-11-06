/** Human label for breadcrumbs from canonical slug path */
export function breadcrumbNameForSlug(slugPath: string): string {
  const map: Record<string, string> = {
    '/': 'Home',
    '/borderlands-3-aimbot/': 'Borderlands 3 Aimbot',
    '/borderlands-3-esp/': 'Borderlands 3 ESP',
    '/borderlands-3-pricing/': 'Borderlands 3 Pricing',
    '/cloud-dma-borderlands-3/': 'Cloud DMA',
    '/borderlands-3-cheats-setup/': 'Setup',
  };
  return map[slugPath] ?? slugPath;
}
