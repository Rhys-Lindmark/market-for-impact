// Bottom Line (New York City, in-depth) calculator, 2026-10-18.
//   node docs/geography-discovery/nyc-bottom-line-beta-20261018/calculate.mjs
// Adult earnings from additional bachelor's degrees measured in a randomized trial. Health = 0.
import {incomeHealthyYearEquivalent} from '../../../lib/income-health-equivalence.mjs';

export const inputs={
 cohort:100,
 totalExpenseFY2023:19235375,   // The Bottom Line Inc (EIN 04-3351427), FY ending June 2023
 studentsServedFY2023:6679,     // Access, Success and Bluprint, 2023 annual report
 newEntrantShare:0.4,           // judgment: share of served students who are new Access entrants
 trialCostPerOfferedStudent:4161, // Access + Success, incl. overhead (Barr & Castleman)
 cpi2016to2025:1.33,            // judgment
 baEffect:0.08,                 // judgment: NYC 5-year +7.2 pp, pooled +7.6 pp, 6-year 55% vs 47% (+8 pp)
 grossBaPremium:12000,          // judgment: annual earnings premium of a BA over some college for these students
 netWelfareShare:0.55,          // judgment: after taxes, lost benefits and extra time in school
 causalPremium:0.75,            // judgment: share of the premium that is causal for marginal graduates
 nonDisplacement:0.8,           // judgment: some credential value is positional
 editionShare:0.85,             // judgment: share of adult years lived in the NYC metro
 adultBaseIncome:35000,         // judgment
 years:35, delayYears:6,        // earnings from about age 23, counted from the senior-year offer
 discountRate:0.03,
};
export const derived={
 wholeCostPerEntrant:inputs.totalExpenseFY2023/(inputs.studentsServedFY2023*inputs.newEntrantShare),
 trialCost2025:inputs.trialCostPerOfferedStudent*inputs.cpi2016to2025,
};
function pathway(o={}){
 const p={...inputs,...o};
 const causalFactors={baEffect:p.baEffect,causalPremium:p.causalPremium,nonDisplacement:p.nonDisplacement};
 const causalShare=p.baEffect*p.causalPremium*p.nonDisplacement;
 return {people:p.cohort,annualIncomeBeforeUSD:p.adultBaseIncome,annualIncomeGainUSD:p.grossBaPremium*p.netWelfareShare,years:p.years,delayYears:p.delayYears,discountRate:p.discountRate,editionShare:p.editionShare,independentShare:1,causalFactors,causalShare,
  sourceIds:['bl-nber-2025','bl-av'],
  rationale:'Additional bachelor’s degrees per offered student from the randomized trial, times a causal BA earnings premium for marginal graduates, net of taxes, lost benefits and extra schooling time.',
  counterfactual:'Randomized control students could use school counselors, other advising and any college; the degree effect is net of those alternatives.'};
}
const defs=[
 ['central','Whole-organization cost per new entrant, 8-point degree gain',{},()=>derived.wholeCostPerEntrant,'FY2023 expense over an assumed 40% of served students being new entrants; +8 pp bachelor’s degrees; $12,000 premium, 75% causal, 80% non-positional, 55% net; 85% NYC residence.'],
 ['trial-cost','Full Access + Success cost measured in the trial',{},()=>derived.trialCost2025,'Central benefits at the trial’s $4,161 per offered student, inflated to 2025.'],
 ['nyc-five-year-effect','NYC five-year effect only (+7.2 pp)',{baEffect:0.072},()=>derived.wholeCostPerEntrant,'Uses the NYC site estimate at five years.'],
 ['first-cohort-six-year','First cohort six-year effect (+9.6 pp)',{baEffect:0.096},()=>derived.wholeCostPerEntrant,'Uses the class-of-2015 six-year estimate.'],
 ['low-premium','Smaller degree premium ($6,000)',{grossBaPremium:6000},()=>derived.wholeCostPerEntrant,'Marginal graduates gain less than average.'],
 ['mostly-signaling','Half the premium is positional',{nonDisplacement:0.5},()=>derived.wholeCostPerEntrant,'More of the degree value displaces other workers.'],
 ['all-local','All adult years in the NYC metro',{editionShare:1},()=>derived.wholeCostPerEntrant,'No out-migration discount.'],
 ['discount-5pct','5% discount rate',{discountRate:0.05},()=>derived.wholeCostPerEntrant,'Higher discount rate.'],
 ['no-earnings-effect','Extra degrees do not raise earnings',{causalPremium:0},()=>derived.wholeCostPerEntrant,'Degrees are pure signals with no causal earnings gain.'],
];
export function scenarios(){return defs.map(([id,label,o,cost,assumptions])=>{const p=pathway(o);return {id,label,costUSD:cost()*inputs.cohort,allPopulationQalys:0,editionQalys:0,assumptions,incomePathways:p.causalShare>0?[p]:[]};});}
export const hye=ps=>ps.reduce((s,p)=>s+incomeHealthyYearEquivalent(p),0);
export function price(s){const i=hye(s.incomePathways);return i>0?10*s.costUSD/i:null;}
if(import.meta.url===`file://${process.argv[1]}`){console.log(JSON.stringify(derived));for(const s of scenarios()){const p=price(s);console.log(s.id.padEnd(22),hye(s.incomePathways).toFixed(3),p?Math.round(p):'none',p?'per DALY '+Math.round(p/10):'');}}
