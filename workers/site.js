/**
 * Cloudflare Worker: force apex host and optional path redirects.
 * Route: *.borderlandscheats.com/* (or site-wide)
 */
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const hostname = url.hostname.toLowerCase();

    if (hostname === 'www.borderlandscheats.com') {
      url.hostname = 'borderlandscheats.com';
      return Response.redirect(url.toString(), 301);
    }

    return fetch(request);
  },
};
