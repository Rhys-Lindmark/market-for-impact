import {notFound,permanentRedirect} from 'next/navigation';
import {editionIds,canonicalBase,editionPath} from '@/lib/geography-editions.mjs';
export default async function LegacyResearch({params}:{params:Promise<{edition:string}>}){const {edition}=await params;if(!editionIds.includes(edition))notFound();permanentRedirect(canonicalBase+editionPath(edition)+'/all');}
