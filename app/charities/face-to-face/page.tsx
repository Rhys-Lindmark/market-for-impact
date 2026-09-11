import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/face-to-face-report.json';
export const metadata={title:'Face to Face — Sonoma County AIDS Network — GiveBetter research',description:'Whole-cost HIV-support organization research with finite overdose-survival estimates.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/face-to-face-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
