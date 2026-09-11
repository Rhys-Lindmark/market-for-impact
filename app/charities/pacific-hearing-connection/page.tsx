import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/pacific-hearing-connection-report.json';
export const metadata={title:'Pacific Hearing Connection — GiveBetter research',description:'Whole-accounting-cost hearing-access research with finite clinical assumptions and Bay attribution.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/pacific-hearing-connection-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
