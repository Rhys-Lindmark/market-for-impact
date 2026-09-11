import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/legal-link-report.json';
export const metadata={title:'Legal Link — GiveBetter research',description:'Exploratory whole-gift legal-navigation model with finite health assumptions and publicly funded capacity kept in the counterfactual.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/legal-link-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
