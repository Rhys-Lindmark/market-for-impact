// Independent current clinical/resource model; historical portfolio remains frozen.
export const inputs={gift:100000,discount:.03,mortality:.02,bay:.98,sf:.95,k:1,independentHarm:0,externalOther:10000,
 paths:[{id:'glasses',allocation:.2,cost:150,external:100,funding:.5,cap:100,distinct:1,unmet:.7,utility:.02,use:.75,horizon:1,delay:.1,harm:.0002},{id:'hearing',allocation:.1,cost:1500,external:1000,funding:.5,cap:5,distinct:.8,unmet:.7,utility:.02,use:.6,horizon:1,delay:.25,harm:.001},{id:'dentures',allocation:.15,cost:1500,external:1000,funding:.5,cap:8,distinct:.8,unmet:.6,utility:.015,use:.7,horizon:1,delay:.25,harm:.002}]};
export const resources={Y:25000,p:.05,S:50,workerShare:.1,netAnnualGainUSD:1000,incomeHorizon:.5,reserveWorkerClinical:true,B:0,inducedExposure:0};
const integral=(r,t)=>r===0?t:-Math.expm1(-r*t)/r;
export function calculate(p=inputs,j=resources){
 validate(p,j);
 const r=Math.log1p(p.discount)+p.mortality,rd=Math.log1p(p.discount);
 let grossResources=p.gift+p.externalOther,health=0;
 const rows=p.paths.map(x=>{const nominal=p.gift*x.allocation/x.cost,A=Math.min(nominal*x.funding,x.cap),N=A*x.distinct,U=N*x.unmet,years=x.use*Math.exp(-r*x.delay)*integral(r,x.horizon),gross=U*x.utility*years,harm=A*x.harm;grossResources+=nominal*x.external;health+=gross-harm;return {...x,nominal,A,N,U,years,gross,harm};});
 const g=rows.find(x=>x.id==='glasses'),workers=g.U*j.workerShare;
 const earnings=.5*workers*Math.log1p(j.netAnnualGainUSD/j.Y)*Math.exp(-r*g.delay)*integral(r,j.incomeHorizon);
 const excluded=j.reserveWorkerClinical&&earnings>0?workers*Math.max(0,g.utility)*g.years:0;
 health-=excluded;
 const purchase=.5*g.N*j.p*Math.log1p(j.S/j.Y)*Math.exp(-rd*g.delay);
 const burden=.5*j.inducedExposure*Math.log1p(-j.B/j.Y)*Math.exp(-rd*g.delay);
 const income=earnings+purchase+burden,total=p.k*(health+income)-p.independentHarm,price=(c,q)=>q>0?10*c/q:null;
 const result={healthUS:p.k*health-p.independentHarm,earningsUS:p.k*earnings,purchaseUS:p.k*purchase,burdenUS:p.k*burden,incomeUS:p.k*income,totalUS:total,bayHealth:(p.k*health-p.independentHarm)*p.bay,bayIncome:p.k*income*p.bay,bayTotal:total*p.bay,sfTotal:total*p.sf,bayPrice:price(p.gift,total*p.bay),sfPrice:price(p.gift,total*p.sf),grossResourceBayPrice:price(grossResources,total*p.bay),grossResources,workers,purchasers:g.N*j.p,excludedPositiveClinicalUS:p.k*excluded,rows};
 finite(result);return result;
}


const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
function exact(x,allowed){if(!object(x)||Object.keys(x).some(k=>!allowed.includes(k))||allowed.some(k=>!Object.hasOwn(x,k)))throw new RangeError('missing or unknown input');}
const probability=x=>Number.isFinite(x)&&x>=0&&x<=1;
function validate(p,j){
 exact(p,['gift','discount','mortality','bay','sf','k','independentHarm','externalOther','paths']);
 exact(j,['Y','p','S','workerShare','netAnnualGainUSD','incomeHorizon','reserveWorkerClinical','B','inducedExposure']);
 for(const [k,v] of Object.entries(p))if(k!=='paths'&&(!Number.isFinite(v)||v<0))throw new RangeError('root input');
 if(p.gift<=0||p.gift>100000||p.discount>1||p.mortality>1||![p.bay,p.sf,p.k].every(probability)||p.sf>p.bay)throw new RangeError('supported gift, time or geography');
 if(!Array.isArray(p.paths)||p.paths.length!==3||new Set(p.paths.map(x=>x?.id)).size!==3)throw new RangeError('distinct pathways');
 let allocation=0;
 for(const x of p.paths){
  exact(x,['id','allocation','cost','external','funding','cap','distinct','unmet','utility','use','horizon','delay','harm']);
  if(!['glasses','hearing','dentures'].includes(x.id))throw new RangeError('unknown pathway');
  for(const [k,v] of Object.entries(x))if(k!=='id'&&(!Number.isFinite(v)||(k!=='utility'&&v<0)))throw new RangeError('pathway numeric');
  if(![x.allocation,x.funding,x.distinct,x.unmet,x.use].every(probability)||x.cost<=0||Math.abs(x.utility)>1||x.horizon>1||x.delay>1)throw new RangeError('pathway domain');
  allocation+=x.allocation;
 }
 if(allocation>1+1e-12)throw new RangeError('allocation');
 for(const [k,v] of Object.entries(j))if(k!=='reserveWorkerClinical'&&(!Number.isFinite(v)||(k!=='netAnnualGainUSD'&&v<0)))throw new RangeError('resource numeric');
 if(j.Y<=0||j.netAnnualGainUSD<=-j.Y||j.B>=j.Y||![j.p,j.workerShare].every(probability)||j.incomeHorizon>1||typeof j.reserveWorkerClinical!=='boolean')throw new RangeError('resource domain');
 if(j.p+p.paths.find(x=>x.id==='glasses').unmet>1+1e-12)throw new RangeError('purchasers and unmet care overlap');
}
function finite(o){for(const v of Object.values(o)){if(typeof v==='number'&&!Number.isFinite(v))throw new RangeError('nonfinite output');if(v&&typeof v==='object')finite(v);}}
