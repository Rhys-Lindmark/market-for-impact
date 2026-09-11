import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/greenlight-report.json';
export const metadata={title:'Greenlight Clinic — GiveBetter research',description:'Whole-gift youth psychotherapy research with finite health assumptions and uncertain marginal capacity.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/greenlight-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
