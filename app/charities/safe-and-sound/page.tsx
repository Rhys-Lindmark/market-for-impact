import CharityResearchReport, {type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/sf/safe-sound-report.json';
export const metadata={title:'Safe & Sound — GiveBetter research',description:'Whole-organization child and family support research with finite health priors and explicit funding uncertainty.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/safe-sound-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
