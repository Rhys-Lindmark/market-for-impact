// Per Scholas (New York City, in-depth), 2026-10-18.
//   node docs/geography-discovery/evidence-tier-batch-20261018/per-scholas/review.mjs
import {writeReview,incomePath,fmt,usd} from '../template.mjs';
const dir=new URL('.',import.meta.url),date='2026-10-18';
const I={cohort:100,expense2023:62085666,learners2023:4600,trialCost:5700,trialNetCost:3500,cpi:1.32,
 gain:5000,base:32000,net:0.6,years:7,delay:1,transfer:0.7,nonDisplacement:0.85,nyc:0.9};
const cost={whole:I.expense2023/I.learners2023,trial:I.trialCost*I.cpi};
const path=(o={})=>{const p={...I,...o};return incomePath({people:I.cohort,base:p.base,gain:p.gain*p.net,years:p.years,delay:p.delay,editionShare:p.nyc,
 factors:{transferToCurrentProgram:p.transfer,nonDisplacement:p.nonDisplacement},sourceIds:['mdrc-10yr','av-workadvance','mdrc-costs'],
 rationale:'Randomized WorkAdvance earnings gains at the Per Scholas Bronx site, which were positive in years 2-5 and 7-8 (year 6: +$6,281, 20%) and absent by year 10; credited as an average gross gain for years 2-8, net of taxes and lost benefits.',
 counterfactual:'Randomized control applicants could use any other training or job; impacts are net of those alternatives.'});};
