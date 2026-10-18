// Harlem Children's Zone (New York City, in-depth), 2026-10-18.
//   node docs/geography-discovery/evidence-tier-batch-20261018/harlem-childrens-zone/review.mjs
// Promise Academy lottery effects priced against HCZ's own (non-charter) spending.
import {writeReview,incomePath,fmt,usd} from '../template.mjs';
const dir=new URL('.',import.meta.url),date='2026-10-18';
const I={cohort:100,hczExpense2023:117336803,charterExpense2023:29941591,servedFY22:19638,charterStudents:1500,years:6,
 mathSD:0.283,percentilesPerSD:37.5,perPercentile2010:150,cpi:1.47,causal:0.5,nonDisplacement:0.9,nyc:0.8,net:0.6,base:35000,earnYears:35,delay:13};
const perPersonHcz=I.hczExpense2023/I.servedFY22;
const cost={central:perPersonHcz*I.years,withCharter:(perPersonHcz+I.charterExpense2023/I.charterStudents)*I.years,allHczToStudents:(I.hczExpense2023/I.charterStudents)*I.years};
const gross=I.mathSD*I.percentilesPerSD*I.perPercentile2010*I.cpi;
const path=(o={})=>{const p={...I,...o};return incomePath({people:I.cohort,base:p.base,gain:(o.gross??gross)*p.net,years:p.earnYears,delay:p.delay,editionShare:p.nyc,
 factors:{causalScoreToEarnings:p.causal,nonDisplacement:p.nonDisplacement},sourceIds:['dobbie-fryer','jpal'],
 rationale:'Persistent lottery effect of 0.283 SD on a nationally normed math test six years after admission, mapped to adult earnings with the Chetty et al. percentile association, half treated as causal; net of taxes and lost benefits.',
 counterfactual:'Lottery losers attended other Harlem and NYC schools; effects are net of those alternatives.'});};
