// St. Nicks Alliance (New York City, in-depth), 2026-10-18.
//   node docs/geography-discovery/evidence-tier-batch-20261018/st-nicks-alliance/review.mjs
// Whole-organization cost against only the workforce earnings benefit; housing,
// youth and elder-care benefits are left unquantified (not zero-valued).
import {writeReview,incomePath,fmt,usd} from '../template.mjs';
const dir=new URL('.',import.meta.url),date='2026-10-18';
const I={cohort:100,expense2023:47665555,placedPerYear:1000,base:30000,net:0.6,
 lateGain:6000,lateYears:3,lateDelay:7,tailGain:3000,tailYears:5,tailDelay:10,transfer:0.5,nonDisplacement:0.85,nyc:0.9};
const cost={whole:I.expense2023/I.placedPerYear};
const paths=(o={})=>{const p={...I,...o};const f={transferToCurrentProgram:p.transfer,nonDisplacement:p.nonDisplacement};const src=['mdrc-10yr','clear-7yr'];
 const out=[incomePath({people:I.cohort,base:p.base,gain:p.lateGain*p.net,years:p.lateYears,delay:p.lateDelay,editionShare:p.nyc,factors:f,sourceIds:src,
  rationale:'Randomized WorkAdvance gains at St. Nicks appeared in years 8-10, reaching +32% in year 10; credited as a $6,000 average gross gain over years 8-10, net of taxes and lost benefits.',
  counterfactual:'Randomized control applicants with access to other training and jobs.'})];
 if(p.tailYears>0)out.push(incomePath({people:I.cohort,base:p.base,gain:p.tailGain*p.net,years:p.tailYears,delay:p.tailDelay,editionShare:p.nyc,factors:f,sourceIds:src,
  rationale:'Judgment that half the late gain persists for five unobserved years after year 10.',counterfactual:'As above; persistence is a hypothesis.'}));
 return out;};