const S=(id,label,c,o,assumptions)=>({id,label,costUSD:c*I.cohort,assumptions,incomePathways:[path(o)]});
const scenarios=[
 S('central','Whole-organization cost per learner, trial gains for years 2-8',cost.whole,{},'CY2023 expense over about 4,600 learners; $5,000 average gross gain in years 2-8 (60% net), none after; 0.7 transfer, 0.85 non-displacement, 0.9 NYC residence.'),
 S('trial-cost','Program cost measured in WorkAdvance',cost.trial,{},'Operating cost of $5,700 per participant at Per Scholas in the trial, inflated to 2025.'),
 S('year6-gain-all-years','Year-6 gain ($6,281) in every year 2-8',cost.whole,{gain:6281},'Upper bound using the largest reported annual impact.'),
 S('smaller-gain','Average gain $3,000',cost.whole,{gain:3000},'Lower average across years with and without significant impacts.'),
 S('gains-to-year-10','Gains last through year 10',cost.whole,{years:9},'Ignores the null year-10 result.'),
 S('low-transfer','Today’s program half as effective',cost.whole,{transfer:0.35},'Scale-up to 24 campuses and changed curriculum dilute the Bronx trial effect.'),
 S('high-displacement','More displacement of other IT job seekers',cost.whole,{nonDisplacement:0.6},'Entry-level IT jobs partly taken from other applicants.'),
 S('no-effect','No effect at current scale',cost.whole,{transfer:0},'The other three WorkAdvance sites found no lasting effect.'),
];
const sources=[
 {id:'mdrc-10yr',title:'Effects of Sector-Focused Training After 10 Years: Findings from the WorkAdvance Evaluation',publisher:'MDRC (Yusim, Schaberg, Tessler and Ubalijoro)',url:'https://www.mdrc.org/work/publications/effects-sector-focused-training-after-10-years',published:'2025-09-01',retrieved:date},
 {id:'av-workadvance',title:'Long-term follow-up of the WorkAdvance study',publisher:'Arnold Ventures',url:'https://www.arnoldventures.org/stories/long-term-follow-up-of-the-workadvance-study-evaluating-the-effectiveness-of-four-different-sector-focused-workforce-development-programs-for-unemployed-and-low-wage-working-adults',published:null,retrieved:date},
 {id:'mdrc-costs',title:'An exemplary training programme: will it work here? (WorkAdvance costs summary)',publisher:'What Works Centre for Local Economic Growth',url:'https://whatworksgrowth.org/insights/an-exemplary-training-programme-will-it-work-here/',published:null,retrieved:date},
 {id:'clear-3yr',title:'Can sector strategies promote longer-term effects? Three-year impacts from WorkAdvance',publisher:'U.S. Department of Labor CLEAR',url:'https://clear.dol.gov/Study/Can-sector-strategies-promote-longer-term-effects-Three-year-impacts-WorkAdvance',published:null,retrieved:date},
 {id:'wiki',title:'Per Scholas (2023 learners and graduates, citing the annual report)',publisher:'Wikipedia',url:'https://en.wikipedia.org/wiki/Per_Scholas',published:null,retrieved:date},
 {id:'ps-2024',title:'Per Scholas 2024 Annual Report',publisher:'Per Scholas',url:'https://perscholas.org/2024-annual-report/',published:null,retrieved:date},
 {id:'propublica',title:'Per Scholas Inc, Form 990 filings (EIN 04-3252955)',publisher:'IRS, hosted by ProPublica',url:'https://projects.propublica.org/nonprofits/organizations/43252955',published:null,retrieved:date},
 {id:'income-cg',title:'Cost-effectiveness: health and log-income comparison',publisher:'Coefficient Giving',url:'https://coefficientgiving.org/research/cost-effectiveness/',published:null,retrieved:date}
];
const {prices}=writeReview(dir,{
 edition:'new-york-city',boundaryVersion:'OMB-23-01-2023-07-21',organizationId:'ein:04-3252955',slug:'per-scholas',organization:'Per Scholas',
 program:'Tuition-free technology job training and placement for adults',date,donationUrl:'https://www.perscholas.org/get-involved/donate-now/',
 acceptanceEvidence:'docs/geography-discovery/evidence-tier-batch-20261018/per-scholas/acceptance.md — separately timed same-model source and model audit; not an independent second agent.',
 priceScope:'Whole-organization cost per learner against randomized earnings gains at the Bronx site; income-only welfare comparison, not a verified marginal gift offer',
 summary:p=>({what:[
  'Per Scholas, founded in the Bronx, runs free, full-time technology training courses for adults who are unemployed or in low-wage work.',
  'It now trains over 4,600 learners a year at more than 20 campuses, and helps graduates find jobs with employer partners.',
  'This in-depth review prices the organization’s whole cost per learner against earnings gains from the randomized WorkAdvance trial at its Bronx site.'],
  strengths:[
  'In a randomized trial of about 690 Bronx applicants, Per Scholas raised earnings in years 2–5 and 7–8; in year 6 participants earned $6,281 (20%) more than the control group.',
  'Arnold Ventures rates the program Near Top Tier, and its effects were the strongest of the four WorkAdvance providers.',
  'The trial cost only about $5,700 per participant to run, low for job training.'],
  reservations:[
  `Our working estimate is about ${fmt(p.central)}; all of it is income, and by year 10 the earnings gain had disappeared.`,
  `Today’s whole-organization cost is about ${usd(cost.whole)} per learner, more than double the trial’s inflation-adjusted cost, after rapid expansion to over 20 campuses.`,
  'The three other WorkAdvance providers showed no lasting effect, so the result may not transfer to every campus or to today’s curriculum.']}),
 sections:p=>({
  what:'Per Scholas (Per Scholas Inc, EIN 04-3252955) offers free, full-time technology courses, mainly in IT, to adults who are unemployed or in low-wage work. It works with employers on curricula and hiring. Founded in the Bronx, it now operates more than 20 metro campuses. It reported over 4,600 learners and more than 2,600 graduates in 2023. A donation supports the whole organization.',
  monitoring:'Per Scholas was one of four providers in MDRC’s WorkAdvance randomized trial, which randomly assigned 2,564 applicants in 2011–13; about 690 were at the Per Scholas Bronx site. Earnings come from administrative wage records, now followed for ten years. Per Scholas publishes annual reports with learner counts and placement wages. We did not find New York-only learner counts or a current cost per learner; we have not contacted the organization.',
  qualitative:'The Per Scholas site produced the strongest effects in WorkAdvance: earnings rose in years 2 to 5 and 7 to 8, with a year-6 gain of $6,281 (20%) over a $32,122 control mean. MDRC’s 10-year report (2025) found no year-10 effect at Per Scholas, while St. Nicks Alliance, another New York provider, showed later gains. The other two sites showed only short-lived effects. Arnold Ventures rates Per Scholas Near Top Tier. The trial version included post-placement advancement coaching; today’s larger, multi-campus program may differ.',
  cost:`Our central estimate is **${fmt(p.central)}**, using ten healthy-year welfare equivalents. It is an income-only comparison: we credit no health gain.\n\n**Cost.** CY2023 total expense was $62.1M for about 4,600 learners: ${usd(cost.whole)} each, for the whole organization. In the trial, operating cost was about $5,700 per participant (net $3,500 after services controls received), or about ${usd(cost.trial)} today.\n\n**Benefit.** We credit an average gross gain of $5,000 a year in years 2–8, between the significant early gains and the year-6 peak of $6,281, and nothing after, because the year-10 effect was zero. 60% counts as net household welfare, on a $32,000 base. We keep 0.7 for transfer to today’s program, 0.85 for displacement and 0.9 for NYC residence.\n\n**Range.** At the trial cost the estimate is ${fmt(p['trial-cost'])}. Using the year-6 gain throughout gives ${fmt(p['year6-gain-all-years'])}; a $3,000 average gives ${fmt(p['smaller-gain'])}; halving the transfer gives ${fmt(p['low-transfer'])}. If the trial effect does not hold at current scale, there is no credited benefit.`,
  funding:'Per Scholas reported CY2023 revenue of $83.3M, including $63.5M of contributions and $17.8M of program service revenue, and expenses of $62.1M, up from $55.0M in 2022 and $36.1M in 2021. Training is free to learners; funding comes from philanthropy, employers and public workforce grants. We have not seen a costed plan for added New York learners.'}),
 sources,
 model:{version:'per-scholas-nyc-beta-income-20261018',
  costScope:'CY2023 whole-organization expense divided by about 4,600 learners.',
  geographicAttribution:'NYC-metro learners; 0.9 of earning years in the metro.',
  formula:'Price = 10 × cost per learner ÷ [0.5 × discounted years(2–8) × ln(1 + 0.6 × gain ÷ base) × transfer × non-displacement × NYC share]. Health = 0.',
  counterfactual:'Randomized control applicants with access to other training and jobs.',
  attribution:'A gift is credited with the transferred average effect of an added learner at whole-organization average cost; whether a gift adds a New York learner is unverified.',
  uncertainty:'Dominated by transfer from the 2011–13 Bronx site to today’s scaled program and by current cost per learner.',
  nativeOutcomes:'Annual earnings in years 1–10 from wage records; year-10 effect null.',
  inputs:[
   {name:'CY2023 total expense',value:I.expense2023,unit:'USD',basis:'observed',rationale:'Form 990.',sourceIds:['propublica']},
   {name:'Learners 2023',value:I.learners2023,unit:'learners',basis:'observed',rationale:'Over 4,600 trained in 2023, citing the annual report.',sourceIds:['wiki','ps-2024']},
   {name:'Trial operating cost',value:I.trialCost,unit:'USD per participant',basis:'observed',rationale:'WorkAdvance cost analysis summary.',sourceIds:['mdrc-costs']},
   {name:'Average gross gain, years 2–8',value:I.gain,unit:'USD per year',basis:'judgment',rationale:'Between significant early gains and the year-6 $6,281; year 10 null.',sourceIds:['av-workadvance','mdrc-10yr']},
   {name:'Base earnings',value:I.base,unit:'USD per year',basis:'observed',rationale:'Year-6 control-group mean $32,122.',sourceIds:['av-workadvance']},
   {name:'Net welfare share',value:I.net,unit:'share',basis:'judgment',rationale:'After taxes and lost benefits.',sourceIds:[]},
   {name:'Transfer to current program',value:I.transfer,unit:'share',basis:'judgment',rationale:'Same organization and city, but a larger, changed program.',sourceIds:['ps-2024']},
   {name:'Non-displacement',value:I.nonDisplacement,unit:'share',basis:'judgment',rationale:'Some entry-level IT jobs are taken from other applicants.',sourceIds:[]},
   {name:'NYC residence share',value:I.nyc,unit:'share',basis:'judgment',rationale:'Adult learners mostly stay in the metro.',sourceIds:[]}],
  missingInputs:['New York learners and cost per added learner.','Evidence for today’s curriculum and campuses.','Whether added funding creates added New York cohorts.']},
 annualExpenses:[2021,2022,2023].map((year,i)=>({year,amount:[36148424,55031670,62085666][i],currency:'USD',periodMonths:12,comparable:true,entity:'Per Scholas Inc, EIN 04-3252955',accountingBasis:'IRS Form 990 total functional expenses, calendar year',sourceId:'propublica'})),
 scenarios});
if(import.meta.url===`file://${process.argv[1]}`)for(const [k,v] of Object.entries(prices))console.log(k.padEnd(22),v?Math.round(v/10)+' per DALY':'none');
