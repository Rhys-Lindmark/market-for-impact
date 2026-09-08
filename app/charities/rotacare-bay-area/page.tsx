import type {Metadata} from 'next';
import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import data from '@/data/bay/rotacare-cea-v2.json';
import report from '@/data/bay/rotacare-report.json';
import {rotacareModel} from '@/lib/rotacare-model.mjs';
export const metadata:Metadata={title:'RotaCare Bay Area — GiveBetter research',description:'Whole-gift cost and quantified blood-pressure care: Bay Area health estimates, uncertainty and donor constraints.'};
const money=(n:number|null)=>n===null?'No positive-health ratio':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const central=rotacareModel(data.scenarios.find(s=>s.id==='central')!.inputs);
const content:CharityReportContent={...report,
 nutshell:{...report.nutshell,headline:money(central.bay.donor_usd_per_10_qaly)+' per 10 additional Bay Area QALYs.',body:<>{report.nutshell.body} That is {money(central.bay.donor_usd_per_qaly)} per Bay QALY. <a href="/api/rotacare-model">Inspect all formulas, inputs and sources</a>.</>},
 model:{...report.model,sensitivity:data.scenarios.map(s=>{const r=rotacareModel(s.inputs);return {case:s.id.replaceAll('_',' '),headline:money(r.bay.donor_usd_per_10_qaly)+' per 10 Bay QALYs',detail:r.bay.qaly.toPrecision(5)+' Bay QALYs from the same gift; '+money(r.bay.gross_resource_usd_per_10_qaly)+' with gross associated resources. SF residence share is not established.'};})}
};
export default function Page(){return <CharityResearchReport content={content}/>;}
