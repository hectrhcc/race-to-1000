import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const SITE = 'https://race-to-1000.vercel.app';

// Latest data update from our player dataset
const LAST_MOD = '2026-07-08';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  integrations: [
    sitemap({
      serialize(item) {
        // Normalize: strip trailing slash for consistent matching
        const url = item.url.replace(/\/+$/, '');

        // Home page — highest priority, updated daily
        if (url === SITE) {
          item.priority = 1.0;
          item.changefreq = 'daily';
          item.lastmod = LAST_MOD;
          return item;
        }

        // Ranking page — high priority, updated daily
        if (url === SITE + '/ranking') {
          item.priority = 0.9;
          item.changefreq = 'daily';
          item.lastmod = LAST_MOD;
          return item;
        }

        // Leyendas page — high priority, updated weekly
        if (url === SITE + '/leyendas') {
          item.priority = 0.8;
          item.changefreq = 'weekly';
          item.lastmod = LAST_MOD;
          return item;
        }

        // Default for any other pages
        item.priority = 0.7;
        item.changefreq = 'weekly';
        item.lastmod = LAST_MOD;
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
