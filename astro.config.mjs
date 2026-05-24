// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://brooo.app',
  integrations: [sitemap()],

  build: {
    inlineStylesheets: 'auto',
  },

  adapter: cloudflare(),
});