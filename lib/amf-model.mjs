export function amfModel(s) {
 const scalar=Object.entries(s).filter(([k])=>!['id','outputs','coverage'].includes(k));
 if(scalar.some(([,v])=>typeof v!=='number'||!Number.isFinite(v)||v<0)||!Array.isArray(s.coverage)||s.coverage.some(v=>!Number.isFinite(v)||v<0||v>1)||!Number.isInteger(s.horizon)||s.horizon>150)throw new RangeError('Invalid AMF model input');
 let life=0;for(let k=1;k<=s.horizon;k++)life+=s.persistentFraction*s.utility*(s.annualSurvival/1.03)**(k-.5);
 const exposure=s.coverage.reduce((sum,c,i)=>sum+c/1.03**(s.delay+i+.5),0);
 const deaths=1000*s.people*s.childShare*s.mortality*s.rrr*s.transport*s.additionality*exposure;
 const q=deaths*life-1000*s.additionality*s.sharedHarm/1.03**(s.delay+.5)-1000*s.independentHarm;
 return {globalQaly:q,donorCostUsd:1000*s.price,grossAssociatedCostUsd:1000*(s.price+s.extra),globalUsdPerQaly:q>0?1000*s.price/q:null,globalUsdPer10Qaly:q>0?10000*s.price/q:null,grossAssociatedUsdPer10Qaly:q>0?10000*(s.price+s.extra)/q:null,bayDirectQaly:0,bayIndirectCreditedQaly:0,bayUsdPer10Qaly:null,bayCreditedHealthShare:0};
}
