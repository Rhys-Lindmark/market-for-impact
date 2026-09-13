import EditionResearchReport,{editionReportMetadata} from '@/components/EditionResearchReport';
import '@/app/report-reading.css';
import {cityIds} from '@/lib/geography-editions.mjs';
import {notFound} from 'next/navigation';
type Props={params:Promise<{city:string;slug:string}>};
export async function generateMetadata({params}:Props){const p=await params;return editionReportMetadata(p.city,p.slug);}
export default async function Page({params}:Props){const p=await params;if(!cityIds.includes(p.city))notFound();return <EditionResearchReport edition={p.city} slug={p.slug}/>;}
