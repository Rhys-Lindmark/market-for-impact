// Builds report.json for Saga Education (Chicago, in-depth) from calculate.mjs.
import fs from 'node:fs';
import {inputs,derived,scenarios,price} from './calculate.mjs';
const dir=new URL('.',import.meta.url);
const sc=scenarios(),p=Object.fromEntries(sc.map(s=>[s.id,price(s)]));
const fmt=x=>'$'+(x>=1e6?(x/1e6).toFixed(2)+'M':Math.round(x/1e3)+'K')+' per better life';
const usd=x=>'$'+Math.round(x).toLocaleString('en-US');
const retrieved='2026-10-18';
const report={
 edition:'chicago',boundaryVersion:'OMB-23-01-2023-07-21',organizationId:'ein:47-2168942',slug:'saga-education',
 organization:'Saga Education',
 program:'High-dosage, in-school math tutoring for ninth and tenth graders',
 published:retrieved,updated:retrieved,stage:'beta',donationUrl:'https://saga.org/impact/support-us/',
 acceptance:{status:'accepted',evidence:'docs/geography-discovery/chicago-saga-beta-20261018/acceptance.md — separately timed source and model audit by the same AI model; not an independent second agent.'},
 priceScope:'Whole-organization annual cost per Direct student against adult earnings inferred from randomized math gains; income-only welfare comparison, not a verified marginal gift offer',
 summary:{
  what:[
   'Saga Education (legally Saga Innovations) places trained tutors in public high schools to teach ninth and tenth graders math in pairs, as a daily class during the school day.',
   'Its Direct program served 3,083 students in 29 schools in Chicago, New York City and Baltimore in 2024–25; a separate Widespread program trains district tutors elsewhere.',
   'This in-depth review prices the organization’s whole annual cost per Direct student against adult earnings inferred from math gains in two Chicago randomized trials.'
  ],
  strengths:[
   'Two randomized trials with about 5,300 Chicago students found math gains of 0.16 and 0.37 standard deviations, math grades up by about 0.4 to 0.6 points and math course failures roughly halved.',
   'Gains persisted: in 11th grade, a year or two after tutoring, math scores were still 0.22 standard deviations higher and math grades 0.18 points higher.',
   'Later randomized trials of a lower-cost, technology-assisted version, one of them in Chicago and New York City schools, found math gains of about 0.19 to 0.23 standard deviations.'
  ],
  reservations:[
   `Our working estimate is about ${fmt(p.central)}; all of it is adult income inferred from test scores, which is the weakest link in the chain.`,
   'The trials did not measure adult earnings, and the graduation effect (+1.9 points) is too imprecise to rule out a decline.',
   `Today’s cost is about ${usd(derived.wholeCostPerDirectStudent)} per Direct student when the whole budget is charged to Direct students, well above the $3,800 the trials measured.`
  ]
 },
 sections:{
  what:'Saga Education, founded in 2014 as SAGA Innovations (EIN 47-2168942), runs high-dosage math tutoring inside public high schools. Tutors work with two students at a time for a full class period every school day, using a curriculum matched to each student’s level. Its Direct program served 3,083 students in 29 schools in Baltimore, Chicago and New York City in 2024–25. A Widespread program trains and supports tutors employed by districts and states, reaching over 15,000 students. School districts pay part of the cost through contracts; philanthropy pays the rest. A donation supports the whole organization.',
  monitoring:'Saga’s Chicago model was tested in two randomized trials run by the University of Chicago Crime and Education Labs (Guryan, Ludwig and coauthors; NBER working paper 28531, IPR WP-21-12). Study 1 randomized 2,633 9th and 10th graders in 2013–14; study 2 randomized 2,710 in 2014–15. Outcomes came from district records. Saga publishes annual reports with student counts and cites later evaluations. We did not find current Chicago-only student counts or a cost per student; we have not contacted the organization.',
  qualitative:'The evidence on learning is strong. Among students offered a slot, about half participated; for participants, study 1 found a 0.16 SD math gain after one year, a 0.56-point rise in math grades on a 4-point scale and 49% fewer math course failures. Study 2 found 0.37 SD, a 0.42-point grade gain and 44% fewer failures. Pooled, the 11th-grade math gain was still 0.22 SD. The authors find no evidence that the effects come from mentoring or social-emotional change rather than instruction. Arnold Ventures rates the program Top Tier. The graduation effect is +1.9 points, with a confidence interval from -4.8 to +8.6, and no adult outcomes have been measured. Benefits beyond schooling therefore rest on how much test-score gains raise adult earnings, which we treat as uncertain.',
  cost:`Our central estimate is **${fmt(p.central)}**, using ten healthy-year welfare equivalents. It is an income-only comparison: we credit no health gain.\n\n**Cost.** We charge the FY2023 total expense, $27.2M, to the 3,083 Direct students reported for 2024–25: ${usd(derived.wholeCostPerDirectStudent)} each. That deliberately counts the Widespread and technology work as overhead, so it is conservative. The trials measured about $3,800 per participant in 2013–15, roughly ${usd(derived.researchCost2025)} today.\n\n**Benefit.** The persistent 0.22 SD gain is about 8 percentile points. Chetty et al. (2011) associate each 8th-grade percentile with $150 a year of earnings at age 27, so the trial authors’ own mapping implies about ${usd(derived.grossEarningsGain)} a year in 2025 dollars. We treat half of that association as causal, keep 0.8 for transfer to today’s program, 0.9 for displacement and 0.8 for the share of adult life spent in the Chicago metro, and count 60% as net household welfare after taxes and lost benefits. Gains run from age 25 to 59, discounted at 3% from age 15, on a $35,000 adult-income base.\n\n**Range.** At the trial cost the estimate is ${fmt(p['research-cost'])}. If the full association is causal, as the authors assume, it is ${fmt(p['full-association'])}; if only a quarter is, ${fmt(p['quarter-association'])}. Using only the smaller study-1 effect gives ${fmt(p['study1-only'])}. If test-score gains never reach adult earnings, there is no credited benefit.`,
  funding:'Saga Innovations reported FY2023 revenue of $28.8M, including $18.4M of contributions and $9.9M of program service revenue, mostly district contracts. Expenses were $27.2M in FY2023, up from $21.4M in FY2022 and $15.0M in FY2021. Its 2024–25 annual report lists $5.6M from philanthropic partners, including Blue Meridian Partners, the Dell Foundation, Overdeck Family Foundation, Arnold Ventures and the IMC Charitable Foundation. We have not seen a costed plan for adding Chicago students, so room for more funding is unverified.'
 },
 sources:[
  {id:'saga-wp',title:'Not Too Late: Improving Academic Outcomes Among Adolescents (IPR WP-21-12)',publisher:'Northwestern Institute for Policy Research',url:'https://www.ipr.northwestern.edu/documents/working-papers/2021/wp-21-12.pdf',published:'2021-03-08',retrieved},
  {id:'saga-nber',title:'Not Too Late: Improving Academic Outcomes Among Adolescents (NBER w28531)',publisher:'National Bureau of Economic Research',url:'https://ideas.repec.org/p/nbr/nberwo/28531.html',published:null,retrieved},
  {id:'saga-summary',title:'Not too late: study summary',publisher:'Stanford National Student Support Accelerator',url:'https://nssa.stanford.edu/studies/not-too-late-improving-academic-outcomes-among-adolescents',published:null,retrieved},
  {id:'saga-tech-rct',title:'An RCT of Saga Technology: high-dosage tutoring and an education technology platform for ninth graders',publisher:'Arnold Ventures',url:'https://arnoldventures.org/stories/a-randomized-controlled-trial-rct-of-saga-technology-providing-high-dosage-math-tutoring-and-engagement-with-an-education-technology-platform-to-ninth-graders-in-public-schools',published:null,retrieved},
  {id:'chetty-2011',title:'How Does Your Kindergarten Classroom Affect Your Earnings? (as cited in the trial paper)',publisher:'Chetty et al., Quarterly Journal of Economics',url:'https://doi.org/10.1093/qje/qjr041',published:null,retrieved},
  {id:'saga-annual',title:'Saga Education annual report 2024–25',publisher:'Saga Education',url:'https://saga.org/?p=994457',published:null,retrieved},
  {id:'propublica',title:'Saga Innovations, Form 990 filings (EIN 47-2168942)',publisher:'IRS, hosted by ProPublica',url:'https://projects.propublica.org/nonprofits/organizations/472168942',published:null,retrieved},
  {id:'income-cg',title:'Cost-effectiveness: health and log-income comparison',publisher:'Coefficient Giving',url:'https://coefficientgiving.org/research/cost-effectiveness/',published:null,retrieved}
 ],
 model:{
  version:'saga-chicago-beta-income-20261018',
  costScope:'FY2023 whole-organization expense divided by 2024–25 Direct students; Widespread and technology work charged as overhead.',
  geographicAttribution:'Chicago Direct students; 0.8 of adult earning years assumed lived in the Chicago metro.',
  formula:'Price = 10 × cost per student ÷ [0.5 × discounted years(ages 25–59, from 15) × ln(1 + net gain ÷ base) × causal × transfer × non-displacement × Chicago share]. Gross gain = 0.22 SD × 37.5 percentiles/SD × $150 × CPI. Health = 0.',
  counterfactual:'Randomized control students on the regular CPS schedule, often double-dose Algebra.',
  attribution:'A gift is credited with the transferred average effect of an added Direct student at whole-organization average cost; whether a gift adds a Chicago student is unverified.',
  uncertainty:'Dominated by the causal link from test scores to adult earnings, then by current cost per student, transfer to today’s program and out-migration.',
  nativeOutcomes:'Math test scores, math grades and course failures in grades 9–11; imprecise graduation; no adult outcomes.',
  inputs:[
   {name:'FY2023 total expense',value:inputs.totalExpenseFY2023,unit:'USD',basis:'observed',rationale:'Form 990, fiscal year ending June 2023.',sourceIds:['propublica']},
   {name:'Direct students 2024–25',value:inputs.directStudentsFY2025,unit:'students',basis:'observed',rationale:'Annual report; different year from the expense, disclosed.',sourceIds:['saga-annual']},
   {name:'Trial cost per participant',value:inputs.researchCostPerStudent2015,unit:'USD',basis:'observed',rationale:'Authors’ best estimate for 2013–15.',sourceIds:['saga-wp']},
   {name:'Persistent math effect',value:inputs.persistentEffectSD,unit:'SD',basis:'observed',rationale:'Pooled treatment-on-treated effect in 11th grade.',sourceIds:['saga-wp']},
   {name:'Percentiles per SD',value:inputs.percentilesPerSD,unit:'percentiles per SD',basis:'observed',rationale:'Study 1: 0.16 SD equals 6 percentile points.',sourceIds:['saga-wp']},
   {name:'Earnings per percentile',value:inputs.earningsPerPercentile2010,unit:'USD per year at age 27',basis:'observed',rationale:'Chetty et al. (2011) association as cited by the trial authors.',sourceIds:['saga-wp','chetty-2011']},
   {name:'CPI adjustments',value:[inputs.cpi2010to2025,inputs.cpi2015to2025],unit:'ratio',basis:'judgment',rationale:'Approximate CPI-U changes.',sourceIds:[]},
   {name:'Causal share of score-earnings link',value:inputs.causalScoreToEarnings,unit:'share',basis:'judgment',rationale:'Cross-sectional association; fade-out and non-test channels uncertain.',sourceIds:['saga-wp']},
   {name:'Transfer to current program',value:inputs.transferToCurrentProgram,unit:'share',basis:'judgment',rationale:'Same core model; later lower-cost trials found 0.19–0.23 SD.',sourceIds:['saga-tech-rct','saga-annual']},
   {name:'Non-displacement',value:inputs.nonDisplacement,unit:'share',basis:'judgment',rationale:'Skill gains are mostly not zero-sum.',sourceIds:[]},
   {name:'Chicago share of adult years',value:inputs.editionShare,unit:'share',basis:'judgment',rationale:'Allows for moving away.',sourceIds:[]},
   {name:'Net welfare share',value:inputs.netWelfareShare,unit:'share',basis:'judgment',rationale:'After income and payroll taxes and lost means-tested benefits.',sourceIds:[]},
   {name:'Adult base income',value:inputs.adultBaseIncome,unit:'USD per year',basis:'judgment',rationale:'Reference personal income for adults from these schools.',sourceIds:[]}
  ],
  scenarios:sc,
  sensitivity:sc.filter(s=>s.id!=='central').map(s=>({id:s.id,label:s.label,pricePer10:p[s.id]??undefined,assumptions:s.assumptions})),
  missingInputs:['Current Chicago Direct students and cost per added student.','Any measured adult outcome (college, earnings) for trial participants.','Expense and student counts for the same fiscal year.']
 },
 annualExpenses:[2021,2022,2023].map((year,i)=>({year,amount:[15003193,21415589,27184992][i],currency:'USD',periodMonths:12,comparable:true,entity:'Saga Innovations, EIN 47-2168942',accountingBasis:'IRS Form 990 total functional expenses, fiscal year ending June',sourceId:'propublica'})),
 timeCoverage:'complete',
 sessionIds:fs.existsSync(new URL('sessions.json',dir))?JSON.parse(fs.readFileSync(new URL('sessions.json',dir),'utf8')).sessions.map(s=>s.id):[]
};
fs.writeFileSync(new URL('report.json',dir),JSON.stringify(report,null,1)+'\n');
console.log('central per DALY',Math.round(p.central/10));
