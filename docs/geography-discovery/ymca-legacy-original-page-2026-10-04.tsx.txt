import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/san-francisco/ymca-portfolio-report.json';
export const metadata={title:'YMCA of Greater San Francisco — GiveBetter research'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/ymca-portfolio-model">Inspect the whole-gift model</a>. <a href="/api/sf-ymca-model">Earlier diabetes-prevention-only model</a>.</>}};return <CharityResearchReport content={content}/>;}
