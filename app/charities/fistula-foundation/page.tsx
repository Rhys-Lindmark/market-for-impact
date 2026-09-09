import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/international/fistula-report.json';
export const metadata={title:'Fistula Foundation — GiveBetter research'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/fistula-model">Inspect formulas, inputs and sources</a>. The giving link lists official giving options; restricted campaigns and matching claims are not credited in this unrestricted-gift model.</>}};return <CharityResearchReport content={content}/>;}
