import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reportPrice,scenarioIncomeEquivalent} from '../lib/geography-reports.mjs';
import * as hh from '../docs/geography-discovery/ca-hhcla-alpha-income-20261007/model.mjs';
import * as dh from '../docs/geography-discovery/ca-didihirsch-alpha-income-20261007/model.mjs';
import * as br from '../docs/geography-discovery/ca-breathe-alpha-income-20261007/model.mjs';
import * as cp from '../docs/geography-discovery/ca-childrens-partnership-alpha-income-20261007/model.mjs';
import * as nc from '../docs/geography-discovery/ca-nourish-alpha-income-20261007/model.mjs';
import * as cwc from '../docs/geography-discovery/ca-cwc-alpha-income-20261007/model.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
for(const [slug,model,dir] of [['homeless-health-care-los-angeles',hh,'ca-hhcla-alpha-income-20261007'],['didi-hirsch-mental-health-services',dh,'ca-didihirsch-alpha-income-20261007'],['breathe-southern-california',br,'ca-breathe-alpha-income-20261007'],['childrens-partnership',cp,'ca-childrens-partnership-alpha-income-20261007'],['nourish-california',nc,'ca-nourish-alpha-income-20261007'],['community-water-center',cwc,'ca-cwc-alpha-income-20261007']])test(slug+' signed initial ledger reproduces without dropping access costs',()=>{
 const report=data.reports.find(r=>r.edition==='california'&&r.slug===slug);
 const ledger=JSON.parse(fs.readFileSync(new URL('../docs/geography-discovery/'+dir+'/ledger.json',import.meta.url)));
 model.tests();
 for(const [id,parameters,clinical] of model.scenarios){const z=model.calculate(parameters,clinical),s=report.model.scenarios.find(s=>s.id===id);assert(s,id);assert.equal(s.editionQalys,z.editionQalys);if(id==='income-unknown'){assert.equal(scenarioIncomeEquivalent(s),null);continue;}assert(Math.abs(scenarioIncomeEquivalent(s)-z.income)<1e-12);assert(ledger.some(row=>row.id===id));}
 assert(Math.abs(reportPrice(report)-model.calculate().price10)<1e-6);
 if(model===cp){assert(model.calculate({},false).income>0);assert.equal(model.calculate({u:0,medicalSaving:100}).income,model.calculate({u:0}).income);assert.equal(model.calculate({medicalSaving:100}).groups[0].people,3.125);}
 else if(model===nc){assert(model.calculate({},false).income>0);assert(model.calculate({convertedShare:0}).income<0);}
 else assert(model.calculate({},false).income<0);
 assert(model.calculate({positiveShare:0}).income<0);
 assert.equal(report.stage,'alpha');
 if(model===cwc){assert.equal(model.calculate({n:0}).income,model.calculate().income);assert.equal(model.calculate({u:0}).income,model.calculate().income);}
});
