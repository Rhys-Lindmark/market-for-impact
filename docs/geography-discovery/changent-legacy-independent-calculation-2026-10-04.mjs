// Independent reconstruction: no author calculator or shared welfare helper used.
const gift=100000,expense=31183784,nfpAnnual=57087,cfAnnual=2738,duration=2.5;
const direct={nfp:17009763,cf:4920100};
const specs=[
 ['harm',.10,.02,.8,-.01,14728,.8,1,-.005,1,14643,.25,[-100,-100,0,-100],[-200,-100,0,-120]],
 ['null',.40,.03,.8,0,14728,.8,1,0,0,14643,.25,[0,0,0,-30],[0,0,0,-30]],
 ['cautiousPositive',.30,.05,.85,.001,14728,.85,.9,.005,.2,14643,.5,[0,45,0,-30],[100,0,0,-30]],
 ['central',.15,.10,.9,.01,11700,.9,.95,.020,.5,10834,.5,[0,90,0,-30],[300,0,0,-60]],
 ['favorableStress',.05,.20,.95,.08,8580,.95,1,.08,.625,8000,.75,[300,180,30,-30],[900,100,30,-60]],
];
const positiveOnly=(values,share)=>values.reduce((a,v)=>a+(v>0?v*share:v),0);
const income=(people,net,years,delay)=>.5*people*Math.log1p(net/20000)*Array.from({length:years},(_,i)=>1.03**(-delay-i)).reduce((a,v)=>a+v,0);
export function reconstruct(){
 const allocation={nfp:expense*direct.nfp/(direct.nfp+direct.cf),cf:expense*direct.cf/(direct.nfp+direct.cf)};
 const courseSupport={nfp:allocation.nfp/(nfpAnnual/duration),cf:allocation.cf/cfAnnual};
 const rows=specs.map(([name,weight,additionality,nReal,nQ,nCost,cReal,cUnique,cBridge,cTransfer,cCost,independence,nMoney,cMoney])=>{
  const support=gift*additionality,scale=support/expense,nOffered=scale*nfpAnnual/duration,cOffered=scale*cfAnnual;
  const nPeople=nOffered*nReal,cPeople=cOffered*cReal*cUnique;
  const nfpClinical=nPeople*nQ,cfClinical=cPeople*cBridge*cTransfer,clinical=nfpClinical+cfClinical;
  const nNet=positiveOnly(nMoney,independence),cNet=positiveOnly(cMoney,independence);
  const nIncome=income(nPeople,nNet,2,.5),cIncome=income(cPeople,cNet,1,0),resource=nIncome+cIncome,total=clinical+resource;
  const internal=nOffered*courseSupport.nfp+cOffered*courseSupport.cf;
  const gross=gift+Math.max(0,nOffered*nCost+cOffered*cCost-internal);
  return {name,weight,support,nOffered,cOffered,nPeople,cPeople,nfpClinical,cfClinical,clinical,nNet,cNet,nIncome,cIncome,resource,total,internal,gross,donorPer10:total>0?gift*10/total:null,grossPer10:total>0?gross*10/total:null};
 });
 const weighted=rows.reduce((a,r)=>{for(const k of ['clinical','resource','total','gross'])a[k]+=r.weight*r[k];return a},{clinical:0,resource:0,total:0,gross:0});
 weighted.donorPer10=gift*10/weighted.total;weighted.grossPer10=weighted.gross*10/weighted.total;
 const finiteAt10=.9*(1-1.03**(-10))/.03/1.03**10,fullLifetime=.9*(1-1.03**(-68.025))/.03/1.03**10;
 const lifetimeScale=(finiteAt10+.5*(fullLifetime-finiteAt10))/9;
 const lifetimeClinical=rows.reduce((a,r)=>a+r.weight*(r.nfpClinical>0?r.nfpClinical*lifetimeScale:r.nfpClinical)+r.weight*r.cfClinical,0);
 return {inputs:{gift,expense,nfpAnnual,cfAnnual,duration,direct},allocation,courseSupport,rows,central:rows.find(r=>r.name==='central'),weighted,lifetimeScale,lifetimeClinical,
  signedChecks:{zeroPositiveCredit:positiveOnly([100,-40,-20],0),mixed:positiveOnly([100,-40],.5),harm:positiveOnly([-100,-100,0,-100],.25)},
  financialArithmetic:[{fy:2025,revenue:28694523,expense:31183784},{fy:2024,revenue:42539779,expense:30712013},{fy:2023,revenue:40565834,expense:40030887}].map(r=>({...r,difference:r.revenue-r.expense}))};
}
if(process.argv[1]?.endsWith('changent-legacy-independent-20261004.calculate.mjs'))console.log(JSON.stringify(reconstruct(),null,2));
