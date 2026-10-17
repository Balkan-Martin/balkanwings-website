import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Production domain.
export default defineConfig({
  site: 'https://balkanwings.eu',
  output: 'static', // plain HTML/CSS/JS: works on any shared hosting
  trailingSlash: 'always',
  i18n: {
    locales: ['en', 'bg'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false } // English at /, Bulgarian at /bg/
  },
  integrations: [
    sitemap({ filter: (page) => !page.includes('/admin/'), i18n: { defaultLocale: 'en', locales: { en: 'en', bg: 'bg' } } })
  ]
});
