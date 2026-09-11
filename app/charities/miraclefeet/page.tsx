import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/international/miraclefeet-report.json';
export const metadata={title:'MiracleFeet — GiveBetter research',description:'Whole-organization clubfoot treatment research with finite modeled QALYs and zero direct Bay impact.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/miraclefeet-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
