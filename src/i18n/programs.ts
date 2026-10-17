import { getCollection } from 'astro:content';
import type { Lang } from './ui';

// Published programs for one language, ordered by the "order" field, then by title.
export async function getPrograms(lang: Lang) {
  const all = await getCollection('programs', ({ id, data }) => id.startsWith(lang + '/') && !data.draft);
  return all
    .map((entry) => ({ entry, data: entry.data, slug: entry.id.split('/')[1] }))
    .sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title, lang));
}
