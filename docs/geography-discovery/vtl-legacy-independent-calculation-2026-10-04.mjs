// Independent reconstruction: no candidate or shared helper imports.
export function reconstruct(o={}){
const x={gift:100000,cost:300,a:.5,ca:.4,publicRate:0,publicA:.5,unmet:.6,wear:.6,u:.01,T:1,d:.25,r:.03,h:.00005,hh:.8,p:.05,saving:50,fees:0,overlap:1,B:50000,loss:0,careShare:0,carePay:0,...o};
const discount=t=>(1+x.r)**(-t),steps=10000,dt=x.T/steps;
let integral=0;for(let i=0;i<=steps;i++)integral+=(i===0||i===steps?1:i%2===0?2:4)*discount(x.d+i*dt);integral*=dt/3;
const publicUSD=x.gift*x.ca*x.publicRate,n=x.gift/x.cost*x.a,m=publicUSD/x.cost*x.publicA;
const perHealth=x.unmet*x.wear*x.u*integral-x.h*discount(x.d);
const net=(positive,negative)=>positive>0?positive*x.overlap+negative:positive+negative;
const pnet=net(x.saving,-x.fees),cnet=net(x.carePay,0);
const eq=(people,gain)=>{if(x.B+gain<=0)throw Error('Nonpositive resources');return .5*people*Math.log1p(gain/x.B)*discount(x.d);};
// Same-household contemporaneous flows net once; purchaser/caregiver disjoint.
const resource=n=>eq(n*x.hh*x.p,pnet-x.loss)+eq(n*x.hh*x.careShare,cnet-x.loss)+eq(n*x.hh*(1-x.p-x.careShare),-x.loss);
const baseHealth=n*perHealth,matchHealth=m*perHealth,baseMoney=resource(n),matchMoney=resource(m);
const regions={};for(const [name,b,mb]of [['us',1,1],['bay',.08,.2],['sf',.015,.0375]]){const health=baseHealth*b+matchHealth*mb,money=baseMoney*b+matchMoney*mb,total=health+money;regions[name]={health,money,total,donorPer10:total>0?10*x.gift/total:null};}
return {integral,discount:discount(x.d),n,m,publicUSD,baseHealth,baseMoney,resourceFloor:x.gift+publicUSD,external40:x.gift+publicUSD+(x.gift+publicUSD)/x.cost*40,regions};
}
console.log(JSON.stringify({central:reconstruct(),match:reconstruct({publicRate:1}),negativeUtility:reconstruct({u:-.005}),zeroFunding:reconstruct({a:0}),cohortCancellation:reconstruct({p:1,unmet:0,saving:1000,loss:1000}),cohortMixed:reconstruct({loss:10}),zeroPositiveOverlap:reconstruct({overlap:0,fees:10,loss:5})},null,2));
