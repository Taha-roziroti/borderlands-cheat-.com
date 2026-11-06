import { defineMiddleware } from 'astro:middleware';
import { resolveCheckoutPathRedirect } from './config/checkout-redirects.mjs';

export const onRequest = defineMiddleware((context, next) => {
  const destination = resolveCheckoutPathRedirect(new URL(context.request.url).pathname);
  if (destination) {
    return context.redirect(destination, 301);
  }
  return next();
});
