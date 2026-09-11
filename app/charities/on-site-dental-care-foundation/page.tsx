import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/on-site-dental-report.json';
export const metadata={title:'On-Site Dental Care Foundation — GiveBetter research',description:'Whole-cost mobile dentistry research with finite symptomatic relief and explicit uncertainty.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/on-site-dental-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
