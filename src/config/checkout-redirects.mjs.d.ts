export declare const AFFILIATE_BASE: string;

export declare const CHECKOUT_URLS: {
  readonly borderlands3: string;
  readonly cloudDma: string;
  readonly hwidSpoofer: string;
};

export declare const CHECKOUT_PATH_REDIRECTS: ReadonlyMap<string, string>;

export declare function resolveCheckoutPathRedirect(pathname: string): string | null;
