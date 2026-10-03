import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import {operationAccessCalibratedReport as report} from '@/lib/operation-access-calibrated-report.mjs';
export const metadata={title:'Operation Access — research | GiveBetter'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/oa-portfolio-model">Inspect formulas, inputs and sources</a>. <a href="/api/sf-surgical-access-models">Historical selected-program models</a>.</>}};return <CharityResearchReport content={content}/>;}
