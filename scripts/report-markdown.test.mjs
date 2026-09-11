import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {reportSections,markdownBlocks,safeReportLink} from '../lib/report-markdown.mjs';
test('research blocks preserve tables, prose and lists',()=>{
 const blocks=markdownBlocks('### Spending breakdown\n\n| Year | Expense |\n| --- | --- |\n| 2025 | $72,583 |\n\n- First\n- Second\n\nLast paragraph.');
 assert.deepEqual(blocks.map(b=>b.type),['heading','table','list','paragraph']);
 assert.deepEqual(blocks[1].rows,[['2025','$72,583']]);
});
test('reviewed links cannot execute script or redirect protocol',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,x','//evil.test'])assert.equal(safeReportLink(url),undefined);
 assert.equal(safeReportLink('#summary'),'#summary');
 assert.equal(safeReportLink('https://example.com/'),'https://example.com/');
});
test('complete ReCARES narrative, More anchors and spending tables survive parsing',()=>{
 const {markdown}=JSON.parse(fs.readFileSync(new URL('../data/bay/recares-v2-narrative.json',import.meta.url)));
 assert.equal(markdown,fs.readFileSync(new URL('../docs/reports/recares-v2.md',import.meta.url),'utf8'));
 const sections=reportSections(markdown);assert.equal(sections.length,10);assert.equal(sections[0].title,'Summary');
 const ids=new Set(sections.map(s=>s.id));
 for(const match of markdown.matchAll(/\]\(#([^\)]+)\)/g))assert.ok(ids.has(match[1]),'Missing target '+match[1]);
 const blocks=sections.flatMap(s=>markdownBlocks(s.markdown));
 assert.ok(blocks.filter(b=>b.type==='table').length>=3);
 assert.ok(markdown.split(/\s+/).length>9000);
 assert.throws(()=>reportSections('## Summary\nA\n## Summary\nB'));
});
