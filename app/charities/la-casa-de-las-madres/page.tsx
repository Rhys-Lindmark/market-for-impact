import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/lacasa-report.json';
export const metadata={title:'La Casa de las Madres — GiveBetter research',description:'Exploratory whole-gift domestic-violence advocacy model, with unquantified portfolio benefits and uncertain marginal funding.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/lacasa-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
