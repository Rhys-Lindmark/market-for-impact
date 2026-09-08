import {data,calculate,scenarios} from '@/lib/harmonized-calibration.mjs';
export function GET(request:Request){
 const id=new URL(request.url).searchParams.get('org');
 if(id!==null&&id!=='amf'&&id!=='ni')return Response.json({error:'Unknown organization'},{status:400});
 return Response.json({model:data,evaluated:Object.fromEntries((id?[id]:['amf','ni']).map(key=>[key,{central:calculate(key),scenarios:scenarios(key)}]))});
}
