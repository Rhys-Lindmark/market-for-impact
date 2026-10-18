import test from 'node:test';
import assert from 'node:assert/strict';
import {summary,markdown,sources,contentsMapping} from '../lib/heppac-current-report.mjs';
import {reportSections} from '../lib/report-markdown.mjs';
import {groupReportSections} from '../lib/report-contents.mjs';
test('HEPPAC candidate report has clear summary, original sources and six contents groups',()=>{
 assert.equal(summary.intro.split(/\.\s+/).length,3);
 assert.equal(summary.reasons.length,3);assert.equal(summary.reservations.length,3);
 assert.equal(groupReportSections(reportSections(markdown),contentsMapping).length,6);
 assert.ok(markdown.split(/\s+/).length>2300);
 assert.equal(sources.filter(s=>s.url.includes('/full_text/')&&s.title.includes('original Form 990')).length,3);
 assert.equal(new Set(sources.map(s=>s.url)).size,sources.length);
 const financial=markdown.indexOf('## Spending breakdown and financial appendix');
 assert.ok(financial>markdown.indexOf('## Funding and previous grants'));
 assert.ok(markdown.indexOf('| June fiscal year')>financial);
 assert.match(markdown,/−2\.1282/);assert.match(markdown,/positive.*negative/);
});
