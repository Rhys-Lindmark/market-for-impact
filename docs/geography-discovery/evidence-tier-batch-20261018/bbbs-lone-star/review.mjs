// Big Brothers Big Sisters Lone Star (Houston, in-depth), 2026-10-18.
//   node docs/geography-discovery/evidence-tier-batch-20261018/bbbs-lone-star/review.mjs
import {writeReview,incomePath,fmt,usd} from '../template.mjs';
const dir=new URL('.',import.meta.url),date='2026-10-18';
const I={cohort:100,expense2023:14764853,youth2024:5110,yearsPerMatch:1.5,trialCostPerMatch2018:2778,cpi2018:1.27,
 gainPct:0.08,base:20000,net:0.6,years:25,delay:8,causal:0.5,transfer:0.6,nonDisplacement:0.9,houston:0.8};
const cost={whole:I.expense2023/I.youth2024*I.yearsPerMatch,trial:I.trialCostPerMatch2018*I.cpi2018*I.yearsPerMatch};
const path=(o={})=>{const p={...I,...o};return incomePath({people:I.cohort,base:p.base,gain:p.base*p.gainPct*p.net,years:p.years,delay:p.delay,editionShare:p.houston,
 factors:{causalObservationalTot:p.causal,transferToCurrentProgram:p.transfer,nonDisplacement:p.nonDisplacement},sourceIds:['bell-2023','mvpf-bell','afterschool'],
 rationale:'Long-run tax-record follow-up of the 1991-93 eight-site BBBS randomized trial (Houston was a site): college attendance significantly higher; earnings effects imprecise in the RCT, about 19% at ages 20-25 in a larger observational comparison. Credited as an 8% gross gain from age 20 for 25 years, half treated as causal, net of taxes and lost benefits.',
 counterfactual:'Randomized waitlisted youth (18 months) and, in the observational design, applicants who were never matched.'});};
