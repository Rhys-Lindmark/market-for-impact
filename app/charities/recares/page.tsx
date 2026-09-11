import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/recares-report.json';
export const metadata={title:'ReCARES — GiveBetter research',description:'Exploratory whole-organization equipment-reuse model with finite health priors, controlled-evidence reservations and unverified marginal capacity.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/recares-model">Inspect the model, assumptions and scenarios</a>. <a href="/api/device-clinical-comparison">Compare shared clinical assumptions with MELP</a>.</>}};return <CharityResearchReport content={content}/>;}
