export const modelVersion='alameda-health-consortium-whole-gift-three-pathways-v1';
export const anchors=Object.freeze({ein:'51-0189590',wholeExpense:7594840,newEnrollments:7323,renewals:9339,pediatricMinutes:130977,trainedCHW:83,fiscalEnd:'2025-06-30'});
const central={scale:1,newAdditional:.1,renewalAdditional:.03,coverageUtility:.01,coverageYears:.5,minutesPerPerson:120,bhClinicalFit:.25,bhAdditionalEntry:.25,bhTrialQ:.04,bhTransfer:.5,bhContribution:.25,bhNonOverlap:.5,chwRetainedRole:.5,chwExtraCourses:20,chwCourseQ:.01,chwContribution:.2,chwNonOverlap:.5,funding:.7,bay:.98,harmQ:1};
export const scenarios=Object.freeze([
 {id:'funding-null',weight:.2,...central,funding:0},
 {id:'health-null',weight:.2,...central,coverageUtility:0,bhTransfer:0,chwCourseQ:0,harmQ:0},
 {id:'harm',weight:.1,...central,coverageUtility:0,bhTransfer:0,chwCourseQ:0,harmQ:3},
 {id:'cautious',weight:.2,...central,scale:.75,newAdditional:.03,renewalAdditional:.01,coverageUtility:.005,coverageYears:.25,minutesPerPerson:240,bhClinicalFit:.1,bhAdditionalEntry:.1,bhTrialQ:.02,bhTransfer:.25,bhContribution:.1,bhNonOverlap:.25,chwRetainedRole:.25,chwExtraCourses:5,chwCourseQ:.002,chwContribution:.1,chwNonOverlap:.25,funding:.3,bay:.95,harmQ:.05},
 {id:'central',weight:.2,...central},
 {id:'favorable',weight:.1,...central,newAdditional:.25,renewalAdditional:.1,coverageUtility:.02,coverageYears:1,minutesPerPerson:60,bhClinicalFit:.5,bhAdditionalEntry:.5,bhTrialQ:.09,bhTransfer:.75,bhContribution:.5,bhNonOverlap:.75,chwRetainedRole:.75,chwExtraCourses:80,chwCourseQ:.02,chwContribution:.4,chwNonOverlap:.75,funding:.9,bay:.99,harmQ:3}
].map(Object.freeze));
const bounds={weight:[0,1],scale:[0,3],newAdditional:[0,1],renewalAdditional:[0,1],coverageUtility:[0,1],coverageYears:[0,2],minutesPerPerson:[30,10000],bhClinicalFit:[0,1],bhAdditionalEntry:[0,1],bhTrialQ:[0,.1],bhTransfer:[0,1],bhContribution:[0,1],bhNonOverlap:[0,1],chwRetainedRole:[0,1],chwExtraCourses:[0,200],chwCourseQ:[0,.1],chwContribution:[0,1],chwNonOverlap:[0,1],funding:[0,1],bay:[0,1],harmQ:[0,1000]};
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const number=(v,lo,hi,k)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<lo||v>hi)throw new RangeError(k);};
const price=(c,q)=>{if(q<=0)return null;const p=10*c/q;if(!Number.isFinite(p))throw new RangeError('price overflow');return p;};
export function calculate(options={}){
 if(!object(options))throw new TypeError('options');
 const{gift=10000,wholeExpense=anchors.wholeExpense,worlds=scenarios}=options;number(gift,0,10000,'gift');number(wholeExpense,1,1e9,'wholeExpense');
 if(!Array.isArray(worlds)||!worlds.length||worlds.length>100)throw new TypeError('worlds');
 const ids=new Set();let mass=0;
 const results=worlds.map(s=>{
  if(!object(s)||typeof s.id!=='string'||!s.id.trim()||ids.has(s.id))throw new TypeError('world identity');ids.add(s.id);
  for(const[k,[lo,hi]]of Object.entries(bounds))number(s[k],lo,hi,k);mass+=s.weight;
  // Nonoverlapping coverage-person-period equivalents: additional fractions include within-coverage duplicate-person/gap adjustment, distinct from cross-pathway overlap.
  const additionalCoveragePeople=s.scale*(anchors.newEnrollments*s.newAdditional+anchors.renewals*s.renewalAdditional);
  const coverageQ=additionalCoveragePeople*s.coverageUtility*s.coverageYears;
  const pediatricPersonEquivalents=anchors.pediatricMinutes*s.scale/s.minutesPerPerson;
  const additionalBhEntries=pediatricPersonEquivalents*s.bhClinicalFit*s.bhAdditionalEntry;
  const behavioralQBeforeOverlap=additionalBhEntries*s.bhTrialQ*s.bhTransfer*s.bhContribution;
  const behavioralQ=behavioralQBeforeOverlap*s.bhNonOverlap;
  const retainedChwRoles=anchors.trainedCHW*s.scale*s.chwRetainedRole;
  const additionalChwCourses=retainedChwRoles*s.chwExtraCourses;
  const workforceQBeforeOverlap=additionalChwCourses*s.chwCourseQ*s.chwContribution;
  const workforceQ=workforceQBeforeOverlap*s.chwNonOverlap;
  const grossQ=coverageQ+behavioralQ+workforceQ;
  const annualQ=(grossQ-s.harmQ*s.scale)*s.funding,annualBayQ=annualQ*s.bay;
  return{id:s.id,weight:s.weight,additionalCoveragePeople,coverageQ,pediatricPersonEquivalents,additionalBhEntries,behavioralQBeforeOverlap,behavioralQ,retainedChwRoles,additionalChwCourses,workforceQBeforeOverlap,workforceQ,grossQ,harmQ:s.harmQ*s.scale,annualQ,annualBayQ,giftBayQ:annualBayQ*gift/wholeExpense,bayCostPer10:price(wholeExpense,annualBayQ)};
 });
 if(Math.abs(mass-1)>1e-10)throw new RangeError('weights sum');
 const weightedAnnualBayQ=results.reduce((v,r)=>v+r.weight*r.annualBayQ,0),weightedAnnualQ=results.reduce((v,r)=>v+r.weight*r.annualQ,0);
 const f=results.find(r=>r.id==='favorable');
 const result={modelVersion,gift,wholeExpense,results,weightedAnnualQ,weightedAnnualBayQ,weightedGiftBayQ:weightedAnnualBayQ*gift/wholeExpense,bayCostPer10:price(wholeExpense,weightedAnnualBayQ),allCostPer10:price(wholeExpense,weightedAnnualQ),favorableShare:weightedAnnualBayQ>0&&f?f.weight*f.annualBayQ/weightedAnnualBayQ:null,probabilityBelow1M:results.reduce((a,r)=>a+(r.bayCostPer10!==null&&r.bayCostPer10<1e6?r.weight:0),0),probabilityBelow100K:results.reduce((a,r)=>a+(r.bayCostPer10!==null&&r.bayCostPer10<1e5?r.weight:0),0),completeResourceCostPer10:null};
 const check=x=>{if(typeof x==='number'&&!Number.isFinite(x))throw new RangeError('nonfinite derived');if(object(x)||Array.isArray(x))Object.values(x).forEach(check);};check(result);return result;
}
