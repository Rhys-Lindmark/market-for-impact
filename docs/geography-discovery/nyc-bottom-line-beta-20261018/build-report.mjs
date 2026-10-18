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
   `Average cost per new student is now about ${usd(derived.wholeCostPerEntrant)}, more than double the trial’s inflation-adjusted cost, as Bottom Line expands into Ohio, Detroit and Houston and runs deficits.`
  ]
 },
 sections:{
  what:'Bottom Line (The Bottom Line Inc, EIN 04-3351427) was founded in Boston in 1997 and operates in Massachusetts, New York City and Chicago, with newer sites in Ohio. Its Access program pairs high school seniors from families earning under 200% of the poverty line with full-time advisors, who meet them every three to four weeks to choose colleges, apply, complete financial aid forms and decide where to enroll. Students who enroll at one of 52 partner institutions join its Success program, with advising for up to six years. It served 6,679 students in 2023 and reports about 7,000 today across Massachusetts, New York City, Chicago, Ohio, Detroit and, from 2026, Houston. A donation supports the whole organization.',
  monitoring:'Bottom Line ran lotteries for oversubscribed places for the high school classes of 2015 and 2016, which Andrew Barr and Benjamin Castleman evaluated as a randomized trial of 2,422 students in Boston, Worcester and New York City. Degree outcomes come from the National Student Clearinghouse. The latest version is NBER working paper 33921 (2025). Arnold Ventures rates the program Top Tier and is funding a 2022–2026 follow-up on employment, earnings and debt, which has not yet reported. Bottom Line publishes annual reports with student counts. Its Chicago site opened in 2014 and was not in the trial. We have not contacted the organization.',
  qualitative:'The trial evidence on degrees is strong. Students offered advising were 7.6 percentage points more likely to earn a bachelor’s degree within five years (16% more than the control group). The first cohort showed 9.6 points within six years; an Arnold Ventures summary reports 55% versus 47% after six years. Effects were similar in the Boston area (7.4 points) and New York City (7.2 points). The authors attribute most of the gain to initial college choice: treated students were 11 points more likely to enroll where graduates earn above the median, with no significant difference in net price. Two links remain unmeasured: how much the extra degrees raise these students’ earnings, and how much of a degree’s value is positional rather than added skill.',
  cost:`Our central estimate is **${fmt(p.central)}**, using ten healthy-year welfare equivalents. It is an income-only comparison: we credit no health gain. This revision replaces the first in-depth estimate of ${fmt(p['previous-review-20261018'])}.\n\n**Cost.** FY2025 total expense was $25.8M for about 7,000 students. Each Access senior is served for a year, and about half continue into Success advising for up to six years; at an average of 4.5 Success years, about 31% of students served are new entrants. That gives ${usd(derived.wholeCostPerEntrant)} per new student for the whole organization. The trial measured $4,161 per offered student for Access plus Success, including overhead, or about ${usd(derived.trialCost2025)} today; the gap likely reflects start-up costs in new regions as well as inflation.\n\n**Benefit.** Each offered student gains 0.08 bachelor’s degrees. We credit a $12,000 annual earnings premium, about a third above a $35,000 base, in line with observational bachelor’s sheepskin premiums of about 30% and with Zimmerman’s finding that marginal admission to a four-year university raised earnings 22% when only half of those admitted graduated. We count 55% of it as net household welfare after taxes, lost benefits and extra time in school, from age 23 for 35 years, discounted at 3%, on a $35,000 adult-income base. We count 75% of the premium as causal, 80% as non-positional and 85% as earned while living in the NYC metro.\n\n**Range.** At the trial cost the estimate is ${fmt(p['trial-cost'])}; halfway between trial and current costs, as a mature New York site might be, it is ${fmt(p['mature-region-cost'])}. Using the first cohort\u2019s six-year +9.6-point effect gives ${fmt(p['first-cohort-six-year'])}; a $6,000 premium gives ${fmt(p['low-premium'])}; treating half the premium as positional gives ${fmt(p['mostly-signaling'])}. If the extra degrees do not raise earnings, there is no credited benefit.`,
  funding:'Bottom Line is almost entirely funded by contributions. Revenue jumped to $36.5M in FY2023 after a $15M MacKenzie Scott grant in 2022, then fell to $23.4M and $20.2M, while expenses rose from $19.2M to $24.5M and $25.8M as it expanded into Ohio, Detroit and Houston. It ran deficits of $1.1M in FY2024 and $5.6M in FY2025, drawing net assets down from $36.6M to $27.8M. Arnold Ventures funded the trial and its earnings follow-up. A gift is likely needed to sustain current scale, but whether it adds New York students rather than funding new regions is unverified.'
 },
 sources:[
  {id:'bl-nber-2025',title:'Increasing Degree Attainment Among Low-Income Students: The Role of Intensive Advising and College Quality (NBER w33921)',publisher:'National Bureau of Economic Research (Barr and Castleman)',url:'https://www.nber.org/system/files/working_papers/w33921/w33921.pdf',published:'2025-06-01',retrieved},
  {id:'bl-spw',title:'Bottom Line: program evidence summary',publisher:'Arnold Ventures, Social Programs That Work',url:'https://evidencebasedprograms.org/programs/bottom-line/',published:null,retrieved},
  {id:'bl-av',title:'Long-term follow-up of the RCT of Bottom Line on employment, earnings and debt',publisher:'Arnold Ventures',url:'https://arnoldventures.org/stories/long-term-follow-up-of-the-rct-of-bottom-line-to-evaluate-the-impacts-of-a-successful-college-advising-program-on-employment-earnings-and-debt-accumulation',published:null,retrieved},
  {id:'bl-annual-2023',title:'Bottom Line Annual Report 2023',publisher:'Bottom Line',url:'https://bottomline.org/wp-content/uploads/2025/01/BL-Annual-Report-2023.pdf',published:null,retrieved},
  {id:'propublica',title:'The Bottom Line Inc, Form 990 filings (EIN 04-3351427)',publisher:'IRS, hosted by ProPublica',url:'https://projects.propublica.org/nonprofits/organizations/43351427',published:null,retrieved},
  {id:'bl-site',title:'About Bottom Line: history and regions',publisher:'Bottom Line',url:'https://www.bottomline.org/?p=1213',published:null,retrieved},
  {id:'zimmerman-2014',title:'The Returns to College Admission for Academically Marginal Students',publisher:'Zimmerman, Journal of Labor Economics (IZA DP6107)',url:'https://www.iza.org/publications/dp6107',published:null,retrieved},
  {id:'sheepskin',title:'Education signaling and sheepskin estimates (lecture notes)',publisher:'Bryan Caplan, George Mason University',url:'https://econfaculty.gmu.edu/bcaplan/e496/educ4.pdf',published:null,retrieved},
  {id:'income-cg',title:'Cost-effectiveness: health and log-income comparison',publisher:'Coefficient Giving',url:'https://coefficientgiving.org/research/cost-effectiveness/',published:null,retrieved}
 ],
 model:{
  version:'bottom-line-nyc-beta-income-20261018b',
  costScope:'FY2025 whole-organization expense divided by new entrants derived from program structure (about 31% of students served).',
  geographicAttribution:'New York City Direct students; 0.85 of adult earning years assumed lived in the NYC metro.',
  formula:'Price = 10 × cost per entrant ÷ [0.5 × discounted years(35, from year 6) × ln(1 + premium × net share ÷ base) × BA effect × causal × non-positional × NYC share]. Health = 0.',
  counterfactual:'Randomized control students with ordinary school counseling and any other help.',
  attribution:'A gift is credited with the average effect of an added entrant at whole-organization average cost; whether a gift adds a New York student is unverified.',
  uncertainty:'Dominated by the earnings premium of the extra degrees and how much is positional, then by current cost per entrant.',
  nativeOutcomes:'Bachelor’s degree within five to seven years, college quality at enrollment; earnings follow-up pending.',
  inputs:[
   {name:'FY2025 total expense',value:inputs.totalExpenseFY2025,unit:'USD',basis:'observed',rationale:'Form 990, fiscal year ending June 2025.',sourceIds:['propublica']},
   {name:'Students served (current)',value:inputs.studentsServedCurrent,unit:'students',basis:'observed',rationale:'About 7,000 across six regions; 6,679 in the 2023 annual report.',sourceIds:['bl-site','bl-annual-2023']},
   {name:'Share continuing into Success',value:inputs.successContinuation,unit:'share',basis:'observed',rationale:'About 50% of Access students enroll at a target institution.',sourceIds:['bl-spw']},
   {name:'Average years in Success',value:inputs.successYears,unit:'years',basis:'judgment',rationale:'Up to six years after high school, allowing for graduation and attrition.',sourceIds:['bl-spw']},
   {name:'Trial cost per offered student',value:inputs.trialCostPerOfferedStudent,unit:'USD',basis:'observed',rationale:'Access plus Success, including overhead.',sourceIds:['bl-nber-2025']},
   {name:'Bachelor’s degree effect',value:inputs.baEffect,unit:'degrees per offered student',basis:'judgment',rationale:'Between NYC 5-year +7.2 pp, pooled +7.6 pp and 7-year +10 pp.',sourceIds:['bl-nber-2025','bl-spw']},
   {name:'Gross degree premium',value:inputs.grossBaPremium,unit:'USD per year',basis:'judgment',rationale:'About 34% above a $35,000 base; observational sheepskin premiums are about 30%, and marginal four-year admission raised earnings 22% with half graduating.',sourceIds:['zimmerman-2014','sheepskin']},
   {name:'Net welfare share',value:inputs.netWelfareShare,unit:'share',basis:'judgment',rationale:'After taxes, lost benefits and extra schooling time.',sourceIds:[]},
   {name:'Causal share of premium',value:inputs.causalPremium,unit:'share',basis:'judgment',rationale:'Marginal graduates may gain less than average graduates.',sourceIds:[]},
   {name:'Non-positional share',value:inputs.nonDisplacement,unit:'share',basis:'judgment',rationale:'Part of a degree’s value may come at others’ expense.',sourceIds:[]},
   {name:'NYC share of adult years',value:inputs.editionShare,unit:'share',basis:'judgment',rationale:'Allows for moving away after college.',sourceIds:[]},
   {name:'CPI adjustment 2016 to 2025',value:inputs.cpi2016to2025,unit:'ratio',basis:'judgment',rationale:'Approximate CPI-U change.',sourceIds:[]}
  ],
  scenarios:sc,
  sensitivity:sc.filter(s=>s.id!=='central').map(s=>({id:s.id,label:s.label,pricePer10:p[s.id]??undefined,assumptions:s.assumptions})),
  missingInputs:['Measured earnings of trial participants (follow-up due 2026).','New Access entrants per year by region and cost per added New York student.','Whether added funding reaches New York or new regions.']
 },
 annualExpenses:[2023,2024,2025].map((year,i)=>({year,amount:[19235375,24472259,25813070][i],currency:'USD',periodMonths:12,comparable:true,entity:'The Bottom Line Inc, EIN 04-3351427',accountingBasis:'IRS Form 990 total functional expenses, fiscal year ending June',sourceId:'propublica'})),
 timeCoverage:'complete',
 sessionIds:fs.existsSync(new URL('sessions.json',dir))?JSON.parse(fs.readFileSync(new URL('sessions.json',dir),'utf8')).sessions.map(s=>s.id):[]
};
fs.writeFileSync(new URL('report.json',dir),JSON.stringify(report,null,1)+'\n');
console.log('central per DALY',Math.round(p.central/10));
