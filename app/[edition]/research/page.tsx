import {notFound} from 'next/navigation';
import GeographyEdition,{editionMetadata} from '@/components/GeographyEdition';
type Props={params:Promise<{edition:string}>};
export async function generateMetadata({params}:Props){const {edition}=await params;return editionMetadata(edition,true);}
export default async function Page({params}:Props){const {edition}=await params;if(!['california','usa'].includes(edition))notFound();return <GeographyEdition id={edition} research/>;}
