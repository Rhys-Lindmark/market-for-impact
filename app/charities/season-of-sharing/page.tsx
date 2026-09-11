import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/season-of-sharing-report.json';
export const metadata={title:'Season of Sharing Fund — GiveBetter research',description:'Whole-gift cost and partial housing-health research; food benefits remain unquantified.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/season-of-sharing-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
