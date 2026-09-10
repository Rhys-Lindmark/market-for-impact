import CharityResearchReport, {type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/ceres-community-report.json';
export const metadata={title:'Ceres Community Project — GiveBetter research',description:'Whole-organization meal-support research with explicit null evidence, finite survival and Bay Area attribution.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/ceres-community-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
