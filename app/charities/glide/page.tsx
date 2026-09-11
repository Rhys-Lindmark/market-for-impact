import type {Metadata} from 'next';
import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/san-francisco/glide-coverage-report.json';
export const metadata:Metadata={title:'GLIDE Foundation — whole-gift research',description:'Whole Foundation gift cost, finite named health pathways and explicit uncertainty.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/glide-coverage-model">Inspect the clinical and housing model</a>. <a href="/archive/glide-rental-assistance">Historical rental-assistance-only research</a>.</>}};return <CharityResearchReport content={content}/>;}
