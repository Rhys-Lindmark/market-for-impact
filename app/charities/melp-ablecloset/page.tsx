import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/melp-report.json';
export const metadata={title:'MELP/AbleCloset — GiveBetter research',description:'Exploratory whole-organization equipment lending model with finite health priors and unverified marginal capacity.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/melp-model">Inspect the model, assumptions and scenarios</a>. <a href="/api/device-clinical-comparison">Compare shared clinical assumptions with ReCARES</a>.</>}};return <CharityResearchReport content={content}/>;}
