import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/san-francisco/sfphf-report.json';
export const metadata={title:'San Francisco Public Health Foundation — GiveBetter research'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/sfphf-model">Inspect formulas, inputs and sources</a>.</>}};return <CharityResearchReport content={content}/>;}
