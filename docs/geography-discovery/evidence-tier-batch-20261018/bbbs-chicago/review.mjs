// Big Brothers Big Sisters of Metropolitan Chicago (Chicago, in-depth), 2026-10-18.
//   node docs/geography-discovery/evidence-tier-batch-20261018/bbbs-chicago/review.mjs
// Same long-run evidence as the Lone Star review; Chicago was not a trial site.
import {writeReview,incomePath,fmt,usd} from '../template.mjs';
const dir=new URL('.',import.meta.url),date='2026-10-18';
const I={cohort:100,expense2023:5606153,youth2024:1412,yearsPerMatch:1.5,trialCostPerMatch2018:2778,cpi2018:1.27,
 gainPct:0.08,base:20000,net:0.6,years:25,delay:8,causal:0.5,transfer:0.5,nonDisplacement:0.9,houston:0.8};
const cost={whole:I.expense2023/I.youth2024*I.yearsPerMatch,trial:I.trialCostPerMatch2018*I.cpi2018*I.yearsPerMatch};
const path=(o={})=>{const p={...I,...o};return incomePath({people:I.cohort,base:p.base,gain:p.base*p.gainPct*p.net,years:p.years,delay:p.delay,editionShare:p.houston,
 factors:{causalObservationalTot:p.causal,transferToCurrentProgram:p.transfer,nonDisplacement:p.nonDisplacement},sourceIds:['bell-2023','mvpf-bell','afterschool'],
 rationale:'Long-run tax-record follow-up of the 1991-93 eight-site BBBS randomized trial (Chicago was not a site): college attendance significantly higher; earnings effects imprecise in the RCT, about 19% at ages 20-25 in a larger observational comparison. Credited as an 8% gross gain from age 20 for 25 years, half treated as causal, net of taxes and lost benefits.',
 counterfactual:'Randomized waitlisted youth (18 months) and, in the observational design, applicants who were never matched.'});};