const S=(id,label,c,o,assumptions)=>({id,label,costUSD:c*I.cohort,assumptions,incomePathways:[path(o)]});
const scenarios=[
 S('central','Whole-organization cost per match, half the observational earnings effect',cost.whole,{},'CY2023 expense over 5,110 youth served in 2024, times 1.5 years per match; 8% gross earnings gain from age 20 for 25 years on a $20,000 base; 0.5 causal, 0.6 transfer, 0.9 non-displacement, 0.8 Houston residence.'),
 S('trial-cost','Cost per match in the trial',cost.trial,{},'$2,778 per active match (2018 dollars) from the trial agencies’ budgets, inflated and times 1.5 years.'),
 S('observational-19pct','Full 19% observational effect',cost.whole,{gainPct:0.19,causal:1},'Treats the observational ages-20-25 estimate as causal and persistent.'),
 S('rct-null-earnings','RCT earnings effect (imprecise) taken as small',cost.whole,{gainPct:0.03},'A 3% effect, inside the RCT’s wide interval.'),
 S('community-based-only','Program as tested (community-based) fully transfers',cost.whole,{transfer:1},'Assumes today’s school-based and community-based mix is as effective as the tested model.'),
 S('short-persistence','Gains last 10 years',cost.whole,{years:10},'Earnings effect fades by the mid-30s.'),
 S('no-effect','No lasting earnings effect',cost.whole,{causal:0},'College gains do not translate into earnings.'),
];
const sources=[
 {id:'bell-2023',title:'Long-Term Impacts of Mentoring for Disadvantaged Youth (conference draft)',publisher:'Bell and Petkova, NBER conference paper',url:'https://conference.nber.org/conf_papers/f177477/f177477.pdf',published:'2023-02-21',retrieved:date},
 {id:'mvpf-bell',title:'Long-Term Impacts of Youth Mentorship Program (Bell 2025) in the Policy Impacts Library',publisher:'Policy Impacts',url:'https://policyimpacts.org/policy-impacts-library/',published:null,retrieved:date},
 {id:'afterschool',title:'Thirty years of data reveal the long-term impact of youth mentoring',publisher:'Afterschool Alliance',url:'https://afterschoolalliance.org/afterschoolSnack/Thirty-years-of-data-reveal-the-long-term-impact-of-youth_07-22-2025.cfm',published:'2025-07-22',retrieved:date},
 {id:'bbbsa-research',title:'Big Brothers Big Sisters of America launches research on the long-term impacts of mentorship',publisher:'Big Brothers Big Sisters of America',url:'https://www.bbbs.org/?p=11448',published:null,retrieved:date},
 {id:'spw',title:'Social Programs That Work: Big Brothers Big Sisters Community-Based Mentoring (Near Top Tier)',publisher:'Arnold Ventures',url:'https://evidencebasedprograms.org/programs/',published:null,retrieved:date},
 {id:'guidestar',title:'Big Brothers Big Sisters Lone Star profile (5,110 children served in 2024)',publisher:'Candid GuideStar',url:'https://www.guidestar.org/profile/75-0800632',published:null,retrieved:date},
 {id:'houston',title:'Meet Houston missions: Big Brothers Big Sisters Lone Star',publisher:'Simmons and Fletcher',url:'https://www.simmonsandfletcher.com/blog/meet-houston-missions-big-brothers-and-big-sisters-lone-star/',published:null,retrieved:date},
 {id:'propublica',title:'Big Brothers Big Sisters Lone Star, Form 990 filings (EIN 75-0800632)',publisher:'IRS, hosted by ProPublica',url:'https://projects.propublica.org/nonprofits/organizations/750800632',published:null,retrieved:date},
 {id:'income-cg',title:'Cost-effectiveness: health and log-income comparison',publisher:'Coefficient Giving',url:'https://coefficientgiving.org/research/cost-effectiveness/',published:null,retrieved:date}
];
const {prices}=writeReview(dir,{
 edition:'houston',boundaryVersion:'OMB-23-01-2023-07-21',organizationId:'ein:75-0800632',slug:'big-brothers-big-sisters-lone-star',organization:'Big Brothers Big Sisters Lone Star',
 program:'One-to-one volunteer mentoring for children facing adversity',date,donationUrl:'https://bbbstx.org/donate/',
 acceptanceEvidence:'docs/geography-discovery/evidence-tier-batch-20261018/bbbs-lone-star/acceptance.md — separately timed same-model source and model audit; not an independent second agent.',
 priceScope:'Whole-organization cost per match against long-run earnings from the BBBS mentoring trial follow-up; income-only welfare comparison, not a verified marginal gift offer',
 summary:p=>({what:[
  'Big Brothers Big Sisters Lone Star matches children facing adversity with screened volunteer mentors who meet them regularly, in community-based, school-based and Amachi (children of incarcerated parents) programs.',
  'It is a Texas agency based in Dallas whose core markets include Greater Houston, where the program has run since the 1950s; it served 5,110 children in 2024.',
  'This in-depth review prices the organization’s whole cost per match against long-run earnings from a tax-record follow-up of Big Brothers Big Sisters’ randomized trial, in which Houston was one of eight sites.'],
  strengths:[
  'The 1991–93 randomized trial of about 1,100 youth found behavior improvements while matched; linked tax records show treatment youth were significantly more likely to attend college.',
  'A larger observational comparison of unmatched applicants found earnings about 19% higher at ages 20 to 25, and Arnold Ventures rates community-based mentoring Near Top Tier.',
  'Volunteers provide the mentoring, so cash costs are low: about $2,900 per child served a year today.'],
  reservations:[
  `Our working estimate is about ${fmt(p.central)}; all of it is income, and the randomized trial’s own earnings estimate is imprecise.`,
  'The strongest earnings evidence is observational; we treat half of it as causal.',
  'The trial tested community-based matches in 1991–93; today’s mix includes school-based mentoring, which has weaker evidence.']}),
 sections:p=>({
  what:'Big Brothers Big Sisters Lone Star (EIN 75-0800632) is the Big Brothers Big Sisters agency for much of Texas, including Greater Houston, Dallas–Fort Worth and, from 2026, Austin. Volunteers are screened and matched one-to-one with school-age children and meet regularly for activities, with professional match-support staff. Programs include community-based, school-based and Amachi Texas mentoring for children of incarcerated parents. It served 5,110 children in 2024. A donation supports the whole organization.',
  monitoring:'Big Brothers Big Sisters of America ran a randomized waitlist trial at eight agencies, including Houston, in 1991–93; 1,138 families consented. Bell and Petkova linked 883 participants to tax records (Treasury data) to measure adult outcomes, and a 2025 version adds an observational comparison of Boston applicants. The agency reports children served through GuideStar. We did not find Houston-only counts or cost per match; we have not contacted the organization.',
  qualitative:'Within 18 months, the original trial found lower absenteeism and fewer school suspensions among matched youth. The long-run follow-up finds treatment youth significantly more likely to attend college, with imprecise earnings effects in the RCT itself. Comparing matched with unmatched applicants, it finds about 19% higher earnings at ages 20 to 25, and the Policy Impacts library records an estimated $56,000 lifetime earnings gain and a negative net government cost. Average adult wages in the sample were low ($16,500 for men, $14,000 for women at ages 25 to 30), so a given percentage gain is a modest dollar amount.',
  cost:`Our central estimate is **${fmt(p.central)}**, using ten healthy-year welfare equivalents. It is an income-only comparison: we credit no health gain.\n\n**Cost.** CY2023 expense was $14.8M for 5,110 children served in 2024, about ${usd(I.expense2023/I.youth2024)} per child a year; at 1.5 years per match that is ${usd(cost.whole)} per match. The trial agencies spent about $2,778 per active match in 2018 dollars.\n\n**Benefit.** We credit an 8% gross earnings gain on a $20,000 base from age 20 for 25 years, 60% as net welfare: under half the observational 19%, because the RCT’s own earnings estimate is imprecise. We keep 0.5 for causality, 0.6 for transfer to today’s program mix, 0.9 for displacement and 0.8 for Houston residence.\n\n**Range.** At the trial’s cost the estimate is ${fmt(p['trial-cost'])}. Treating the 19% observational effect as fully causal gives ${fmt(p['observational-19pct'])}; a 3% effect gives ${fmt(p['rct-null-earnings'])}; gains lasting only ten years give ${fmt(p['short-persistence'])}. If there is no lasting earnings effect, there is no credited benefit.`,
  funding:'Big Brothers Big Sisters Lone Star reported CY2023 revenue of $15.9M, almost all contributions, and expenses of $14.8M, up from $13.1M in 2022 and $12.1M in 2021. A match also needs a volunteer, so whether money alone adds matches is unverified.'}),
 sources,
 model:{version:'bbbs-lone-star-houston-beta-income-20261018',
  costScope:'CY2023 whole-organization expense per child served (2024) × 1.5 years per match.',
  geographicAttribution:'Houston-area children; 0.8 of adult earning years in the Houston metro.',
  formula:'Price = 10 × cost per match ÷ [0.5 × discounted years(25, from age 20) × ln(1 + 0.6 × 8% × base ÷ base) × causal × transfer × non-displacement × Houston share]. Health = 0.',
  counterfactual:'Waitlisted or never-matched applicants.',
  attribution:'A gift is credited with the average effect of an added match at whole-organization cost; volunteer supply is a binding constraint not modeled.',
  uncertainty:'Dominated by whether the observational earnings effect is causal and how long it lasts, then transfer to school-based matches.',
  nativeOutcomes:'College attendance, adult earnings (ages 20–30), incarceration, teen birth from tax and vital records.',
  inputs:[
   {name:'CY2023 total expense',value:I.expense2023,unit:'USD',basis:'observed',rationale:'Form 990.',sourceIds:['propublica']},
   {name:'Children served 2024',value:I.youth2024,unit:'children',basis:'observed',rationale:'GuideStar profile.',sourceIds:['guidestar']},
   {name:'Years per match',value:I.yearsPerMatch,unit:'years',basis:'judgment',rationale:'Matches are designed to last at least a year; the trial treatment ran 18 months.',sourceIds:['bell-2023']},
   {name:'Trial cost per active match',value:I.trialCostPerMatch2018,unit:'USD (2018)',basis:'observed',rationale:'Agency budgets over matches in the trial.',sourceIds:['bell-2023']},
   {name:'Gross earnings gain',value:I.gainPct,unit:'share of base',basis:'judgment',rationale:'Below the observational 19% at ages 20–25; RCT estimate imprecise.',sourceIds:['afterschool','bell-2023']},
   {name:'Base earnings',value:I.base,unit:'USD per year',basis:'judgment',rationale:'Sample wages $14,000–16,500 at ages 25–30 (2015 dollars), rising with age and inflation.',sourceIds:['bell-2023']},
   {name:'Causal share',value:I.causal,unit:'share',basis:'judgment',rationale:'Observational comparison of matched and unmatched applicants.',sourceIds:['afterschool']},
   {name:'Transfer to current program',value:I.transfer,unit:'share',basis:'judgment',rationale:'Today’s mix includes school-based mentoring.',sourceIds:['guidestar']}],
  missingInputs:['Houston matches per year and cost per added match.','A precise randomized earnings estimate.','Volunteer supply constraints.']},
 annualExpenses:[2021,2022,2023].map((year,i)=>({year,amount:[12099515,13103626,14764853][i],currency:'USD',periodMonths:12,comparable:true,entity:'Big Brothers Big Sisters Lone Star, EIN 75-0800632',accountingBasis:'IRS Form 990 total functional expenses, calendar year',sourceId:'propublica'})),
 scenarios});
if(import.meta.url===`file://${process.argv[1]}`)for(const [k,v] of Object.entries(prices))console.log(k.padEnd(22),v?Math.round(v/10)+' per DALY':'none');
