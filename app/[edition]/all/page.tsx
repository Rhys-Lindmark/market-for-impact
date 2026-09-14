import {notFound} from 'next/navigation';
import GeographyEdition,{editionMetadata} from '@/components/GeographyEdition';
import {editionIds} from '@/lib/geography-editions.mjs';
type Props={params:Promise<{edition:string}>};
export async function generateMetadata({params}:Props){const {edition}=await params;return editionMetadata(edition,true);}
export default async function Page({params}:Props){const {edition}=await params;if(!editionIds.includes(edition))notFound();return <GeographyEdition id={edition} research/>;}
