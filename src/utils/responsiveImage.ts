const RASTER_EXT = /\.(png|jpe?g|webp)$/i;

/** 400w covers ~330px card slots at 1x; 640w covers 2x retina. */
export const CARD_IMAGE_WIDTHS = [400, 640] as const;
export const CARD_IMAGE_SIZES = '(min-width: 1024px) 330px, (min-width: 640px) 50vw, 100vw';
/** 512w matches hero slider display (~487px at 1x); 640/960 for larger viewports and retina. */
export const HERO_IMAGE_WIDTHS = [512, 640, 768, 960] as const;
export const HERO_IMAGE_SIZES = '(min-width: 1024px) 490px, 100vw';
/** Thumbs ~148px CSS; 320w covers 2x DPR without pulling 640/960. */
export const THUMB_IMAGE_WIDTHS = [320, 400] as const;
export const DEFAULT_IMAGE_WIDTHS = [640, 960] as const;
/** Inline MDX / prose: matches ~max-w-3xl (48rem) column; 400/640/960 from optimize-images.mjs */
export const PROSE_IMAGE_WIDTHS = [400, 640, 960] as const;
export const PROSE_IMAGE_SIZES = '(min-width: 768px) 768px, 100vw';

export function stripRasterExt(src: string): string {
  return src.replace(RASTER_EXT, '');
}

export function webpSrc(src: string, width: number): string {
  return `${stripRasterExt(src)}-${width}.webp`;
}

export function responsiveSrcSet(src: string, widths: readonly number[] = DEFAULT_IMAGE_WIDTHS): string {
  return widths.map((width) => `${webpSrc(src, width)} ${width}w`).join(', ');
}

/** Smallest variant — used as img src so Lighthouse and no-srcset clients get the right size. */
export function defaultWebpSrc(src: string, widths: readonly number[]): string {
  return webpSrc(src, widths[0] ?? 640);
}
