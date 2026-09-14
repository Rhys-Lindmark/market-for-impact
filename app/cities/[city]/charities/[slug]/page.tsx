import {notFound,permanentRedirect} from 'next/navigation';
import {cityIds,canonicalBase,editionPath} from '@/lib/geography-editions.mjs';
import {getEditionReport} from '@/lib/published-geography-reports';
export default async function LegacyReport({params}:{params:Promise<{city:string;slug:string}>}){const {city,slug}=await params;if(!cityIds.includes(city)||!getEditionReport(city,slug))notFound();permanentRedirect(canonicalBase+editionPath(city)+'/charities/'+slug);}
