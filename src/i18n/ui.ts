// Site text lives in src/content/{en,bg}/*.json (edited through the CMS) and is merged here.
export const languages = { en: 'English', bg: 'Български' } as const;
export type Lang = keyof typeof languages;

const files = import.meta.glob('../content/*/*.json', { eager: true, import: 'default' }) as Record<string, any>;
const f = (l: string, n: string) => files[`../content/${l}/${n}.json`];
const build = (l: Lang) => ({
  ...f(l, 'site'), ...f(l, 'home'), ...f(l, 'school'),
  programs: f(l, 'programs'), about: f(l, 'about'), training: f(l, 'training'), faq: f(l, 'faq'), contact: f(l, 'contact'),
});
export const ui = { en: build('en'), bg: build('bg') };
export const t = (lang: Lang) => ui[lang];
// English lives at "/", Bulgarian at "/bg/".
export const path = (lang: Lang, p = '') => (lang === 'en' ? `/${p}` : `/bg/${p}`);
// Text still in [square brackets] is a placeholder and is never turned into a link.
export const isPlaceholder = (v: string) => v.trim().startsWith('[');
