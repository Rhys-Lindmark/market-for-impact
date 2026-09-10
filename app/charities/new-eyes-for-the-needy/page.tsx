import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/us/new-eyes-report.json';
export const metadata={title:'New Eyes for the Needy — GiveBetter research',description:'Very-low-confidence national ordinary-gift model for prescription glasses, with hypothetical Bay and SF allocation sensitivities.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/new-eyes-model">Inspect all formulas, inputs and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
