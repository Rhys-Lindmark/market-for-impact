import type {Metadata} from 'next';
import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import data from '@/data/san-francisco/walk-sf-cea-v1.json';
import report from '@/data/san-francisco/walk-sf-report.json';
import {walkSfModel} from '@/lib/walk-sf-model.mjs';
export const metadata:Metadata={title:'Walk San Francisco — GiveBetter research',description:'Whole-gift street-safety analysis with explicit attribution, SF/Bay health and public construction costs.'};
const money=(n:number|null)=>n===null?'No positive-health ratio':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:2}).format(n);
const central=walkSfModel(data.scenarios.find(s=>s.id==='central')!,data.giftUsd);
const content:CharityReportContent={...report,modelVersion:data.modelId,
 nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/walk-sf-model">Inspect the complete model and sources</a>.</>},
 model:{...report.model,headline:money(central.sfUsdPer10Qaly)+' per 10 SF QALYs; '+money(central.bayUsdPer10Qaly)+' per 10 Bay QALYs',
 sensitivity:data.scenarios.map(s=>{const r=walkSfModel(s,data.giftUsd);return {case:s.id,headline:money(r.sfUsdPer10Qaly)+' SF / '+money(r.bayUsdPer10Qaly)+' Bay per 10 QALYs',detail:r.sfNetQaly.toPrecision(5)+' SF QALYs and '+r.bayIncludingSfNetQaly.toPrecision(5)+' Bay QALYs including SF. Matched-build timing cost: '+money(r.sfTimingUsdPer10Qaly)+' per 10 SF QALYs; gross forward-resource stress: '+money(r.sfGrossStressUsdPer10Qaly)+'. Joint assumptions, not confidence limits.'};})}
};
export default function Page(){return <CharityResearchReport content={content}/>;}