const S=(id,label,c,o,assumptions)=>({id,label,costUSD:c*I.cohort,assumptions,incomePathways:[path(o)]});
const scenarios=[
 S('central','Whole-organization cost per match, half the observational earnings effect',cost.whole,{},'FY2023 (June) expense over about 1,412 youth served in 2024 (1,935 in 2025 after 37% growth), times 1.5 years per match; 8% gross earnings gain from age 20 for 25 years on a $20,000 base; 0.5 causal, 0.5 transfer, 0.9 non-displacement, 0.8 Chicago residence.'),
 S('trial-cost','Cost per match in the trial',cost.trial,{},'$2,778 per active match (2018 dollars) from the trial agencies\u2019 budgets, inflated and times 1.5 years.'),
 S('observational-19pct','Full 19% observational effect',cost.whole,{gainPct:0.19,causal:1},'Treats the observational ages-20-25 estimate as causal and persistent.'),
 S('rct-null-earnings','RCT earnings effect (imprecise) taken as small',cost.whole,{gainPct:0.03},'A 3% effect, inside the RCT\u2019s wide interval.'),
 S('community-based-only','Program as tested fully transfers',cost.whole,{transfer:1},'Assumes Chicago\u2019s current program is as effective as the tested community-based model.'),
 S('growth-year-cost','Cost spread over 2025 youth served',I.expense2023/1935*I.yearsPerMatch,{},'If expenses grew more slowly than the 37% increase in youth served.'),
 S('short-persistence','Gains last 10 years',cost.whole,{years:10},'Earnings effect fades by the mid-30s.'),
 S('no-effect','No lasting earnings effect',cost.whole,{causal:0},'College gains do not translate into earnings.'),
];
const sources=[
 {id:'bell-2023',title:'Long-Term Impacts of Mentoring for Disadvantaged Youth (conference draft)',publisher:'Bell and Petkova, NBER conference paper',url:'https://conference.nber.org/conf_papers/f177477/f177477.pdf',published:'2023-02-21',retrieved:date},
 {id:'mvpf-bell',title:'Long-Term Impacts of Youth Mentorship Program (Bell 2025) in the Policy Impacts Library',publisher:'Policy Impacts',url:'https://policyimpacts.org/policy-impacts-library/',published:null,retrieved:date},
 {id:'afterschool',title:'Thirty years of data reveal the long-term impact of youth mentoring',publisher:'Afterschool Alliance',url:'https://afterschoolalliance.org/afterschoolSnack/Thirty-years-of-data-reveal-the-long-term-impact-of-youth_07-22-2025.cfm',published:'2025-07-22',retrieved:date},
 {id:'bbbsa-research',title:'Big Brothers Big Sisters of America launches research on the long-term impacts of mentorship',publisher:'Big Brothers Big Sisters of America',url:'https://www.bbbs.org/?p=11448',published:null,retrieved:date},
 {id:'spw',title:'Social Programs That Work: Big Brothers Big Sisters Community-Based Mentoring (Near Top Tier)',publisher:'Arnold Ventures',url:'https://evidencebasedprograms.org/programs/',published:null,retrieved:date},
 {id:'guidestar',title:'Big Brothers Big Sisters of Metropolitan Chicago homepage (1,935 young people served in 2025, up 37%)',publisher:'Big Brothers Big Sisters of Metropolitan Chicago',url:'https://bbbschgo.org/',published:null,retrieved:date},
 {id:'houston',title:'Big Brothers Big Sisters of Metropolitan Chicago charity review',publisher:'BBB Wise Giving Alliance (Give.org)',url:'https://give.org/charity-reviews/children-youth/big-brothers-big-sisters-of-metropolitan-chicago-in-chicago-il-0654-90006755',published:null,retrieved:date},
 {id:'propublica',title:'Big Brothers-Big Sisters of Metropolitan Chicago, Form 990 filings (EIN 36-2681212)',publisher:'IRS, hosted by ProPublica',url:'https://projects.propublica.org/nonprofits/organizations/362681212',published:null,retrieved:date},
 {id:'income-cg',title:'Cost-effectiveness: health and log-income comparison',publisher:'Coefficient Giving',url:'https://coefficientgiving.org/research/cost-effectiveness/',published:null,retrieved:date}
];
const {prices}=writeReview(dir,{
 edition:'chicago',boundaryVersion:'OMB-23-01-2023-07-21',organizationId:'ein:36-2681212',slug:'big-brothers-big-sisters-of-metropolitan-chicago',organization:'Big Brothers Big Sisters of Metropolitan Chicago',
 program:'One-to-one volunteer mentoring for children aged 7 through high school',date,donationUrl:'https://donate.bbbschgo.org/give/126182/',
 acceptanceEvidence:'docs/geography-discovery/evidence-tier-batch-20261018/bbbs-chicago/acceptance.md — separately timed same-model source and model audit; not an independent second agent.',
 priceScope:'Whole-organization cost per match against long-run earnings from the BBBS mentoring trial follow-up (Chicago not a trial site); income-only welfare comparison, not a verified marginal gift offer',
 summary:p=>({what:[
  'Big Brothers Big Sisters of Metropolitan Chicago matches children from age seven through high school graduation with screened volunteer mentors, with staff monitoring each match.',
  'It served 1,935 young people in 2025 after growing 37%, and holds events to take children off its waitlist for a mentor.',
  'This in-depth review prices the organization\u2019s whole cost per match against long-run earnings from a tax-record follow-up of Big Brothers Big Sisters\u2019 randomized trial in eight other cities.'],
  strengths:[
  'The 1991–93 randomized trial of about 1,100 youth found behavior improvements while matched; linked tax records show treatment youth were significantly more likely to attend college.',
  'A larger observational comparison of unmatched applicants found earnings about 19% higher at ages 20 to 25, and Arnold Ventures rates community-based mentoring Near Top Tier.',
  'Volunteers provide the mentoring, so cash costs are low: about $4,000 per young person a year.'],
  reservations:[
  `Our working estimate is about ${fmt(p.central)}; all of it is income, and the randomized trial\u2019s own earnings estimate is imprecise.`,
  'Chicago was not a trial site, so we discount the transfer of results more heavily.',
  'The cost per youth mixes the FY2023 budget with an estimate of 2024 youth served; current costs may differ after rapid growth.']}),
 sections:p=>({
  what:'Big Brothers Big Sisters of Metropolitan Chicago (EIN 36-2681212) recruits, screens and trains adult volunteers ("Bigs") and matches them one-to-one with children ("Littles") from age seven through high school graduation, with professional staff monitoring each match. It serves the Chicago metropolitan area. It reported serving 1,935 young people in 2025, up 37%. A donation supports the whole organization.',
  monitoring:'The evidence comes from Big Brothers Big Sisters of America\u2019s randomized waitlist trial at eight other agencies in 1991–93 (1,138 consenting families), linked by Bell and Petkova to tax records for 883 participants, and a 2025 observational extension using Boston applicants. The Chicago agency reports youth served on its website and, in 2021, reported 1,185 new matches under one grant. We did not find match durations or cost per match; we have not contacted the organization.',
  qualitative:'Within 18 months, the original trial found lower absenteeism and fewer school suspensions among matched youth. The long-run follow-up finds treatment youth significantly more likely to attend college, with imprecise earnings effects in the RCT itself. Comparing matched with unmatched applicants, it finds about 19% higher earnings at ages 20 to 25, and the Policy Impacts library records an estimated $56,000 lifetime earnings gain and a negative net government cost. Average adult wages in the sample were low ($16,500 for men, $14,000 for women at ages 25 to 30).',
  cost:`Our central estimate is **${fmt(p.central)}**, using ten healthy-year welfare equivalents. It is an income-only comparison: we credit no health gain.\n\n**Cost.** FY2023 (June) expense was $5.6M. Dividing by about 1,412 youth served in 2024 (implied by 1,935 in 2025 after 37% growth) gives about ${usd(I.expense2023/I.youth2024)} per young person a year, or ${usd(cost.whole)} per match at 1.5 years. The trial agencies spent about $2,778 per active match in 2018 dollars.\n\n**Benefit.** We credit an 8% gross earnings gain on a $20,000 base from age 20 for 25 years, 60% as net welfare: under half the observational 19%, because the RCT\u2019s earnings estimate is imprecise. We keep 0.5 for causality, 0.5 for transfer to a non-trial agency today, 0.9 for displacement and 0.8 for Chicago residence.\n\n**Range.** At the trial\u2019s cost the estimate is ${fmt(p['trial-cost'])}. Treating the 19% effect as fully causal gives ${fmt(p['observational-19pct'])}; a 3% effect gives ${fmt(p['rct-null-earnings'])}; gains lasting only ten years give ${fmt(p['short-persistence'])}. If there is no lasting earnings effect, there is no credited benefit.`,
  funding:'Big Brothers Big Sisters of Metropolitan Chicago reported FY2023 (June) revenue of $5.9M, almost all contributions, and expenses of $5.6M, up from $5.3M in FY2022 and $5.1M in FY2021. Program expenses were $4.2M in FY2023. A match also needs a volunteer, so whether money alone adds matches is unverified.'}),
 sources,
 model:{version:'bbbs-chicago-beta-income-20261018',
  costScope:'FY2023 whole-organization expense per young person served (2024 estimate) × 1.5 years per match.',
  geographicAttribution:'Chicago-area children; 0.8 of adult earning years in the Chicago metro.',
  formula:'Price = 10 × cost per match ÷ [0.5 × discounted years(25, from age 20) × ln(1 + 0.6 × 8% × base ÷ base) × causal × transfer × non-displacement × Chicago share]. Health = 0.',
  counterfactual:'Waitlisted or never-matched applicants.',
  attribution:'A gift is credited with the average effect of an added match at whole-organization cost; volunteer supply is a binding constraint not modeled.',
  uncertainty:'Dominated by whether the observational earnings effect is causal and how long it lasts, then transfer to school-based matches.',
  nativeOutcomes:'College attendance, adult earnings (ages 20–30), incarceration, teen birth from tax and vital records.',
  inputs:[
   {name:'FY2023 total expense',value:I.expense2023,unit:'USD',basis:'observed',rationale:'Form 990, year ending June 2023.',sourceIds:['propublica']},
   {name:'Youth served 2024',value:I.youth2024,unit:'young people',basis:'judgment',rationale:'Implied by 1,935 in 2025 after 37% growth.',sourceIds:['guidestar']},
   {name:'Years per match',value:I.yearsPerMatch,unit:'years',basis:'judgment',rationale:'Matches are designed to last at least a year; the trial treatment ran 18 months.',sourceIds:['bell-2023']},
   {name:'Trial cost per active match',value:I.trialCostPerMatch2018,unit:'USD (2018)',basis:'observed',rationale:'Agency budgets over matches in the trial.',sourceIds:['bell-2023']},
   {name:'Gross earnings gain',value:I.gainPct,unit:'share of base',basis:'judgment',rationale:'Below the observational 19% at ages 20–25; RCT estimate imprecise.',sourceIds:['afterschool','bell-2023']},
   {name:'Base earnings',value:I.base,unit:'USD per year',basis:'judgment',rationale:'Sample wages $14,000–16,500 at ages 25–30 (2015 dollars), rising with age and inflation.',sourceIds:['bell-2023']},
   {name:'Causal share',value:I.causal,unit:'share',basis:'judgment',rationale:'Observational comparison of matched and unmatched applicants.',sourceIds:['afterschool']},
   {name:'Transfer to current program',value:I.transfer,unit:'share',basis:'judgment',rationale:'Chicago was not a trial site; program details today may differ.',sourceIds:['guidestar']}],
  missingInputs:['Chicago matches per year and cost per added match.','A precise randomized earnings estimate.','Volunteer supply constraints.']},
 annualExpenses:[2021,2022,2023].map((year,i)=>({year,amount:[5055678,5330319,5606153][i],currency:'USD',periodMonths:12,comparable:true,entity:'Big Brothers-Big Sisters of Metropolitan Chicago, EIN 36-2681212',accountingBasis:'IRS Form 990 total functional expenses, fiscal year ending June',sourceId:'propublica'})),
 scenarios});
if(import.meta.url===`file://${process.argv[1]}`)for(const [k,v] of Object.entries(prices))console.log(k.padEnd(22),v?Math.round(v/10)+' per DALY':'none');
