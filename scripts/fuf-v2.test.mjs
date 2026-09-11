import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculate,diagnostics} from '../lib/fuf-v2-model.mjs';
import report from '../data/sf/fuf-v2-report.json' with {type:'json'};
import {reportSections,markdownBlocks} from '../lib/report-markdown.mjs';
assert.equal(calculate().scenarios.find(s=>s.name==='central').modeledOrdinaryGiftCostPer10Qaly,1652627.0127335358);assert.equal(calculate().weighted.modeledOrdinaryGiftCostPer10Qaly,941689.0826917188);assert(diagnostics());
assert.equal(report.markdown.trimEnd(),fs.readFileSync(new URL('../docs/reports/fuf-v2.md',import.meta.url),'utf8').trimEnd());assert(report.markdown.split(/\s+/).length>4900);const sections=reportSections(report.markdown);assert.equal(sections.length,9);
const ids=new Set(sections.map(s=>s.id));for(const s of sections)for(const b of markdownBlocks(s.markdown))if(b.id)ids.add(b.id);
for(const m of report.markdown.matchAll(/\]\(#([^)]*)\)/g))assert(ids.has(m[1]),m[1]);
