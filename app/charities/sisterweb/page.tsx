import CharityResearchReport, {type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/sf/sisterweb-report.json';
export const metadata={title:'SisterWeb — GiveBetter research',description:'Whole-project doula research with finite health outcomes and explicit funding and entity uncertainty.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/sisterweb-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
