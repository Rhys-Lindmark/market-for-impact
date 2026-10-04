import type {Metadata} from 'next';
import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import {pvfCalibratedReport as report} from '@/lib/pvf-calibrated-report.mjs';
export const metadata:Metadata={title:'Pacific Vision Foundation — research',description:'Charitable eye-care access: clinical benefits and signed household resources.'};
export default function Page(){const content:CharityReportContent={...report,published:'11 September 2026',donationUrl:'https://pacificvisionfoundation.org/get-involved/ways-to-give/'};return <CharityResearchReport content={content}/>;}
