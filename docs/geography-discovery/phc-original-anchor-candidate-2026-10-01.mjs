// Independent proposal arithmetic, not a public production wrapper.
export const inputs={gift:100000,discount:.03,mortality:.02,bay:.98,sf:.95,k:1,independentHarm:0,externalOther:10000,
 paths:[{id:'glasses',allocation:.2,cost:150,external:100,funding:.5,cap:100,distinct:1,unmet:.7,utility:.02,use:.75,horizon:1,delay:.1,harm:.0002},{id:'hearing',allocation:.1,cost:1500,external:1000,funding:.5,cap:5,distinct:.8,unmet:.7,utility:.02,use:.6,horizon:1,delay:.25,harm:.001},{id:'dentures',allocation:.15,cost:1500,external:1000,funding:.5,cap:8,distinct:.8,unmet:.6,utility:.015,use:.7,horizon:1,delay:.25,harm:.002}]};
export const resources={Y:25000,p:.05,S:50,workerShare:.1,netAnnualGainUSD:1000,incomeHorizon:.5,reserveWorkerClinical:true,B:0,inducedExposure:0};
const integral=(r,t)=>r===0?t:-Math.expm1(-r*t)/r;
export function calculate(p=inputs,j=resources){
 const r=Math.log1p(p.discount)+p.mortality,rd=Math.log1p(p.discount);
 let grossResources=p.gift+p.externalOther,health=-p.independentHarm;
 const rows=p.paths.map(x=>{const nominal=p.gift*x.allocation/x.cost,A=Math.min(nominal*x.funding,x.cap),N=A*x.distinct,U=N*x.unmet,years=x.use*Math.exp(-r*x.delay)*integral(r,x.horizon),gross=U*x.utility*years,harm=A*x.harm;grossResources+=nominal*x.external;health+=gross-harm;return {...x,nominal,A,N,U,years,gross,harm};});
 const g=rows[0],workers=g.U*j.workerShare;
 const excluded=j.reserveWorkerClinical&&j.netAnnualGainUSD>0?workers*Math.max(0,g.utility)*g.years:0;
 health-=excluded;
 const earnings=.5*workers*Math.log1p(j.netAnnualGainUSD/j.Y)*Math.exp(-r*g.delay)*integral(r,j.incomeHorizon);
 const purchase=.5*g.N*j.p*Math.log1p(j.S/j.Y)*Math.exp(-rd*g.delay);
 const burden=.5*j.inducedExposure*Math.log1p(-j.B/j.Y)*Math.exp(-rd*g.delay);
 const income=earnings+purchase+burden,total=p.k*(health+income),price=(c,q)=>q>0?10*c/q:null;
 return {healthUS:p.k*health,earningsUS:p.k*earnings,purchaseUS:p.k*purchase,burdenUS:p.k*burden,incomeUS:p.k*income,totalUS:total,bayHealth:p.k*health*p.bay,bayIncome:p.k*income*p.bay,bayTotal:total*p.bay,sfTotal:total*p.sf,bayPrice:price(p.gift,total*p.bay),sfPrice:price(p.gift,total*p.sf),grossResourceBayPrice:price(grossResources,total*p.bay),grossResources,workers,purchasers:g.N*j.p,excludedPositiveClinicalUS:p.k*excluded,rows};
}
const pathChange=f=>({...inputs,paths:inputs.paths.map(x=>f({...x}))});
const old=pathChange(x=>({...x,utility:{glasses:.0375,hearing:.02,dentures:.03}[x.id]}));
const cases={central:calculate(),historical:calculate(old,{...resources,p:0,workerShare:0}),cashZero:calculate(inputs,{...resources,p:0,workerShare:0}),coexistingPhysicalAndEarnings:calculate(inputs,{...resources,reserveWorkerClinical:false}),negativeEarnings:calculate(inputs,{...resources,netAnnualGainUSD:-1000}),Y50000:calculate(inputs,{...resources,Y:50000}),noChange:calculate(pathChange(x=>({...x,funding:0}))),failedInducedAccess:calculate(pathChange(x=>({...x,funding:0})),{...resources,inducedExposure:20,B:6}),zeroAssignment:calculate({...inputs,k:0}),jointHarm:calculate(pathChange(x=>({...x,utility:-.02})),{...resources,netAnnualGainUSD:-1000,inducedExposure:20,B:6})};
cases.healthNullPositiveIncome=calculate(pathChange(x=>({...x,utility:0,harm:0})));
cases.negativeHealthPositiveIncome=calculate(pathChange(x=>({...x,utility:-.02})));
cases.fullyNull=calculate(pathChange(x=>({...x,utility:0,harm:0})),{...resources,p:0,workerShare:0});
for(const u of [0,.01,.0375,.075])cases['glassesUtility'+u]=calculate(pathChange(x=>x.id==='glasses'?{...x,utility:u}:x));
for(const t of [.25,.5,1])cases['healthHorizon'+t]=calculate(pathChange(x=>({...x,horizon:t})));
console.log(JSON.stringify({candidateNotAccepted:true,inputs,resources,cases},null,2));
