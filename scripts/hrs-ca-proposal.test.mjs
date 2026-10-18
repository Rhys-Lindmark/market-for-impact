import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,defaults,cases} from '../docs/geography-discovery/hrs-ca-proposal-2026-10-01.calculate.mjs';
import {calculate as corrected} from '../docs/geography-discovery/hrs-ca-recalibration-2026-10-01.calculate.mjs';

test('HRS proposal independently matches finite survival quadrature',()=>{
 const p=defaults,n=100000,dt=p.horizon/n;let q=0;
 for(let i=0;i<n;i++){
  const t=(i+.5)*dt;if(t<p.delay)continue;
  const a=t-p.delay,b=Math.min(a,p.activeYears),tail=Math.max(0,a-p.activeYears);
  const baseline=Math.exp(-(p.lambda+p.mu)*p.delay-(p.lambda+p.mu)*b-(p.postLambda+p.postMu)*tail);
  const intervention=Math.exp(-(p.lambda+p.mu)*p.delay-(p.lambda*(1-p.effect)+p.mu)*b-(p.postLambda+p.postMu)*tail);
  q+=(intervention-baseline)*p.utility*Math.exp(-p.discount*t)*dt;
 }
 const c=calculate();assert.ok(Math.abs(q-c.clinicalPerProtected)<1e-8);
 assert.ok(Math.abs(c.caUsdPerBetterLife-6852222.069522628)<1e-7);
 assert.equal(calculate(cases.priorExact).caUsdPerBetterLife,3089019.7114568832);
});

test('HRS proposal partitions purchaser access and preserves signed outcomes',()=>{
 assert.equal(calculate({purchaserShare:1}).healthYearsCA,0);
 assert.ok(calculate({purchaserShare:1}).incomeEquivalentYearsCA>0);
 assert.ok(calculate({effect:0,netSaving:-10}).combinedYearsCA<0);
 assert.equal(calculate(cases.noAssignment).combinedYearsCA,0);
 assert.equal(calculate(cases.noFunding).combinedYearsCA,0);
 assert.ok(calculate(cases.inducedFailedAccess).combinedYearsCA<0);
 assert.ok(calculate(cases.negativeClinical).healthYearsCA<0);
 assert.equal(calculate(cases.noCalifornia).caUsdPerBetterLife,null);
 for(const o of Object.values(cases))calculate(o);
});

test('HRS proposal rejects invalid inputs and inherited-key overrides',()=>{
 for(const o of [null,[],{toString:1},{gift:Infinity},{effect:2},{netSaving:-25000}])assert.throws(()=>calculate(o));
});

test('Corrected candidate retains independent induced harm without assigned benefit',()=>{
 const a=corrected({assignment:0,additionality:0,inducedApplicants:20,applicantLoss:10});
 assert.equal(a.healthYearsCA,0);assert.equal(a.incomeEquivalentYearsCA,0);
 assert.ok(a.inducedBurdenYearsCA<0);assert.equal(a.caUsdPerBetterLife,null);
 assert.equal(corrected().caUsdPerBetterLife,calculate().caUsdPerBetterLife);
});
