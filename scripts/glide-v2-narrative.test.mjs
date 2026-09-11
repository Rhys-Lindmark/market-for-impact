import assert from 'node:assert/strict';
import {markdown} from '../lib/glide-v2-narrative.mjs';
import {reportSections,markdownBlocks} from '../lib/report-markdown.mjs';
const sections=reportSections(markdown);assert.equal(sections.length,12);assert.equal(sections[0].title,'Summary');
assert(markdown.split(/\s+/).length>10000);
const ids=new Set(sections.map(s=>s.id));for(const s of sections)for(const b of markdownBlocks(s.markdown))if(b.id)ids.add(b.id);
for(const m of markdown.matchAll(/\]\(#([^)]*)\)/g))assert(ids.has(m[1]),'missing '+m[1]);
