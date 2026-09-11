import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/bike-east-bay-report.json';
export const metadata={title:'Bike East Bay — GiveBetter research',description:'Exploratory road-safety and activity analysis with explicit public baseline and donor-attribution uncertainty.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/bike-east-bay-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
