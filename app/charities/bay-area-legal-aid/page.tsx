import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/baylegal-report.json';
export const metadata={title:'Bay Area Legal Aid — GiveBetter research',description:'Exploratory whole-gift civil legal-aid research with finite health assumptions, partner overlap and unverified marginal funding.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/baylegal-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
