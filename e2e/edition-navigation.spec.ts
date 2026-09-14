import {expect,test} from '@playwright/test';
import progress from '../docs/geography-progress.json' with {type:'json'};

const canonical='https://ai.rhyslindmark.com/givebetter';
const redirects=[
 ['/', '/all'], ['/editions','/all'], ['/research','/san-francisco/all'],
 ...progress.editions.map(e=>['/'+e.id+'/research','/'+e.id+'/all']),
 ...progress.editions.filter(e=>!['california','usa'].includes(e.id)).flatMap(e=>[
  ['/cities/'+e.id,'/'+e.id], ['/cities/'+e.id+'/research','/'+e.id+'/all'],
 ]),
];
for(const [from,to] of redirects){
 test(`${from} redirects directly to canonical ${to}`,async({request})=>{
  // Following an absolute redirect would test production, not this checkout.
  const response=await request.get(from,{maxRedirects:0});
  expect([307,308]).toContain(response.status());
  expect(response.headers().location).toBe(canonical+to);
 });
}