const S=(id,label,c,o,assumptions)=>({id,label,costUSD:c*I.cohort,assumptions,incomePathways:[path(o)]});
const scenarios=[
 S('central','HCZ spending per person over six years; charter funding treated as displacing district spending',cost.central,{},'HCZ Inc FY2023 expense per person served (19,638) for six school years; persistent 0.283 SD math gain; half the score-earnings association causal; 0.9 non-displacement; 0.8 NYC residence.'),
 S('with-charter-cost','Add the charter school’s own spending',cost.withCharter,{},'Counts Promise Academy’s public per-pupil spending (about 1,500 students, judgment) as an added cost.'),
 S('all-hcz-to-students','Charge all HCZ spending to charter students',cost.allHczToStudents,{},'Attributes every HCZ program to the charter students’ benefit.'),
 S('full-association','Full score-earnings association is causal',cost.central,{causal:1},'As education economists often assume.'),
 S('quarter-association','Quarter of the association is causal',cost.central,{causal:0.25},'Stronger fade-out of the earnings link.'),
 S('no-earnings-effect','Test-score gains do not raise adult earnings',cost.central,{causal:0},'J-PAL’s summary finds no lasting difference in graduation or ever enrolling in college.'),
];
const sources=[
 {id:'dobbie-fryer',title:'The Medium-Term Impacts of High-Achieving Charter Schools on Non-Test Score Outcomes (NBER w19581)',publisher:'Dobbie and Fryer, National Bureau of Economic Research',url:'https://www.nber.org/papers/w19581',published:null,retrieved:date},
 {id:'jpal',title:'The Medium-Term Impacts of High-Achieving Charter Schools in the United States',publisher:'J-PAL',url:'https://www.povertyactionlab.org/evaluation/medium-term-impacts-high-achieving-charter-schools-united-states',published:null,retrieved:date},
 {id:'spw',title:'Social Programs That Work: Promise Academy (Near Top Tier)',publisher:'Arnold Ventures',url:'https://evidencebasedprograms.org/programs/',published:null,retrieved:date},
 {id:'hcz-impact',title:'Harlem Children’s Zone 2021–22 Impact Report',publisher:'Harlem Children’s Zone',url:'https://hcz.org/wp-content/uploads/2023/09/2021-22-Impact-Report.pdf',published:null,retrieved:date},
 {id:'chetty-2011',title:'How Does Your Kindergarten Classroom Affect Your Earnings?',publisher:'Chetty et al., Quarterly Journal of Economics',url:'https://doi.org/10.1093/qje/qjr041',published:null,retrieved:date},
 {id:'propublica',title:'Harlem Childrens Zone Inc, Form 990 filings (EIN 23-7112974)',publisher:'IRS, hosted by ProPublica',url:'https://projects.propublica.org/nonprofits/organizations/237112974',published:null,retrieved:date},
 {id:'propublica-charter',title:'Harlem Childrens Zone Promise Academy Charter School, Form 990 filings (EIN 76-0756768)',publisher:'IRS, hosted by ProPublica',url:'https://projects.propublica.org/nonprofits/organizations/760756768',published:null,retrieved:date},
 {id:'income-cg',title:'Cost-effectiveness: health and log-income comparison',publisher:'Coefficient Giving',url:'https://coefficientgiving.org/research/cost-effectiveness/',published:null,retrieved:date}
];
const {prices}=writeReview(dir,{
 edition:'new-york-city',boundaryVersion:'OMB-23-01-2023-07-21',organizationId:'ein:23-7112974',slug:'harlem-childrens-zone',organization:"Harlem Children's Zone",
 program:'Cradle-to-career services and Promise Academy charter schools in a 97-block Harlem zone',date,donationUrl:'https://hcz.org/get-involved/',
 acceptanceEvidence:'docs/geography-discovery/evidence-tier-batch-20261018/harlem-childrens-zone/acceptance.md — separately timed same-model source and model audit; not an independent second agent.',
 priceScope:'HCZ spending per person served over six school years against adult earnings inferred from Promise Academy lottery math gains; income-only welfare comparison, not a verified marginal gift offer',
 summary:p=>({what:[
  'Harlem Children’s Zone provides a pipeline of services, from parenting classes and early childhood through after-school, college support and family programs, across a 97-block area of Harlem.',
  'It also runs the Promise Academy charter schools; HCZ reported serving 34,590 children and adults in FY22, 19,638 of them through its own programs.',
  'This in-depth review prices HCZ’s spending per person served over six school years against the adult earnings implied by Promise Academy’s lottery-based math gains.'],
  strengths:[
  'A lottery study of Promise Academy middle school applicants found math scores 0.283 standard deviations higher six years later; Arnold Ventures rates it Near Top Tier.',
  'Admitted girls were about 10 points less likely to report a teen pregnancy (from 17%), and admitted boys’ incarceration fell from 4% to zero.',
  'Lottery winners graduated high school on time 13 points more often and enrolled in college sooner.'],
  reservations:[
  `Our working estimate is about ${fmt(p.central)}; all of it is adult income inferred from test scores, and we do not credit the teen-pregnancy or incarceration effects.`,
  'The lottery sample was small (407 students), and J-PAL reports no difference in six-year graduation or in ever enrolling in college.',
  'The central case treats the charter school’s public funding as replacing district spending; counting it would raise the estimate several-fold.']}),
 sections:p=>({
  what:'Harlem Children’s Zone (Harlem Childrens Zone Inc, EIN 23-7112974) aims to support children from birth through college in a 97-block area of central Harlem, with parenting workshops, early-childhood programs, after-school and summer programs, health and family services, and college and career support. Its Promise Academy charter schools are separate legal entities funded mainly by public per-pupil payments. HCZ reported 34,590 people served in FY22, including 19,638 through its own programming. A donation to HCZ supports its non-charter programs.',
  monitoring:'Dobbie and Fryer used Promise Academy’s 2005 and 2006 sixth-grade admission lotteries (150 winners, 257 non-winners) and surveyed participants in 2012, near the end of high school. HCZ publishes annual impact reports with counts served. We did not find current Promise Academy enrollment or a cost per student; we have not contacted the organization.',
  qualitative:'Lottery winners scored 0.283 standard deviations higher on a nationally normed math test six years after admission. They were 13 points more likely to graduate high school in four years (58% baseline), though not within six years, and enrolled in college sooner but not more often overall, according to J-PAL’s summary. Female winners reported about 10 points fewer teen pregnancies (17% baseline), and male winners’ incarceration was zero against 4%. There were no differences in drug or alcohol use or in self-reported health. The working paper abstract reports a larger college effect (14.1 points); we follow the more conservative published summary.',
  cost:`Our central estimate is **${fmt(p.central)}**, using ten healthy-year welfare equivalents. It is an income-only comparison: we credit no health gain and do not value the teen-pregnancy or incarceration effects.\n\n**Cost.** HCZ’s FY2023 expense was $117.3M, about ${usd(perPersonHcz)} per person served by its own programs. We charge that for six school years per Promise Academy student, ${usd(cost.central)}, and treat the charter school’s public per-pupil funding as replacing what the district would otherwise spend.\n\n**Benefit.** The 0.283 SD math gain is about 11 percentile points; at Chetty et al.’s $150 a year per percentile, that implies about ${usd(gross)} a year in 2025 dollars. We treat half as causal, 60% as net welfare, from age 25 to 59 on a $35,000 base, with 0.9 for displacement and 0.8 for NYC residence.\n\n**Range.** Adding the charter school’s own spending gives ${fmt(p['with-charter-cost'])}; charging all HCZ spending to charter students gives ${fmt(p['all-hcz-to-students'])}. If the full association is causal, ${fmt(p['full-association'])}. If the test gains never reach adult earnings, there is no credited benefit.`,
  funding:'Harlem Childrens Zone Inc reported FY2023 (June) expenses of $117.3M, up from $104.3M in FY2022, after $152.5M in FY2021, funded almost entirely by contributions ($98.3M in FY2023). The Promise Academy charter entity reported $29.9M of expenses in FY2023. We have not seen a costed plan for adding students or services.'}),
 sources,
 model:{version:'hcz-nyc-beta-income-20261018',
  costScope:'HCZ Inc FY2023 expense per person served (own programs) × six school years; charter per-pupil funding excluded as displacing district spending.',
  geographicAttribution:'Harlem students; 0.8 of adult earning years in the NYC metro.',
  formula:'Price = 10 × (HCZ cost per person × 6) ÷ [0.5 × discounted years(ages 25–59 from 12) × ln(1 + 0.6 × gain ÷ base) × causal × non-displacement × NYC share]. Gain = 0.283 SD × 37.5 percentiles/SD × $150 × CPI. Health = 0.',
  counterfactual:'Lottery losers in other NYC schools.',
  attribution:'A gift is credited with the average Promise Academy effect per student at HCZ’s average per-person cost; other HCZ programs unquantified.',
  uncertainty:'Dominated by the test-score-to-earnings link and by whether charter public funding is a real added cost.',
  nativeOutcomes:'Math scores, on-time graduation, college enrollment timing, teen pregnancy, incarceration and health self-reports.',
  inputs:[
   {name:'HCZ Inc FY2023 expense',value:I.hczExpense2023,unit:'USD',basis:'observed',rationale:'Form 990, year ending June 2023.',sourceIds:['propublica']},
   {name:'People served by HCZ programs',value:I.servedFY22,unit:'people',basis:'observed',rationale:'FY22 impact report (traditional programming).',sourceIds:['hcz-impact']},
   {name:'Charter FY2023 expense',value:I.charterExpense2023,unit:'USD',basis:'observed',rationale:'Promise Academy charter Form 990.',sourceIds:['propublica-charter']},
   {name:'Charter students',value:I.charterStudents,unit:'students',basis:'judgment',rationale:'Implied by charter spending at roughly $20,000 per pupil; not observed.',sourceIds:[]},
   {name:'Persistent math effect',value:I.mathSD,unit:'SD',basis:'observed',rationale:'Six years after the lottery.',sourceIds:['dobbie-fryer']},
   {name:'Causal share of score-earnings link',value:I.causal,unit:'share',basis:'judgment',rationale:'As in the Saga review; no lasting graduation or enrollment difference in J-PAL’s summary.',sourceIds:['jpal']}],
  missingInputs:['Current Promise Academy enrollment and per-student cost.','Adult earnings for lottery participants.','Valuation of teen-pregnancy and incarceration effects.']},
 annualExpenses:[2021,2022,2023].map((year,i)=>({year,amount:[152485532,104256350,117336803][i],currency:'USD',periodMonths:12,comparable:true,entity:'Harlem Childrens Zone Inc, EIN 23-7112974',accountingBasis:'IRS Form 990 total functional expenses, fiscal year ending June',sourceId:'propublica'})),
 scenarios});
if(import.meta.url===`file://${process.argv[1]}`)for(const [k,v] of Object.entries(prices))console.log(k.padEnd(22),v?Math.round(v/10)+' per DALY':'none');
