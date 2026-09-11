import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/bats-report.json';
export const metadata={title:'Berkeley Addiction Treatment Services — GiveBetter research',description:'Whole-cost opioid treatment research with finite survival, Bay attribution and funding uncertainty.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/bats-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
