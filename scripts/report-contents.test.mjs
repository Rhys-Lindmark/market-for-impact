import test from 'node:test';
import assert from 'node:assert/strict';
import {groupReportSections,researchGroups} from '../lib/report-contents.mjs';
test('grouping preserves every original section and anchor exactly once',()=>{
 const sections=[{id:'money',markdown:'Model text'},{id:'intro',markdown:'Summary text'},{id:'spending',markdown:'Costs'}];
 const groups=groupReportSections(sections,{money:'cost',intro:'summary',spending:'cost'});
 assert.deepEqual(groups.map(g=>g.id),['research-summary','research-cost']);
 assert.deepEqual(groups.flatMap(g=>g.sections),[sections[1],sections[0],sections[2]]);
 assert.equal(researchGroups.length,6);
 assert.throws(()=>groupReportSections(sections,{money:'cost'}));
 assert.throws(()=>groupReportSections(sections,{money:'cost',intro:'summary',spending:'nonsense'}));
});
