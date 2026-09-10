import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/california/public-health-advocates-report.json';
export const metadata={title:'Public Health Advocates — GiveBetter research',description:'Whole-organization policy research with explicit causal, local-share and marginal-funding uncertainty.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/public-health-advocates-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
