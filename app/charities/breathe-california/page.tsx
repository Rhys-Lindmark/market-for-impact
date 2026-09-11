import type {Metadata} from 'next';
import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/san-francisco/breathe-coverage-report.json';
export const metadata:Metadata={title:'Breathe California — whole-gift clinical research',description:'Cessation, asthma and CPAP access within whole-gift cost; partial health and explicit uncertainty.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/breathe-coverage-model">Inspect the expanded clinical model</a>. <a href="/api/sf-breathe-model">Historical cessation-only model</a>.</>}};return <CharityResearchReport content={content}/>;}
