import {notFound,permanentRedirect} from 'next/navigation';
import {cityIds,canonicalBase,editionPath} from '@/lib/geography-editions.mjs';
export default async function LegacyResearch({params}:{params:Promise<{city:string}>}){const {city}=await params;if(!cityIds.includes(city))notFound();permanentRedirect(canonicalBase+editionPath(city)+'/all');}
