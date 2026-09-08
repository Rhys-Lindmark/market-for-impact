import type {Metadata} from 'next';
import CalibratedGlobalReport from '@/components/CalibratedGlobalReport';
import {calculate} from '@/lib/harmonized-calibration.mjs';
import LocalImpactNote from '@/components/LocalImpactNote';
import GiveWellComparison from '@/components/GiveWellComparison';
import {type CharityReportContent} from '@/components/CharityResearchReport';
import data from '@/data/international/new-incentives-cea-v1.json';
import report from '@/data/international/new-incentives-report.json';
import {newIncentivesModel} from '@/lib/new-incentives-model.mjs';
export const metadata:Metadata={title:'New Incentives — GiveBetter research',description:'Representative-core childhood vaccination support: global QALY estimates, uncertainty and current funding constraints.'};
const money=(n:number|null)=>n===null?'No positive-health ratio':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const central=newIncentivesModel(data.scenarios.find(s=>s.id==='central')!,data.giftUsd);
const content:CharityReportContent={...report,modelVersion:data.modelId,
 nutshell:{...report.nutshell,headline:money(central.globalUsdPer10Qaly)+' per 10 additional global QALYs.',body:<>{report.nutshell.body} That is {money(central.globalUsdPerQaly)} per global QALY. <a href="/api/new-incentives-model">Inspect all formulas, inputs and sources</a>.</>},
 model:{...report.model,sensitivity:data.scenarios.map(s=>{const r=newIncentivesModel(s,data.giftUsd);return {case:s.id,headline:money(r.globalUsdPer10Qaly)+' per 10 global QALYs',detail:r.netGlobalQaly.toPrecision(5)+' net QALYs from the same gift. Gross associated fiscal-package price '+money(r.grossFiscalUsdPer10Qaly)+'; transfer-excluded gross proxy '+money(r.transferExcludedProxyUsdPer10Qaly)+'. These are not net societal estimates.'};})}
};
export default function Page(){return <><CalibratedGlobalReport id="ni" legacy={content}/><GiveWellComparison slug="new-incentives"/><LocalImpactNote slug="new-incentives" directQ={calculate('ni').netQalys} gift={calculate('ni').inputs.giftUsd}/></>;}
