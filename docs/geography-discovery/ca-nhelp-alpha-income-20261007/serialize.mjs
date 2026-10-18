import fs from 'node:fs';
import {calculate,scenarios,pathway} from './model.mjs';
const registry=JSON.parse(fs.readFileSync(new URL('../market-for-impact-california-six-surgery-beta/data/geography-reports.json',import.meta.url)));
const original=registry.reports.find(r=>r.edition==='california'&&r.slug==='national-health-law-program');
if(process.argv[2]==='original')console.log(JSON.stringify(original));
else if(process.argv[2]==='ledger')console.log(JSON.stringify(scenarios.map(([id,o])=>({id,...calculate(o)}))));
else {
 const report=structuredClone(original);report.updated='2026-10-07';report.model.version='ca-nhelp-initial-income-v3';
 report.sources.push({id:'nhelp-income-oregon',title:'Oregon Health Insurance Experiment: Evidence from the First Year',publisher:'Finkelstein et al. / NBER',url:'https://www.nber.org/papers/w17190',published:null,retrieved:'2026-10-07'});
 const note=fs.readFileSync(new URL('./source-note.md',import.meta.url),'utf8');
 report.sections.cost+='\n\n'+note.split('Decision: ')[1].split('\n\n')[0];
 report.model.scenarios=scenarios.map(([id,o])=>{const z=calculate(o);return {id,label:id,costUSD:z.costUSD,editionQalys:z.editionQalys,allPopulationQalys:z.allPopulationQalys,assumptions:JSON.stringify(z.x),...(id==='income-unknown'?{incomeUnknown:true}:{incomePathways:[...(z.people>0?[pathway(z)]:[]),...(z.x.payerPeople>0?[pathway(z,true)]:[])]})};});
 report.priceScope='Conditional Medicaid-rule health and signed net resource equivalence; marginal gift capacity proxy';
 report.model.costScope+=' Explicit marginal unrestricted-gift capacity proxy retains b=.25; annual-capacity sensitivity b=1 changes question.';
 report.model.formula+=' Household net=.5*avoidedOop-premiums-taxBenefitLoss-travelTime-otherBurden; income=.5*people*A*log(1+net/before); disjoint signed payer incidence added separately. All resource coefficients judgments.';
 report.model.missingInputs.push('Annual causal net household cash/consumption protection, income baseline, overlap and public/provider incidence attributable to added NHeLP capacity.');
 console.log(JSON.stringify(report));
}
