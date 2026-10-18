import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import {content as calibrated} from '@/lib/melp-calibrated-report.mjs';
export const metadata={title:'MELP/AbleCloset — GiveBetter research',description:'Medical equipment lending, finite health-access gains and household resource savings.'};
export default function Page(){const content:CharityReportContent={...calibrated,nutshell:{...calibrated.nutshell,body:<>{calibrated.nutshell.body} <a href="/api/melp-model">Inspect the model and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
