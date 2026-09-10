import CharityResearchReport, {type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/sonrisas-report.json';
export const metadata={title:'Sonrisas Dental Health — GiveBetter research',description:'Whole-organization dental care, finite symptomatic relief and Bay Area attribution.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/sonrisas-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
