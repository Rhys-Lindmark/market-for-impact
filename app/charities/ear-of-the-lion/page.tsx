import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/ear-of-lion-report.json';
export const metadata={title:'Ear of the Lion — GiveBetter research',description:'Exploratory whole-gift hearing-access research with explicit California/Nevada and Bay impact boundaries.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/ear-of-lion-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
