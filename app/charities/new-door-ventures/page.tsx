import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/san-francisco/newdoor-portfolio-report.json';
export const metadata={title:'New Door Ventures — GiveBetter research',description:'Whole-gift youth employment, education and career support; conditional health estimates for SF and the Bay Area.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/newdoor-portfolio-model">Inspect the whole-gift model</a>.</>}};return <CharityResearchReport content={content}/>;}
