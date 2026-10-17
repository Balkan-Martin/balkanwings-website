// After updating the code from a new zip, add any NEW content fields to your existing content files.
// It never overwrites text you already have. Usage (from the project folder):
//   node server/merge-new-content.mjs /path/to/unzipped/pilot-school
import fs from 'node:fs';
import path from 'node:path';

const src = process.argv[2];
if (!src || !fs.existsSync(path.join(src, 'src/content'))) { console.error('Usage: node server/merge-new-content.mjs /path/to/unzipped/pilot-school'); process.exit(1); }
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
function merge(cur, neu, where, log) {
  for (const k of Object.keys(neu)) {
    if (!(k in cur)) { cur[k] = neu[k]; log.push(`${where}.${k}`); }
    else if (isObj(cur[k]) && isObj(neu[k])) merge(cur[k], neu[k], `${where}.${k}`, log);
  }
}
let total = 0;
for (const lang of ['en', 'bg']) {
  const dir = path.join(src, 'src/content', lang);
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const target = path.join('src/content', lang, f);
    const neu = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (!fs.existsSync(target)) { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, JSON.stringify(neu, null, 2) + '\n'); console.log(`new file: ${target}`); total++; continue; }
    const cur = JSON.parse(fs.readFileSync(target, 'utf8')); const log = [];
    merge(cur, neu, f, log);
    if (log.length) { fs.writeFileSync(target, JSON.stringify(cur, null, 2) + '\n'); log.forEach((l) => console.log(`added ${lang}/${l}`)); total += log.length; }
  }
}
console.log(total ? `Done: ${total} new field(s) added. Your existing text was not changed.` : 'Nothing to add: your content already has every field.');
