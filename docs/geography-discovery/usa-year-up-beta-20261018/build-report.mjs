// Builds report.json for Year Up United (USA, in-depth) from calculate.mjs.
// node docs/geography-discovery/usa-year-up-beta-20261018/build-report.mjs
import fs from 'node:fs';
import {inputs,derived,scenarios,price} from './calculate.mjs';

const dir=new URL('.',import.meta.url);
const sc=scenarios();
const fmt=x=>'$'+(x>=1e6?(x/1e6).toFixed(2)+'M':Math.round(x/1e3)+'K');
const p=Object.fromEntries(sc.map(s=>[s.id,price(s)]));
const retrieved='2026-10-18';

const report={
 edition:'usa',boundaryVersion:'USA-50-states-DC-v1',organizationId:'ein:04-3534407',slug:'year-up-united',
 organization:'Year Up United',
 program:'Year-long technical training, corporate internships and job placement for young adults',
 published:retrieved,updated:retrieved,stage:'beta',donationUrl:'https://www.yearup.org/donate',
 acceptance:{status:'accepted',evidence:'docs/geography-discovery/usa-year-up-beta-20261018/acceptance.md — separately timed source and model audit by the same AI model; not an independent second agent.'},
 priceScope:'Whole-organization annual cost per participant against randomized-trial earnings gains, transferred to the current program; income-only welfare comparison, not a verified marginal gift offer',
 summary:{
  what:[
   'Year Up United (Year Up, Inc.) trains young adults without a four-year degree for about six months in technical and professional skills, then places them in six-month internships at corporate partners.',
   'Employers pay internship fees that cover roughly half of the budget; philanthropy and public funds cover the rest, and participants receive stipends.',
   'This in-depth review prices the organization’s whole annual cost per participant against the earnings gains measured in a large randomized trial, converted to household welfare.'
  ],
  strengths:[
   'A federally sponsored randomized trial of 2,544 young adults found earnings gains of about $7,000 to $8,250 a year in years 3 through 7, roughly 30% above the control group, with no sign of fading.',
   'The gains reached nearly every subgroup and local office studied and showed up as higher personal income, less public-benefit receipt and less housing insecurity, not just wage records.',
   'Corporate partners pay a large share of the cost, so a donor dollar may leverage employer money if added participants bring added internship demand.'
  ],
  reservations:[
   `Our working estimate is about ${fmt(p.central)} per better life; all of it is income, because the trial found no effect on self-assessed health or insurance coverage.`,
   'Today’s budget is about $48,600 per participant, well above the evaluated program’s inflation-adjusted $38,500, and it also funds a college-based model whose early randomized trial found no earnings effect.',
   'No earnings data exist past year 7, the participant count is from secondary sources, and we have not verified that a gift creates an additional internship slot.'
  ]
 },
 sections:{
  what:'Year Up United is the 2024 brand of Year Up, Inc., a Boston-based national nonprofit (EIN 04-3534407). Its core program enrolls young adults without a four-year degree for a year: about six months of full-time training in technical and professional skills, followed by a six-month internship at a corporate partner. Participants receive stipends and support from advisors and social workers, and they sign behavior contracts. The organization also runs a college-based version, the Professional Training Corps, and employer-facing services. A donation supports the whole organization, not one participant.',
  monitoring:'Year Up took part in the federal Pathways for Advancing Careers and Education (PACE) evaluation. Abt Associates randomly assigned 2,544 eligible applicants enrolling in 2013–14 at eight offices in nine metro areas, and tracked earnings in the National Directory of New Hires for seven years. The organization publishes the PACE reports, and the cost-benefit analysis used its administrative revenue and expense records. Year Up also partnered on randomized studies of the Professional Training Corps. We did not find current published counts of participants by program or completion rates; secondary sources report about 3,800 to 4,000 participants a year. We have not contacted the organization.',
  qualitative:'The evidence is unusually strong for a workforce program. Abt’s seven-year report found annual earnings impacts of $5,222 in year 2, rising to $7,011 in year 3 and $8,251 in year 7, a 30% gain over the control group. Impacts were at least $1,000 a quarter and statistically significant for nearly all subgroups and offices. A six-year survey found personal income $5,374 higher, public-benefit receipt seven points lower and less housing insecurity, but no effects on health insurance, self-assessed health, psycho-social wellbeing or longer-term credentials. Two limits matter for a donation today. First, the evidence comes from the 2013–14 core program; the college-based Professional Training Corps had no significant earnings effect in its early trial, and the organization has grown and changed since. Second, some gains may come at other job seekers’ expense in the same occupations. Year Up’s cost per participant is high for workforce training, which the evaluators also note.',
  cost:`Our central estimate is **${fmt(p.central)} per better life**, using ten healthy-year welfare equivalents. It is an income-only comparison: we credit no health gain, because the trial found none.\n\n**Cost.** We divide the CY2023 Form 990 total expense, $194.2M, by about 4,000 participants a year, giving $${Math.round(derived.wholeCostPerParticipant).toLocaleString('en-US')} per participant. That is the whole organization, including the college-based model and employer services, and it is higher than the evaluated program’s $28,280 cost in 2013–14, or about $${Math.round(derived.paceCost2025).toLocaleString('en-US')} in today’s dollars.\n\n**Benefit.** The randomized earnings gain averaged $${Math.round(derived.grossGainYears2to7).toLocaleString('en-US')} a year in years 2–7. Abt’s participant accounts show that taxes, lost benefits, work costs and forgone nonmarket time absorb roughly half of it, so we credit half as net household welfare, on a $25,000 personal-income base. We scale that by 0.6 for transfer from the evaluated program to today’s mix and by 0.85 for displacement of other workers. For years 8–12, beyond the data, we credit half of the year-7 gain. Using the shared log-income comparison, 100 participants gain about 26 healthy-year welfare equivalents.\n\n**Range.** If a donor pays only the philanthropic share of an added slot, because employer fees scale with it, the estimate falls to ${fmt(p['philanthropy-share-cost'])} per better life. The evaluated program at its own cost is ${fmt(p['pace-program-as-evaluated'])} per better life. Stopping gains at year 7 gives ${fmt(p['no-gain-after-year-7'])} per better life; halving the transfer gives ${fmt(p['low-transfer'])} per better life. If an added slot buys the college-based model and its early null result holds, there is no credited benefit.`,
  funding:'Year Up reported CY2023 revenue of $186.2M, including $90.3M of contributions and grants and $93.5M of program service revenue, mostly corporate internship fees. Total expenses were $194.2M, up from $162.7M in 2022 and $140.5M in 2021. In the evaluated period, employers bore $16,118 and private philanthropy $9,960 of the net cost per participant, while participants and governments saw net cost reductions. The PACE evaluation was supported by Social Innovation Fund grants through New Profit and Venture Philanthropy Partners. We have not seen a costed plan for additional slots, so room for more funding is unverified.'
 },
 sources:[
  {id:'abt-2022',title:'Benefits that Last: Long-Term Impact and Cost-Benefit Findings for Year Up (OPRE Report 2022-77)',publisher:'Abt Associates for the Office of Planning, Research and Evaluation',url:'https://www.abtglobal.com/files/insights/reports/2022/year%20up%20long-term%20impact%20report_apr2022.pdf',published:null,retrieved},
  {id:'abt-2022-cba',title:'Benefits that Last: report page',publisher:'Administration for Children and Families, OPRE',url:'https://acf.gov/opre/report/benefits-last-long-term-impact-and-cost-benefit-findings-year-up',published:'2022-05-17',retrieved},
  {id:'yearup-pace',title:'PACE research findings',publisher:'Year Up United',url:'https://www.yearup.org/research/pace',published:null,retrieved},
  {id:'ptc-rct',title:'A randomized controlled trial of Year Up’s Professional Training Corps',publisher:'Arnold Ventures',url:'https://www.arnoldventures.org/stories/a-randomized-controlled-trial-of-year-ups-professional-training-corps-a-workforce-training-program-for-economically-disadvantaged-urban-young-adults',published:null,retrieved},
  {id:'propublica',title:'Year Up Inc, Form 990 filings (EIN 04-3534407)',publisher:'IRS, hosted by ProPublica',url:'https://projects.propublica.org/nonprofits/organizations/43534407',published:null,retrieved},
  {id:'rebrand',title:'Year Up rebrands as Year Up United',publisher:'Year Up United',url:'https://yearup.org/about/newsroom/press/year-rebrands-year-united-showcase-comprehensive-workforce-development',published:null,retrieved},
  {id:'income-cg',title:'Cost-effectiveness: health and log-income comparison',publisher:'Coefficient Giving',url:'https://coefficientgiving.org/research/cost-effectiveness/',published:null,retrieved}
 ],
 model:{
  version:'year-up-usa-beta-income-20261018',
  costScope:'Whole-organization CY2023 total expense divided by judged annual participants; includes the college-based model and employer services, not only the evaluated core program.',
  geographicAttribution:'All participants are U.S. residents; edition share 1.',
  formula:'Price = 10 × cost per participant ÷ Σ pathways [0.5 × years(discounted) × ln(1 + net gain ÷ base income) × transfer × non-displacement]. Net gain = mean randomized earnings impact × net welfare share. Health QALYs = 0.',
  counterfactual:'The randomized control group, which could use any other training, college or job. The impact is already net of those alternatives.',
  attribution:'A gift is credited with the transferred average effect of an added participant at whole-organization average cost; whether a gift creates an added internship slot is unverified.',
  uncertainty:'Main uncertainties: transfer from the 2013–14 core program to today’s mix, persistence after year 7, displacement of other workers, the true participant count and the marginal cost of an added slot.',
  nativeOutcomes:'Annual earnings impacts years 1–7 (wage records); six-year survey income, benefit receipt and housing; no measured health or insurance effects.',
  inputs:[
   {name:'CY2023 total expense',value:inputs.totalExpense2023,unit:'USD',basis:'observed',rationale:'Form 990 total functional expenses, calendar 2023.',sourceIds:['propublica']},
   {name:'Participants per year',value:inputs.participantsPerYear,unit:'people',basis:'judgment',rationale:'Secondary sources report about 3,769 to 4,000; the Form 990 count was not machine-readable here.',sourceIds:[]},
   {name:'Earnings impacts, years 2–7',value:inputs.earningsImpactYears2to7,unit:'USD per year',basis:'observed',rationale:'Treatment minus control, National Directory of New Hires, Exhibit 2-1.',sourceIds:['abt-2022']},
   {name:'PACE cost per participant (2013–14)',value:inputs.paceCostPerParticipant2014,unit:'USD',basis:'observed',rationale:'Average per-participant cost in the cost-benefit analysis.',sourceIds:['abt-2022']},
   {name:'Philanthropic net cost per participant (2013–14)',value:inputs.pacePhilanthropyNetCost2014,unit:'USD',basis:'observed',rationale:'Exhibit 5-3; employers bore $16,118.',sourceIds:['abt-2022']},
   {name:'CPI adjustment 2014 to 2025',value:inputs.cpi2014to2025,unit:'ratio',basis:'judgment',rationale:'Approximate CPI-U change; used only for comparisons with the evaluated cost.',sourceIds:[]},
   {name:'Net welfare share of earnings gain',value:inputs.netWelfareShare,unit:'share',basis:'judgment',rationale:'About 58% remains after taxes, lost benefits and work costs, and about 44% after subtracting nonmarket time (Exhibit 5-4); fringe benefits excluded.',sourceIds:['abt-2022']},
   {name:'Base personal income',value:inputs.baseIncome,unit:'USD per year',basis:'judgment',rationale:'Between control-group earnings ($21,420 average, years 2–7) and survey personal income ($30,333).',sourceIds:['abt-2022']},
   {name:'Transfer to current program',value:inputs.transferToCurrentProgram,unit:'share',basis:'judgment',rationale:'Current budget includes the college-based model, whose early RCT found no earnings effect, and a larger, changed organization.',sourceIds:['ptc-rct','rebrand']},
   {name:'Non-displacement',value:inputs.nonDisplacement,unit:'share',basis:'judgment',rationale:'Share of participant gains not taken from other job seekers.',sourceIds:[]},
   {name:'Persistence after year 7',value:inputs.laterPersistence,unit:'share of year-7 gain',basis:'judgment',rationale:'No data beyond year 7; gains were not fading through year 7.',sourceIds:['abt-2022']}
  ],
  scenarios:sc,
  sensitivity:sc.filter(s=>s.id!=='central').map(s=>({id:s.id,label:s.label,pricePer10:p[s.id]??undefined,assumptions:s.assumptions})),
  missingInputs:[
   'A current, audited count of participants by program and the cost of one additional core-program slot.',
   'Evidence on whether additional philanthropy creates additional employer internship demand.',
   'Earnings follow-up beyond year 7 and results for the current program mix.'
  ]
 },
 annualExpenses:[
  {year:2021,amount:140469714,currency:'USD',periodMonths:12,comparable:true,entity:'Year Up, Inc., EIN 04-3534407',accountingBasis:'IRS Form 990 total functional expenses, calendar year',sourceId:'propublica'},
  {year:2022,amount:162709291,currency:'USD',periodMonths:12,comparable:true,entity:'Year Up, Inc., EIN 04-3534407',accountingBasis:'IRS Form 990 total functional expenses, calendar year',sourceId:'propublica'},
  {year:2023,amount:194225512,currency:'USD',periodMonths:12,comparable:true,entity:'Year Up, Inc., EIN 04-3534407',accountingBasis:'IRS Form 990 total functional expenses, calendar year',sourceId:'propublica'}
 ],
 timeCoverage:'complete',
 sessionIds:fs.existsSync(new URL('sessions.json',dir))?JSON.parse(fs.readFileSync(new URL('sessions.json',dir),'utf8')).sessions.map(s=>s.id):[]
};
fs.writeFileSync(new URL('report.json',dir),JSON.stringify(report,null,1)+'\n');
console.log('central per better life',Math.round(p.central),'per DALY',Math.round(p.central/10));
