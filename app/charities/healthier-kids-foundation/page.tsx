import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/hkf-report.json';
export const metadata={title:'Healthier Kids Foundation — GiveBetter research'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/hkf-model">Inspect formulas, inputs and sources</a>.</>}};return <CharityResearchReport content={content}/>;}
