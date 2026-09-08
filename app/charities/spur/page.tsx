import type {Metadata} from 'next';
import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import data from '@/data/san-francisco/spur-portfolio-cea-v3.json';
import report from '@/data/san-francisco/spur-portfolio-report.json';
import {spurPortfolioModel} from '@/lib/spur-portfolio-model.mjs';
export const metadata:Metadata={title:'SPUR — whole-organization impact | Market for Impact',description:'Housing spillovers, transportation and clean heat: a conditional unrestricted-gift model with separate SF and Bay Area health estimates.'};
const money=(n:number|null)=>n===null?'No finite positive price':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:2}).format(n);
const result=spurPortfolioModel(data.scenarios.find(s=>s.id==='central')!,data.budget.totalUsd);
const content:CharityReportContent={
 ...report,modelVersion:data.modelId,
 nutshell:{...report.nutshell,body:<>Our best estimate is <strong>{money(result.sfUsdPer10Qaly)} per 10 SF QALYs</strong>, or <strong>{money(result.bayUsdPer10Qaly)} per 10 Bay Area QALYs</strong> for the same hypothetical $100,000 unrestricted gift. We include housing benefits for existing residents, transportation and cleaner buildings—not only clean heat. SF is included in the Bay total; do not add them. These are judgmental partial-health estimates, not a complete welfare valuation or verified funding offer. <a href="/api/sf-spur-portfolio">Inspect the model and sources →</a></>},
 summary:[
 {label:'SF HEALTH',value:money(result.sfUsdPer10Qaly),detail:'per 10 incremental SF-resident QALYs; '+money(result.sfUsdPerQaly)+' per QALY'},
 {label:'BAY AREA HEALTH',value:money(result.bayUsdPer10Qaly),detail:'per 10 incremental Bay QALYs, including SF; '+money(result.bayUsdPerQaly)+' per QALY'},
 {label:'SAME GIFT',value:money(data.budget.totalUsd),detail:'Unrestricted allocation is hypothetical, not a quoted funding tranche'},
 {label:'GEOGRAPHY',value:(100*result.sfNetQaly/result.bayIncludingSfNetQaly).toFixed(1)+'% SF',detail:'Share of modeled Bay health; resident allocation is a judgment. Out-of-region effects are unquantified.'}
 ],
 model:{...report.model,headline:money(result.sfUsdPer10Qaly)+' per 10 SF QALYs',
 equation:{...report.model.equation,result:result.sfNetQaly.toPrecision(5)+' SF QALYs; '+result.bayIncludingSfNetQaly.toPrecision(5)+' Bay QALYs from the same gift'},
 sensitivity:[...data.scenarios.map(s=>{const r=spurPortfolioModel(s,data.budget.totalUsd);return {case:s.id.replace(/([a-z])([A-Z])/g,'$1 $2'),headline:money(r.sfUsdPer10Qaly)+' SF / '+money(r.bayUsdPer10Qaly)+' Bay per 10 QALYs',detail:r.sfNetQaly.toPrecision(5)+' SF QALYs; '+r.bayIncludingSfNetQaly.toPrecision(5)+' Bay QALYs including SF. Joint assumptions, not confidence intervals.'};}),
 {case:'Additional $1M net-resource stress',headline:money(result.sfResourceStressUsdPer10Qaly)+' SF / '+money(result.bayResourceStressUsdPer10Qaly)+' Bay',detail:'per 10 QALYs; unpriced resource stress, not a full societal cost estimate.'}]},
 comparisonBridge:{headline:'Where the modeled health comes from',body:'Housing includes direct harmful-state relief and nonoccupant affordability spillovers. Transit and heat count distinct health effects. All effects use the same gift, with SF nested inside the Bay Area.',
 equation:{label:'CENTRAL SF HEALTH',expression:result.housingSfQaly.toPrecision(4)+' housing + '+result.transitSfQaly.toPrecision(4)+' transit + '+result.heatSfQaly.toPrecision(4)+' clean heat',result:result.sfNetQaly.toPrecision(5)+' QALYs'},
 inputs:[],sensitivity:[
 {case:'Housing',headline:result.housingSfQaly.toPrecision(4)+' SF QALYs',detail:(result.housingSfQaly+result.housingRestBayQaly).toPrecision(4)+' Bay QALYs; direct and nonoccupant health states'},
 {case:'Transportation',headline:result.transitSfQaly.toPrecision(4)+' SF QALYs',detail:(result.transitSfQaly+result.transitRestBayQaly).toPrecision(4)+' Bay QALYs; useful service and changed health exposure'},
 {case:'Clean heat',headline:result.heatSfQaly.toPrecision(4)+' SF QALYs',detail:(result.heatSfQaly+result.heatRestBayQaly).toPrecision(4)+' Bay QALYs; actual emissions removal'}
 ],boundary:'The remaining $15K governance/economic allocation is costed but its health contribution is unquantified. Broad income, productivity and civic gains are not automatically QALYs. The historical clean-heat-only model is preserved in the urban-policy API, not used as this whole-organization score.'}
};
export default function Page(){return <CharityResearchReport content={{...content, donationUrl:"https://www.spur.org/join-renew-give/donate"}}/>;}
