import fs from 'node:fs';
import crypto from 'node:crypto';
const urls=[...new Set(['cc','rt'].flatMap(k=>JSON.parse(fs.readFileSync(new URL(k+'-report.json',import.meta.url))).sources).filter(s=>s.id!=='cg-cost').map(s=>s.url))];
console.log(JSON.stringify(await Promise.all(urls.map(async url=>{try{const r=await fetch(url),b=Buffer.from(await r.arrayBuffer());return {url,status:r.status,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex'),retrievedAt:new Date().toISOString()}}catch(e){return {url,status:'access-error',error:String(e)}}}))));
