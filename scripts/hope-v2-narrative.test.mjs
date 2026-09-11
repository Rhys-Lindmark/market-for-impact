import assert from 'node:assert/strict';
import report from '../data/san-francisco/hope-v2-report.json' with {type:'json'};
import {reportSections,markdownBlocks} from '../lib/report-markdown.mjs';
const text=report.longForm.markdown,sections=reportSections(text);assert.equal(sections.length,9);assert(text.split(/\s+/).length>5000);
const ids=new Set(sections.map(s=>s.id));for(const s of sections)for(const b of markdownBlocks(s.markdown))if(b.id)ids.add(b.id);
for(const m of text.matchAll(/\]\(#([^)]*)\)/g))assert(ids.has(m[1]),'Missing '+m[1]);
