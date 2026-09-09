import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/san-francisco/clinic-portfolio-report.json';
export const metadata={title:'Clinic by the Bay — whole-organization research | GiveBetter'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/clinic-portfolio-model">Inspect formulas, assumptions and scenario weights</a>.</>}};return <CharityResearchReport content={content}/>;}
