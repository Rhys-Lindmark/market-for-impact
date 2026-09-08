import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/us/vision-to-learn-report.json';
export const metadata={title:'Vision To Learn — GiveBetter research'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/vision-to-learn-model">Inspect all model inputs, formulas and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
