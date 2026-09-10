import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/sf/fuf-report.json';
export const metadata={title:'Friends of the Urban Forest — GiveBetter research',description:'San Francisco street-tree research with finite survival, whole-gift costs and explicit health uncertainty.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/fuf-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
