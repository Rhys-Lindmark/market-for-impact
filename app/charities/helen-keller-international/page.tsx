import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/international/helen-keller-report.json';
export const metadata={title:'Helen Keller Intl — GiveBetter research'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/helen-keller-model">Inspect the whole-gift model</a>.</>}};return <CharityResearchReport content={content}/>;}
