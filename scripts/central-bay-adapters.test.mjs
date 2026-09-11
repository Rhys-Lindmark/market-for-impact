import assert from 'node:assert/strict';
import fs from 'node:fs';
import {centralBayAdapters as a,centralRow,price} from '../lib/central-bay-adapters.mjs';
assert.equal(Object.keys(a).length,22);
for(const r of Object.values(a))for(const p of Object.values(r))assert(p===null||(Number.isFinite(p)&&p>0));
assert.equal(a['face-to-face'].bayUsdPerTenQalys,3598461.2566038547);
assert.equal(a['dentists-on-wheels'].bayUsdPerTenQalys,2559313.589179587);
assert.equal(a['melp-ablecloset'].bayUsdPerTenQalys,1725533.9361939395);
assert.equal(a['berkeley-addiction-treatment-services'].bayUsdPerTenQalys,97916608.81414448);
assert.equal(price(10,0),null);assert.equal(price(10,-1),null);assert.throws(()=>price(Infinity,1));assert.throws(()=>centralRow([],'id','central'));assert.throws(()=>centralRow([{id:'central'},{id:'central'}],'id','central'));
const index=fs.readFileSync(new URL('../lib/bay-research-index.ts',import.meta.url),'utf8');
for(const slug of Object.keys(a)){assert(index.includes(`centralBayAdapters['${slug}'].bayUsdPerTenQalys`));assert(index.includes(`centralBayAdapters['${slug}'].sfUsdPerTenQalys`));}
assert(!index.includes('.weighted'));
