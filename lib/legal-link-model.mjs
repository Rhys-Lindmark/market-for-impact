// Legal Link: full donor cost, partial training-to-health scope. No empirical QALY estimate.
// Priors locked before first execution, 2026-09-11 07:00 UTC research phase.
export const MODEL_VERSION = 'legal-link-whole-gift-partial-health-v1';
export const anchors = Object.freeze({ expense:765831, revenue:818902, governmentGrants:252832,
  programFees:257292, unrestrictedNetAssets:450300, cashAndTemporary:509767,
  annualCertified:586, californiaCertified:195 });
const central = {funding:.3,delivery:.8,active:.6,casesPerActive:10,unique:.8,
  resolutionIncrement:.1,healthShare:.3,utility:.03,duration:1,harmPerCase:.00025,
  bayWithinCalifornia:.75,sfWithinBay:.4};
// Resolution increment is the additional probability versus existing partner care, not success rate.
export const scenarios = Object.freeze([
  {name:'Funding null',weight:.25,...central,funding:0},
  {name:'Health null',weight:.20,...central,resolutionIncrement:0,harmPerCase:0},
  {name:'Harm',weight:.10,...central,resolutionIncrement:0,harmPerCase:.001},
  {name:'Cautious',weight:.20,...central,funding:.1,delivery:.6,active:.4,casesPerActive:5,
    unique:.7,resolutionIncrement:.03,healthShare:.2,utility:.02,duration:.5,harmPerCase:.00005,
    bayWithinCalifornia:.6,sfWithinBay:.3},
  {name:'Central',weight:.20,...central},
  {name:'Favorable stress',weight:.05,...central,funding:.7,delivery:1,active:.85,casesPerActive:25,
    unique:.9,resolutionIncrement:.25,healthShare:.5,utility:.06,duration:2,harmPerCase:.00005,
    bayWithinCalifornia:.9,sfWithinBay:.45}
].map(Object.freeze));
const probabilityKeys=['funding','delivery','active','unique','resolutionIncrement','healthShare',
  'bayWithinCalifornia','sfWithinBay','weight'];
function finite(n,min,max,key) {if(!Number.isFinite(n)||n<min||n>max)throw new RangeError(key);}
export function costPer10(gift,q) {return q>0 ? 10*gift/q : null;}
export function evaluateScenario(s,gift=100000) {
  finite(gift,0,100000,'gift: diagnostic domain 0–100000, not verified funding room');
  for(const k of probabilityKeys)finite(s[k],0,1,k);
  finite(s.casesPerActive,0,25,'casesPerActive'); finite(s.utility,0,.1,'utility');
  finite(s.duration,0,2,'duration'); finite(s.harmPerCase,0,.01,'harmPerCase');
  const trainingEquivalent=gift/anchors.expense*anchors.annualCertified;
  const additionalTraining=trainingEquivalent*s.funding*s.delivery;
  const uniqueCases=additionalTraining*s.active*s.casesPerActive*s.unique;
  // One year of worker case generation; no lifetime productivity. Cases begin at year 1
  // (six months delivery + six months mean case accrual). Benefit duration includes convergence
  // with alternative care. Continuous discount equivalent to annual 3%.
  const r=Math.log(1.03), discountedYears=(1-Math.exp(-r*s.duration))/r/1.03;
  const positiveQ=uniqueCases*s.resolutionIncrement*s.healthShare*s.utility*discountedYears;
  const harmQ=uniqueCases*s.harmPerCase/1.03;
  const modeledTrainingQ=positiveQ-harmQ;
  // Geography is output-based proxy, not measured expenditure or beneficiary residence.
  const bayShare=anchors.californiaCertified/anchors.annualCertified*s.bayWithinCalifornia;
  const bayQ=modeledTrainingQ*bayShare, sfQ=bayQ*s.sfWithinBay;
  return {...s,gift,trainingEquivalent,additionalTraining,uniqueCases,positiveQ,harmQ,
    modeledTrainingQ,bayShare,bayQ,sfQ,bayCostPer10:costPer10(gift,bayQ),
    sfCostPer10:costPer10(gift,sfQ),verifiedMarginalGrossCostPer10:null,completeSocietalCostPer10:null};
}
export function runModel(gift=100000,worlds=scenarios) {
  if(!Array.isArray(worlds)||!worlds.length)throw new RangeError('worlds');
  if(Math.abs(worlds.reduce((a,s)=>a+s.weight,0)-1)>1e-10)throw new RangeError('weights');
  const rows=worlds.map(s=>evaluateScenario(s,gift));
  const bayQ=rows.reduce((a,s)=>a+s.weight*s.bayQ,0), sfQ=rows.reduce((a,s)=>a+s.weight*s.sfQ,0);
  const withoutFavorable=rows.filter(s=>s.name!=='Favorable stress');
  const retainedMass=withoutFavorable.reduce((a,s)=>a+s.weight,0);
  const exTailQ=retainedMass ? withoutFavorable.reduce((a,s)=>a+s.weight*s.bayQ,0)/retainedMass : 0;
  const tail=rows.find(s=>s.name==='Favorable stress');
  return {modelVersion:MODEL_VERSION,gift,anchors,rows,bayQ,sfQ,bayCostPer10:costPer10(gift,bayQ),
    sfCostPer10:costPer10(gift,sfQ),favorableShareOfSignedQ:bayQ>0&&tail?tail.weight*tail.bayQ/bayQ:null,
    withoutFavorableBayCostPer10:costPer10(gift,exTailQ),
    subjectiveMassBelow1m:rows.reduce((a,s)=>a+(s.bayCostPer10!==null&&s.bayCostPer10<1e6?s.weight:0),0),
    subjectiveMassBelow100k:rows.reduce((a,s)=>a+(s.bayCostPer10!==null&&s.bayCostPer10<1e5?s.weight:0),0),
    verifiedMarginalGrossCostPer10:null,completeSocietalCostPer10:null};
}
