import type {Metadata} from 'next';
import LocalImpactNote from '@/components/LocalImpactNote';
import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import data from '@/data/us/remedy-alliance-cea-v1.json';
import report from '@/data/us/remedy-alliance-report.json';
import {remedyAllianceModel} from '@/lib/remedy-alliance-model.mjs';
export const metadata:Metadata={title:'Remedy Alliance — GiveBetter research',description:'National naloxone access: representative-core gift model, finite survival, public funding and unknown local impact share.'};
const money=(n:number|null)=>n===null?'No positive-health ratio':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const central=remedyAllianceModel(data.scenarios.find(s=>s.id==='central')!,data.giftUsd);
const content:CharityReportContent={...report,
 nutshell:{...report.nutshell,headline:money(central.donorUsdPer10Qaly)+' per 10 additional US-wide QALYs.',body:<>{report.nutshell.body} That is {money(central.donorUsdPerQaly)} per overall QALY. <a href="/api/remedy-alliance-model">Inspect all formulas, inputs and sources</a>.</>},
 model:{...report.model,sensitivity:data.scenarios.map(s=>{const r=remedyAllianceModel(s,data.giftUsd);return {case:s.id,headline:money(r.donorUsdPer10Qaly)+' per 10 US-wide QALYs',detail:r.netOverallQaly.toPrecision(5)+' net QALYs from the same gift; '+money(r.grossResourceUsdPer10Qaly)+' with gross associated resources. SF and Bay Area shares remain unknown.'};})}
};
export default function Page(){return <><CharityResearchReport content={content}/><LocalImpactNote slug="remedy-alliance" directQ={central.netOverallQaly} gift={data.giftUsd}/></>;}
