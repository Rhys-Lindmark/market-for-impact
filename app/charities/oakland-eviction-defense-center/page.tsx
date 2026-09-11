import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/oakland-edc-report.json';
export const metadata={title:'Eviction Defense Center — Oakland — GiveBetter research',description:'Whole-cost eviction defense research with finite housing-health effects and explicit uncertainty.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/oakland-edc-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
