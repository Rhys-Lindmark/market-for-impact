import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/international/malaria-consortium-report.json';
export const metadata={title:'Malaria Consortium — GiveBetter research'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/malaria-consortium-model">Inspect the whole-gift model</a>.</>}};return <CharityResearchReport content={content}/>;}
