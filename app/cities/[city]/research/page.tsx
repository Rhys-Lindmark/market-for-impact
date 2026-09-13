import {notFound} from 'next/navigation';
import GeographyEdition,{editionMetadata} from '@/components/GeographyEdition';
import {cityIds} from '@/lib/geography-editions.mjs';
type Props={params:Promise<{city:string}>};
export async function generateMetadata({params}:Props){const {city}=await params;return editionMetadata(city,true);}
export default async function Page({params}:Props){const {city}=await params;if(!cityIds.includes(city))notFound();return <GeographyEdition id={city} research/>;}
