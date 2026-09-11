import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/sogorea-te-report.json';
export const metadata={title:'Sogorea Te Land Trust — GiveBetter research',description:'Highly speculative emergency-readiness health diagnostic, not a complete valuation of the organization.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/sogorea-te-model">Inspect the model and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
