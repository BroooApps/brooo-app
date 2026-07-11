// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://brooo.app',
  redirects: {
    // Sutts renamed to Ember (2026-07-11); keep old URLs alive.
    '/sutts': '/ember',
    '/sutts/privacy': '/ember/privacy',
  },
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
});
