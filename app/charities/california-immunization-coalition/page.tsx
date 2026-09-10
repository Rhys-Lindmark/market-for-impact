import CharityResearchReport, {type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/california/california-immunization-report.json';
export const metadata={title:'California Immunization Coalition — GiveBetter research',description:'Whole-organization statewide vaccination-policy research with matched MMR health units and explicit local-share priors.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/california-immunization-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
