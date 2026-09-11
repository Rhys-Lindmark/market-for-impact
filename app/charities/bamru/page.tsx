import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/bamru-report.json';
export const metadata={title:'Bay Area Mountain Rescue Unit — GiveBetter research',description:'Exploratory whole-gift rescue-readiness model with unverified current expenses and explicit health and funding assumptions.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/bamru-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
