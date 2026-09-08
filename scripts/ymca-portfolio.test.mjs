import assert from 'node:assert/strict';
import {ymcaPortfolio as m,ymcaPortfolioModel as calc} from '../lib/ymca-portfolio-model.mjs';
assert.equal(Object.values(m.budget.allocations).reduce((a,b)=>a+b,0),m.budget.giftUsd);
for(const s of m.scenarios){const r=calc(s);for(const[k,v]of Object.entries(r)){if(v===null)assert.equal(s.outputs[k],null);else assert.ok(Math.abs(v-s.outputs[k])<1e-8*Math.max(1,Math.abs(v)),k);}}
assert.ok(calc(m.scenarios[5]).bayIncludingSfNetQaly<0);
assert.ok(calc(m.scenarios[5]).sfNetQaly>0);
for(const patch of [{sfShare:2},{sfShare:NaN},{dpp:{...m.scenarios[0].dpp,diabetesDelayYears:Infinity}}])assert.throws(()=>calc({...m.scenarios[0],...patch}));
