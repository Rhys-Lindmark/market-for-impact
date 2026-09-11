import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/health-mobile-report.json';
export const metadata={title:'Health Mobile — GiveBetter research',description:'California mobile care: whole cost, finite symptomatic dental health and explicit Bay attribution.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/health-mobile-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
