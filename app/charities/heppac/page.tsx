import CharityResearchReport, {type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/heppac-report.json';
export const metadata={title:'HEPPAC — GiveBetter research',description:'Conditional whole-organization harm-reduction model with uncertain marginal funding and Bay Area attribution.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/heppac-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