const S=(id,label,c,o,assumptions)=>({id,label,costUSD:c*I.cohort,assumptions,incomePathways:paths(o)});
const scenarios=[
 S('central','Whole-organization cost per placed participant, late trial gains',cost.whole,{},'CY2023 whole expense over about 1,000 adults placed or advanced each year; $6,000 gross gain in years 8-10 and half that for five more years; 0.5 transfer, 0.85 non-displacement, 0.9 NYC.'),
 S('workforce-share-cost','Only a quarter of spending is workforce',cost.whole*0.25,{},'If a gift restricted to workforce programs bore only their share of cost (judgment: 25% of the budget).'),
 S('no-tail','Gains end at year 10',cost.whole,{tailYears:0},'No persistence after the observed window.'),
 S('year10-gain-throughout','32% of base in years 8-10',cost.whole,{lateGain:9600},'Uses the year-10 gain for all three late years.'),
 S('full-transfer','Current programs as effective as WorkAdvance',cost.whole,{transfer:1},'The trial model applies to today’s broader trades and youth programs.'),
 S('low-transfer','Current programs much less effective',cost.whole,{transfer:0.25},'Only a small part of current workforce activity resembles the tested model.'),
 S('no-effect','No effect at current scale',cost.whole,{transfer:0},'Late gains do not replicate.'),
];
const sources=[
 {id:'mdrc-10yr',title:'Effects of Sector-Focused Training After 10 Years: Findings from the WorkAdvance Evaluation',publisher:'MDRC (Yusim, Schaberg, Tessler and Ubalijoro)',url:'https://www.mdrc.org/work/publications/effects-sector-focused-training-after-10-years',published:'2025-09-01',retrieved:date},
 {id:'clear-7yr',title:'Employment and earnings effects of the WorkAdvance demonstration after seven years (St. Nicks site)',publisher:'U.S. Department of Labor CLEAR',url:'https://clear.dol.gov/Study/Employment-and-earnings-effects-WorkAdvance-demonstration-after-seven-years-Kanengiser-et-0',published:null,retrieved:date},
 {id:'clear-3yr',title:'Can sector strategies promote longer-term effects? Three-year impacts (St. Nicks site)',publisher:'U.S. Department of Labor CLEAR',url:'https://clear.dol.gov/Study/Can-sector-strategies-promote-longer-term-effects-Three-year-impacts-WorkAdvance-0',published:null,retrieved:date},
 {id:'sn-workforce',title:'Workforce Development',publisher:'St. Nicks Alliance',url:'https://stnicksalliance.org/workforce-development/',published:null,retrieved:date},
 {id:'propublica',title:'St Nicks Alliance Corp, Form 990 filings (EIN 51-0192170)',publisher:'IRS, hosted by ProPublica',url:'https://projects.propublica.org/nonprofits/organizations/510192170',published:null,retrieved:date},
 {id:'income-cg',title:'Cost-effectiveness: health and log-income comparison',publisher:'Coefficient Giving',url:'https://coefficientgiving.org/research/cost-effectiveness/',published:null,retrieved:date}
];
const {prices}=writeReview(dir,{
 edition:'new-york-city',boundaryVersion:'OMB-23-01-2023-07-21',organizationId:'ein:51-0192170',slug:'st-nicks-alliance',organization:'St. Nicks Alliance',
 program:'Brooklyn workforce training plus affordable housing, youth and elder services',date,donationUrl:'https://stnicksalliance.org/',
 acceptanceEvidence:'docs/geography-discovery/evidence-tier-batch-20261018/st-nicks-alliance/acceptance.md — separately timed same-model source and model audit; not an independent second agent.',
 priceScope:'Whole-organization cost against only workforce earnings gains from a randomized trial; other programs unquantified; income-only welfare comparison, not a verified marginal gift offer',
 summary:p=>({what:[
  'St. Nicks Alliance is a Brooklyn community organization that runs job training, affordable housing, youth programs and elder care.',
  'Its workforce programs train adults and young people for certifications in construction, HVAC, environmental remediation, building maintenance and healthcare, and it reports placing over 1,000 people a year in jobs or further education.',
  'This in-depth review charges the whole organization’s cost against only the earnings gains its environmental-remediation training produced in a randomized trial.'],
  strengths:[
  'In MDRC’s randomized WorkAdvance trial of about 480 applicants, St. Nicks’ training raised average earnings by 32% in year 10 and the share earning $45,000 or more by 7 points.',
  'It is the only one of the four WorkAdvance providers with a significant earnings effect ten years after enrollment.',
  'Its other services (housing, youth and elder care) add value we do not count, so the estimate is conservative.'],
  reservations:[
  `Our working estimate is about ${fmt(p.central)}; it counts only workforce earnings while charging the whole budget.`,
  'Gains appeared only in years 8 to 10; earlier years showed no significant effect, so the result could be a late fluke.',
  'Today’s workforce programs cover many more trades than the tested environmental-remediation track, so transfer is uncertain.']}),
 sections:p=>({
  what:'St. Nicks Alliance (St Nicks Alliance Corp, EIN 51-0192170) works in north Brooklyn. Its workforce division offers skills training and certifications in construction, HVAC, environmental remediation, building maintenance, data analytics, financial services and hemodialysis, plus adult education and youth programs such as YouthBuild. The wider organization also develops affordable housing and runs youth, education and elder-care services. A donation supports the whole organization unless restricted.',
  monitoring:'St. Nicks was a WorkAdvance provider in MDRC’s randomized trial: 242 applicants were assigned to its environmental-remediation program and 237 to a control group, with earnings tracked in administrative wage records for ten years. It reports annual placement counts on its website. We did not find program-level costs, enrollments or completion rates; we have not contacted the organization.',
  qualitative:'At three years the trial found no significant earnings effect at St. Nicks, and the seven-year report attributed WorkAdvance’s pooled gains mainly to Per Scholas. By years 8 to 10, however, St. Nicks participants earned more; in year 10 average earnings were 32% higher and 7 percentage points more earned $45,000 or more. Year 10 overlapped the pandemic recovery. A late-emerging effect is plausible for trades with credential ladders, but it rests on one site and a few years.',
  cost:`Our central estimate is **${fmt(p.central)}**, using ten healthy-year welfare equivalents. It is an income-only comparison of the workforce benefit alone.\n\n**Cost.** We charge the CY2023 whole-organization expense, $47.7M, to the roughly 1,000 adults and young people it places each year: ${usd(cost.whole)} each. This deliberately loads housing, youth and elder-care spending onto the workforce benefit, so it overstates the cost of the training itself.\n\n**Benefit.** We credit a $6,000 average gross gain in years 8–10 (rising to 32% of a $30,000 base in year 10) and half that for five more years, 60% of it as net welfare. We keep 0.5 for transfer to today’s broader programs, 0.85 for displacement and 0.9 for NYC residence.\n\n**Range.** If a restricted gift bore only workforce costs (assumed a quarter of the budget), the estimate is ${fmt(p['workforce-share-cost'])}. With no persistence after year 10 it is ${fmt(p['no-tail'])}; with full transfer, ${fmt(p['full-transfer'])}. If the late gains do not replicate, there is no credited benefit.`,
  funding:'St Nicks Alliance Corp reported CY2023 expenses of $47.7M, up from $41.9M in 2022 and $35.1M in 2021, with $35.7M of contributions and grants and $10.1M of program service revenue. Related entities include St Nicks Alliance Home Care Corp and a community development corporation, which are not included here. We have not seen a costed plan for added workforce trainees.'}),
 sources,
 model:{version:'st-nicks-nyc-beta-income-20261018',
  costScope:'CY2023 whole-organization expense divided by about 1,000 people placed per year; non-workforce programs charged but not credited.',
  geographicAttribution:'Brooklyn participants; 0.9 of earning years in the NYC metro.',
  formula:'Price = 10 × cost per placed participant ÷ Σ [0.5 × discounted years × ln(1 + 0.6 × gain ÷ base) × transfer × non-displacement × NYC share]. Health = 0.',
  counterfactual:'Randomized control applicants with access to other training and jobs.',
  attribution:'A gift is credited with the transferred average late effect per placed participant at whole-organization cost; other services unquantified.',
  uncertainty:'Dominated by whether the late single-site gain is real and transfers to current programs, and by the share of cost that is workforce.',
  nativeOutcomes:'Annual earnings and share earning $45,000+ over ten years.',
  inputs:[
   {name:'CY2023 total expense',value:I.expense2023,unit:'USD',basis:'observed',rationale:'Form 990.',sourceIds:['propublica']},
   {name:'Placed per year',value:I.placedPerYear,unit:'people',basis:'observed',rationale:'"Over 1,000" placed in jobs or advanced education annually.',sourceIds:['sn-workforce']},
   {name:'Late gross gain',value:I.lateGain,unit:'USD per year, years 8–10',basis:'judgment',rationale:'Year-10 +32% on a ~$30,000 base, lower in years 8–9.',sourceIds:['mdrc-10yr']},
   {name:'Base earnings',value:I.base,unit:'USD per year',basis:'judgment',rationale:'Control-group level not retrieved.',sourceIds:[]},
   {name:'Transfer to current programs',value:I.transfer,unit:'share',basis:'judgment',rationale:'Tested track was environmental remediation; current programs are broader.',sourceIds:['sn-workforce']},
   {name:'Non-displacement',value:I.nonDisplacement,unit:'share',basis:'judgment',rationale:'Some trade jobs taken from other applicants.',sourceIds:[]}],
  missingInputs:['Year-by-year dollar impacts and control means at St. Nicks.','Workforce program cost and enrollment.','Whether added funding creates added trainees.']},
 annualExpenses:[2021,2022,2023].map((year,i)=>({year,amount:[35111079,41852946,47665555][i],currency:'USD',periodMonths:12,comparable:true,entity:'St Nicks Alliance Corp, EIN 51-0192170',accountingBasis:'IRS Form 990 total functional expenses, calendar year',sourceId:'propublica'})),
 scenarios});
if(import.meta.url===`file://${process.argv[1]}`)for(const [k,v] of Object.entries(prices))console.log(k.padEnd(24),v?Math.round(v/10)+' per DALY':'none');
