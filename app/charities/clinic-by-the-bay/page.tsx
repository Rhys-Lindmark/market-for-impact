import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import {clinicCalibratedReport as report} from '@/lib/clinic-calibrated-report.mjs';
export const metadata={title:'Clinic by the Bay — research | GiveBetter'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/clinic-portfolio-model">Inspect current formulas, scenarios and historical estimates</a>.</>}};return <CharityResearchReport content={content}/>;}
