import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reportSections,markdownBlocks} from '../lib/report-markdown.mjs';
import narrative from '../data/san-francisco/hac-v2-narrative.json' with {type:'json'};
assert.equal(narrative.markdown,fs.readFileSync(new URL('../docs/reports/hac-v2.md',import.meta.url),'utf8'));
const sections=reportSections(narrative.markdown);assert.equal(sections.length,10);assert(narrative.markdown.split(/\s+/).length>6500);
const ids=new Set(sections.map(s=>s.id));for(const s of sections)for(const b of markdownBlocks(s.markdown))if(b.id)ids.add(b.id);
for(const m of narrative.markdown.matchAll(/\]\(#([^)]*)\)/g))assert(ids.has(m[1]),m[1]);
