// Builds report.json for Bottom Line (New York City, in-depth) from calculate.mjs.
import fs from 'node:fs';
import {inputs,derived,scenarios,price} from './calculate.mjs';
const dir=new URL('.',import.meta.url);
const sc=scenarios(),p=Object.fromEntries(sc.map(s=>[s.id,price(s)]));
const fmt=x=>'$'+(x>=1e6?(x/1e6).toFixed(2)+'M':Math.round(x/1e3)+'K')+' per better life';
const usd=x=>'$'+Math.round(x).toLocaleString('en-US');
const retrieved='2026-10-18';
const report={
 edition:'new-york-city',boundaryVersion:'OMB-23-01-2023-07-21',organizationId:'ein:04-3351427',slug:'bottom-line',
 organization:'Bottom Line',
 program:'One-on-one college application and degree-completion advising for low-income students',
 published:retrieved,updated:retrieved,stage:'beta',donationUrl:'https://www.bottomline.org/',
 acceptance:{status:'accepted',evidence:'docs/geography-discovery/nyc-bottom-line-beta-20261018/acceptance.md — separately timed source and model audit by the same AI model; not an independent second agent.'},
 priceScope:'Whole-organization annual cost per new entrant against randomized bachelor’s-degree gains and an assumed causal earnings premium; income-only welfare comparison, not a verified marginal gift offer',
 summary:{
  what:[
   'Bottom Line advises students from families under 200% of the poverty line with at least a 2.5 GPA, starting in their senior year of high school, on choosing, applying to and paying for college.',
   'Students who enroll at one of its partner colleges keep a Bottom Line advisor for up to six years, meeting several times a semester.',
   'This in-depth review prices the organization’s whole annual cost per new student against the extra bachelor’s degrees found in a randomized trial in Boston, Worcester and New York City.'
  ],
  strengths:[
   'A randomized trial of 2,422 students found 7.6 percentage points more bachelor’s degrees within five years, a 16% increase; the New York City site alone showed 7.2 points.',
   'The gains came mainly from students enrolling at colleges with higher graduation rates and earnings, without higher net prices.',
   'At about $4,200 per offered student in the trial, the authors find over two percentage points of added degree attainment per $1,000 spent, more than most rigorously evaluated financial-aid programs.'
  ],
  reservations:[
   `Our working estimate is about ${fmt(p.central)}; all of it is income, and the earnings effect of the extra degrees has not yet been measured.`,
   'We assume a $12,000 annual earnings premium for a bachelor’s degree and treat 75% of it as causal and 80% as non-positional; these are judgments.',
   `Cost per new student today (${usd(derived.wholeCostPerEntrant)}) rests on an assumed 40% share of served students being new entrants.`
  ]
 },
 sections:{
  what:'Bottom Line (The Bottom Line Inc, EIN 04-3351427) was founded in Boston in 1997 and operates in Massachusetts, New York City and Chicago, with newer sites in Ohio. Its Access program pairs high school seniors from families earning under 200% of the poverty line with full-time advisors, who meet them every three to four weeks to choose colleges, apply, complete financial aid forms and decide where to enroll. Students who enroll at one of 52 partner institutions join its Success program, with advising for up to six years. It served 6,679 students in 2023. A donation supports the whole organization.',
  monitoring:'Bottom Line ran lotteries for oversubscribed places for the high school classes of 2015 and 2016, which Andrew Barr and Benjamin Castleman evaluated as a randomized trial of 2,422 students in Boston, Worcester and New York City. Degree outcomes come from the National Student Clearinghouse. The latest version is NBER working paper 33921 (2025). Arnold Ventures rates the program Top Tier and is funding a 2022–2026 follow-up on employment, earnings and debt, which has not yet reported. Bottom Line publishes annual reports with student counts. Its Chicago site opened in 2014 and was not in the trial. We have not contacted the organization.',
  qualitative:'The trial evidence on degrees is strong. Students offered advising were 7.6 percentage points more likely to earn a bachelor’s degree within five years (16% more than the control group). The first cohort showed 9.6 points within six years; an Arnold Ventures summary reports 55% versus 47% after six years. Effects were similar in the Boston area (7.4 points) and New York City (7.2 points). The authors attribute most of the gain to initial college choice: treated students were 11 points more likely to enroll where graduates earn above the median, with no significant difference in net price. Two links remain unmeasured: how much the extra degrees raise these students’ earnings, and how much of a degree’s value is positional rather than added skill.',
  cost:`Our central estimate is **${fmt(p.central)}**, using ten healthy-year welfare equivalents. It is an income-only comparison: we credit no health gain.\n\n**Cost.** We divide the FY2023 total expense, $19.2M, by an assumed 2,672 new entrants (40% of the 6,679 students served), giving ${usd(derived.wholeCostPerEntrant)} per new student, which covers the whole organization. The trial measured $4,161 per offered student for Access plus Success advising, including overhead, or about ${usd(derived.trialCost2025)} today.\n\n**Benefit.** Each offered student gains 0.08 bachelor’s degrees. We credit a $12,000 annual earnings premium, 55% of it as net household welfare after taxes, lost benefits and extra time in school, from age 23 for 35 years, discounted at 3%, on a $35,000 adult-income base. We count 75% of the premium as causal, 80% as non-positional and 85% as earned while living in the NYC metro.\n\n**Range.** At the trial cost the estimate is ${fmt(p['trial-cost'])}. Using the first cohort\u2019s six-year +9.6-point effect gives ${fmt(p['first-cohort-six-year'])}; a $6,000 premium gives ${fmt(p['low-premium'])}; treating half the premium as positional gives ${fmt(p['mostly-signaling'])}. If the extra degrees do not raise earnings, there is no credited benefit.`,
  funding:'Bottom Line reported FY2023 revenue of $36.5M, almost all contributions ($35.4M), and expenses of $19.2M, up from $14.9M in FY2022 and $12.8M in FY2021. The FY2023 surplus may partly reflect multi-year gifts; the trial authors note a recent $15M grant to expand into Ohio. Arnold Ventures funded the trial and its earnings follow-up. Because recent revenue exceeds spending, an additional gift may be less needed in the short term, and room for more funding in New York is unverified.'
 },
 sources:[
  {id:'bl-nber-2025',title:'Increasing Degree Attainment Among Low-Income Students: The Role of Intensive Advising and College Quality (NBER w33921)',publisher:'National Bureau of Economic Research (Barr and Castleman)',url:'https://www.nber.org/system/files/working_papers/w33921/w33921.pdf',published:'2025-06-01',retrieved},
  {id:'bl-spw',title:'Bottom Line: program evidence summary',publisher:'Arnold Ventures, Social Programs That Work',url:'https://evidencebasedprograms.org/programs/bottom-line/',published:null,retrieved},
  {id:'bl-av',title:'Long-term follow-up of the RCT of Bottom Line on employment, earnings and debt',publisher:'Arnold Ventures',url:'https://arnoldventures.org/stories/long-term-follow-up-of-the-rct-of-bottom-line-to-evaluate-the-impacts-of-a-successful-college-advising-program-on-employment-earnings-and-debt-accumulation',published:null,retrieved},
  {id:'bl-annual-2023',title:'Bottom Line Annual Report 2023',publisher:'Bottom Line',url:'https://bottomline.org/wp-content/uploads/2025/01/BL-Annual-Report-2023.pdf',published:null,retrieved},
  {id:'propublica',title:'The Bottom Line Inc, Form 990 filings (EIN 04-3351427)',publisher:'IRS, hosted by ProPublica',url:'https://projects.propublica.org/nonprofits/organizations/43351427',published:null,retrieved},
  {id:'income-cg',title:'Cost-effectiveness: health and log-income comparison',publisher:'Coefficient Giving',url:'https://coefficientgiving.org/research/cost-effectiveness/',published:null,retrieved}
 ],
 model:{
  version:'bottom-line-nyc-beta-income-20261018',
  costScope:'FY2023 whole-organization expense divided by judged annual new entrants (40% of students served).',
  geographicAttribution:'New York City Direct students; 0.85 of adult earning years assumed lived in the NYC metro.',
  formula:'Price = 10 × cost per entrant ÷ [0.5 × discounted years(35, from year 6) × ln(1 + premium × net share ÷ base) × BA effect × causal × non-positional × NYC share]. Health = 0.',
  counterfactual:'Randomized control students with ordinary school counseling and any other help.',
  attribution:'A gift is credited with the average effect of an added entrant at whole-organization average cost; whether a gift adds a New York student is unverified.',
  uncertainty:'Dominated by the earnings premium of the extra degrees and how much is positional, then by current cost per entrant.',
  nativeOutcomes:'Bachelor’s degree within five to seven years, college quality at enrollment; earnings follow-up pending.',
  inputs:[
   {name:'FY2023 total expense',value:inputs.totalExpenseFY2023,unit:'USD',basis:'observed',rationale:'Form 990, fiscal year ending June 2023.',sourceIds:['propublica']},
   {name:'Students served 2023',value:inputs.studentsServedFY2023,unit:'students',basis:'observed',rationale:'Access, Success and Bluprint, 2023 annual report.',sourceIds:['bl-annual-2023']},
   {name:'New-entrant share',value:inputs.newEntrantShare,unit:'share',basis:'judgment',rationale:'Access is one year; Success lasts up to six, so most served students are continuing.',sourceIds:[]},
   {name:'Trial cost per offered student',value:inputs.trialCostPerOfferedStudent,unit:'USD',basis:'observed',rationale:'Access plus Success, including overhead.',sourceIds:['bl-nber-2025']},
   {name:'Bachelor’s degree effect',value:inputs.baEffect,unit:'degrees per offered student',basis:'judgment',rationale:'Between NYC 5-year +7.2 pp, pooled +7.6 pp and 7-year +10 pp.',sourceIds:['bl-nber-2025','bl-spw']},
   {name:'Gross degree premium',value:inputs.grossBaPremium,unit:'USD per year',basis:'judgment',rationale:'Bachelor’s versus some college for these students; not measured in the trial.',sourceIds:[]},
   {name:'Net welfare share',value:inputs.netWelfareShare,unit:'share',basis:'judgment',rationale:'After taxes, lost benefits and extra schooling time.',sourceIds:[]},
   {name:'Causal share of premium',value:inputs.causalPremium,unit:'share',basis:'judgment',rationale:'Marginal graduates may gain less than average graduates.',sourceIds:[]},
   {name:'Non-positional share',value:inputs.nonDisplacement,unit:'share',basis:'judgment',rationale:'Part of a degree’s value may come at others’ expense.',sourceIds:[]},
   {name:'NYC share of adult years',value:inputs.editionShare,unit:'share',basis:'judgment',rationale:'Allows for moving away after college.',sourceIds:[]},
   {name:'CPI adjustment 2016 to 2025',value:inputs.cpi2016to2025,unit:'ratio',basis:'judgment',rationale:'Approximate CPI-U change.',sourceIds:[]}
  ],
  scenarios:sc,
  sensitivity:sc.filter(s=>s.id!=='central').map(s=>({id:s.id,label:s.label,pricePer10:p[s.id]??undefined,assumptions:s.assumptions})),
  missingInputs:['Measured earnings of trial participants (follow-up due 2026).','New Access entrants per year and cost per added New York student.','Current room for more funding given recent surpluses.']
 },
 annualExpenses:[2021,2022,2023].map((year,i)=>({year,amount:[12775404,14854221,19235375][i],currency:'USD',periodMonths:12,comparable:true,entity:'The Bottom Line Inc, EIN 04-3351427',accountingBasis:'IRS Form 990 total functional expenses, fiscal year ending June',sourceId:'propublica'})),
 timeCoverage:'complete',
 sessionIds:fs.existsSync(new URL('sessions.json',dir))?JSON.parse(fs.readFileSync(new URL('sessions.json',dir),'utf8')).sessions.map(s=>s.id):[]
};
fs.writeFileSync(new URL('report.json',dir),JSON.stringify(report,null,1)+'\n');
console.log('central per DALY',Math.round(p.central/10));
