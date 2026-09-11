import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/oakland-lgbtq-community-center-report.json';
export const metadata={title:report.organization+' — GiveBetter research',description:report.program};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/oakland-lgbtq-community-center-model">Inspect the model and assumptions</a>.</>}};return <CharityResearchReport content={content}/>;}
