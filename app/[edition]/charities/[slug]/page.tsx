import EditionResearchReport,{editionReportMetadata} from '@/components/EditionResearchReport';
import '@/app/report-reading.css';
import {notFound} from 'next/navigation';
type Props={params:Promise<{edition:string;slug:string}>};
export async function generateMetadata({params}:Props){const p=await params;return editionReportMetadata(p.edition,p.slug);}
export default async function Page({params}:Props){const p=await params;if(!['california','usa'].includes(p.edition))notFound();return <EditionResearchReport edition={p.edition} slug={p.slug}/>;}
