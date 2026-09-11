import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/dentists-on-wheels-report.json';
export const metadata={title:'Dentists on Wheels — GiveBetter research',description:'Whole dental-clinic cost and finite symptomatic-health model with explicit uncertainty.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/dentists-on-wheels-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
