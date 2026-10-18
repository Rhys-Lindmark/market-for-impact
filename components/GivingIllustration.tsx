/* eslint-disable @next/next/no-img-element -- Static editorial illustrations with reserved dimensions. */
import {canonicalBase} from '@/lib/geography-editions.mjs';

export default function GivingIllustration({index,label}:{index:number;label:string}){
  const city=index===0;
  return <div className="sf-home-illustration"><img
    src={canonicalBase+(city?'/images/givebetter-city.webp':'/images/givebetter-principles.png')}
    alt={city?'Illustration of a city neighborhood and park':label}
    width={city?200:600} height={200}
    style={city?{width:200}:{transform:`translateX(-${index*100/3}%)`}}
  /></div>;
}
