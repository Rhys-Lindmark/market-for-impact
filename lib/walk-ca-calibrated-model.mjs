// Conditional partial physical-safety portfolio model; not a verified donor tranche.
export const modelVersion='walk-ca-independent-conditional-v1';
export const defaultInputs=Object.freeze({gift:100000,expense:992695,funding:.5,advocacyShare:.5,influence:.25,riskShare:.01,acceleration:.5,openingDelay:1.5,annualFatalities:25,annualSevere:500,fatalReduction:.1,severeReduction:.2,survivalUtility:.8,survivalYears:30,hazard:.02,injuryUtility:.1,injuryYears:1,resourceShare:.3,clinicalOverlapShare:.3,netReceipt:2500,baseline:50000,healthCA:.98,incomeCA:.98,burdenCA:1,assignment:1,discount:.03,fee:0,inducedHouseholds:0,inducedLoss:0,independentHealthHarm:0,capital:1000000,maintenance:20000});
const A=(z,t)=>z===0?t:-Math.expm1(-z*t)/z;
export function calculate(overrides={}){
 if(!overrides||typeof overrides!=='object'||Array.isArray(overrides)||Object.getPrototypeOf(overrides)!==Object.prototype)throw Error('Plain overrides required');
 for(const [k,v]of Object.entries(overrides))if(!Object.hasOwn(defaultInputs,k)||!Number.isFinite(v))throw Error('Unknown/nonfinite '+k);
 const x={...defaultInputs,...overrides};
 for(const k of ['funding','advocacyShare','influence','riskShare','survivalUtility','resourceShare','clinicalOverlapShare','healthCA','incomeCA','burdenCA','assignment','fee'])if(x[k]<0||x[k]>1)throw Error('Fraction '+k);
 for(const k of ['fatalReduction','severeReduction','injuryUtility'])if(Math.abs(x[k])>1)throw Error('Signed fraction '+k);
 for(const k of ['gift','expense','annualFatalities','annualSevere','hazard','openingDelay','inducedHouseholds','inducedLoss','independentHealthHarm','capital','maintenance'])if(x[k]<0)throw Error('Nonnegative '+k);
 if(x.expense<=0||x.baseline<=0||x.gift>100000||x.inducedLoss>=x.baseline||x.netReceipt<=-x.baseline||x.discount<0||x.discount>1||x.hazard>1||x.openingDelay>10)throw Error('Domain');
 for(const [k,max]of [['acceleration',3],['survivalYears',30],['injuryYears',5]])if(x[k]<0||x[k]>max)throw Error('Horizon '+k);
 const r=Math.log1p(x.discount),scale=x.gift/x.expense*x.funding*x.advocacyShare;
 if(scale>1)throw Error('Unsupported annual portfolio scale');
 const riskYears=scale*x.influence*x.riskShare*x.acceleration,eventDelay=x.openingDelay+x.acceleration/2,df=(1+x.discount)**(-eventDelay);
 const fatalitiesAvoided=riskYears*x.annualFatalities*x.fatalReduction,severeAvoided=riskYears*x.annualSevere*x.severeReduction;
 const fatalHealth=fatalitiesAvoided*x.survivalUtility*A(r+x.hazard,x.survivalYears)*df;
 // Fixed cohort reservation independent of cash sign. Negative clinical harms are never attenuated.
 const clinicalShare=severeAvoided*x.injuryUtility>0?1-x.clinicalOverlapShare:1;
 const injuryHealth=severeAvoided*clinicalShare*x.injuryUtility*A(r,x.injuryYears)*df;
 const resourceHouseholds=Math.abs(severeAvoided)*x.resourceShare;
 const signedNetReceipt=severeAvoided<0?-x.netReceipt:x.netReceipt;
 if(signedNetReceipt<=-x.baseline)throw Error('Signed resource loss exceeds baseline');
 const income=.5*resourceHouseholds*Math.log1p(signedNetReceipt/x.baseline)*df;
 const healthAll=x.assignment*(fatalHealth+injuryHealth),incomeAll=x.assignment*income;
 const burdenAll=.5*x.inducedHouseholds*Math.log1p(-x.inducedLoss/x.baseline)/(1+x.discount)**x.openingDelay;
 const healthCA=healthAll*x.healthCA-x.independentHealthHarm, incomeCA=incomeAll*x.incomeCA,burdenCA=burdenAll*x.burdenCA,totalCA=healthCA+incomeCA+burdenCA;
 const donorUSD=x.gift*(1+x.fee),grossAssociatedResourceUSD=donorUSD+scale*x.influence*(x.capital+x.maintenance*x.acceleration);
 const out={inputs:x,scale,riskYears,eventDelay,fatalitiesAvoided,severeAvoided,fatalHealth,injuryHealth,clinicalShare,resourceHouseholds,healthAll,incomeAll,burdenAll,editionQalys:healthCA,incomeEquivalentYears:incomeCA,recipientBurdenYears:burdenCA,totalCA,donorUSD,grossAssociatedResourceUSD,price:totalCA>0&&donorUSD>0?10*donorUSD/totalCA:null};
 const finite=o=>{for(const v of Object.values(o))if(v&&typeof v==='object')finite(v);else if(typeof v==='number'&&!Number.isFinite(v))throw Error('Nonfinite result');};finite(out);return out;
}
export const cases={central:{},lowInfluence:{influence:.05},highInfluence:{influence:.5},lowRisk:{riskShare:.002},highRisk:{riskShare:.03},quarterYear:{acceleration:.25},oneYear:{acceleration:1},meanExpense:{expense:(903009+947214+992695)/3},zeroIncome:{netReceipt:0},zeroHealth:{fatalReduction:0,injuryUtility:0},resourceLoss:{netReceipt:-2500},injuryHarm:{severeReduction:-.2},fatalHarm:{fatalReduction:-.1},noFunding:{funding:0},noInfluence:{influence:0},noAssignment:{assignment:0},noCA:{healthCA:0,incomeCA:0},failedInduced:{funding:0,inducedHouseholds:10,inducedLoss:100},assignmentInduced:{assignment:0,inducedHouseholds:10,inducedLoss:100},independentHarm:{independentHealthHarm:.1},income25K:{baseline:25000},income100K:{baseline:100000},healthOnlyFullCohort:{resourceShare:0,clinicalOverlapShare:0},physicalCashCoexistence:{clinicalOverlapShare:0},fees:{fee:.03},fiveYearSurvival:{survivalYears:5},tenYearSurvival:{survivalYears:10},twentyYearSurvival:{survivalYears:20}};
export function diagnostics(){return Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,calculate(v)]));}
