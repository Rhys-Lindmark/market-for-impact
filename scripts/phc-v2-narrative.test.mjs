import assert from 'node:assert/strict';
import fs from 'node:fs';
import report from '../data/san-francisco/phc-v2-report.json' with {type:'json'};
import {reportSections,markdownBlocks} from '../lib/report-markdown.mjs';
assert.equal(report.fullMarkdown.trimEnd(),fs.readFileSync(new URL('../docs/reports/phc-v2.md',import.meta.url),'utf8').trimEnd());
const sections=reportSections(report.fullMarkdown);assert.equal(sections.length,10);assert(report.fullMarkdown.split(/\s+/).length>6000);
const ids=new Set(sections.map(s=>s.id));for(const s of sections)for(const b of markdownBlocks(s.markdown))if(b.id)ids.add(b.id);
for(const m of report.fullMarkdown.matchAll(/\]\(#([^)]*)\)/g))assert(ids.has(m[1]),m[1]);
assert(report.fullMarkdown.includes('Bridge Campaign'));assert(report.fullMarkdown.includes('post-cut'));
