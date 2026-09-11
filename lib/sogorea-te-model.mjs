export const expense = 2841731;
export const worlds = [
 {id:'harm',weight:.10,people:50,event:.05,uncovered:.20,arr:-.002,utility:.20,years:.25,response:.20},
 {id:'null',weight:.25,people:100,event:.05,uncovered:.20,arr:0,utility:.20,years:1,response:0},
 {id:'central',weight:.50,people:100,event:.05,uncovered:.20,arr:.003,utility:.20,years:1,response:.20},
 {id:'favorable',weight:.15,people:250,event:.10,uncovered:.40,arr:.01,utility:.50,years:2,response:.40}
];
const finite=(x,n)=>{if(typeof x!=='number'||!Number.isFinite(x))throw Error(n);return x;};
const bounded=(x,a,b,n)=>{finite(x,n);if(x<a||x>b)throw Error(n);return x;};
const price=q=>q>0?finite(10/q,'price'):null;
export function calculate(options={}) {
 if(!options||typeof options!=='object'||Array.isArray(options))throw Error('options');
 const {gift=1000,wholeExpense=expense,hubs=4,scenarios=worlds}=options;
 bounded(gift,0,Number.MAX_VALUE,'gift');bounded(wholeExpense,Number.MIN_VALUE,Number.MAX_VALUE,'expense');bounded(hubs,0,10000,'hubs');
 if(!Array.isArray(scenarios)||!scenarios.length)throw Error('worlds');
 const ids=new Set();let sum=0;
 const rows=scenarios.map(w=>{
  if(!w||typeof w!=='object'||Array.isArray(w)||typeof w.id!=='string'||!w.id.trim()||ids.has(w.id.trim()))throw Error('world/id');ids.add(w.id.trim());
  for(const k of ['weight','event','uncovered','utility','response'])bounded(w[k],0,1,k);
  bounded(w.people,0,1e7,'people');bounded(w.arr,-1,1,'arr');bounded(w.years,0,10,'years');sum+=w.weight;
  const cohort=finite(hubs*w.people,'cohort');
  const supported=finite(cohort*w.event*w.uncovered,'supported');
  const wholeQ=finite(supported*w.arr*w.utility*w.years*w.response,'wholeQ');
  const perDollar=finite(wholeQ/wholeExpense,'perDollar');
  return {...w,cohort,supported,wholeQ,perDollar,giftQ:finite(perDollar*gift,'giftQ'),costPer10:price(perDollar)};
 });
 if(Math.abs(sum-1)>1e-10)throw Error('weights');
 const perDollar=finite(rows.reduce((s,w)=>s+w.weight*w.perDollar,0),'weighted');
 return {gift,wholeExpense,hubs,rows,perDollar,giftQ:finite(perDollar*gift,'giftQ'),costPer10:price(perDollar)};
}
export default calculate;
