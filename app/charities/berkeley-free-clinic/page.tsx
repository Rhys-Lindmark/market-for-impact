import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/berkeley-free-clinic-report.json';
export const metadata={title:'Berkeley Free Clinic — GiveBetter research',description:'Whole-organization free-clinic analysis with finite health priors and explicit volunteer, funding and residence uncertainty.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/berkeley-free-clinic-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
