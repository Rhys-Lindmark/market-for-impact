export const inputs={giftUsd:100000,fy2025ExpenseUsd:6354606,reportedWholeOrganizationPeopleFloor:8000,reportedClinicPatientsApprox:5000,reportedCommunityBeneficiariesApprox:4500,annualVisits:15000,bayShare:1,sfShare:0};
export const scenarios=[
 {name:'harm',weight:.05,fundingAdditionality:.25,symptomaticTreatedShare:.20,completion:.60,disabilityWeight:0,resolvedDurationYears:0,benefitDelayYears:0,attributableResolution:0,harmQalyPerIncrementalCompletedPerson:.002,grossMultiplier:1.25},
 {name:'null',weight:.35,fundingAdditionality:.10,symptomaticTreatedShare:0,completion:0,disabilityWeight:0,resolvedDurationYears:0,benefitDelayYears:0,attributableResolution:0,harmQalyPerIncrementalCompletedPerson:0,grossMultiplier:1.15},
 {name:'cautious',weight:.30,fundingAdditionality:.20,symptomaticTreatedShare:.20,completion:.60,disabilityWeight:.005,resolvedDurationYears:.25,benefitDelayYears:.10,attributableResolution:.30,harmQalyPerIncrementalCompletedPerson:0,grossMultiplier:1.15},
 {name:'central',weight:.25,fundingAdditionality:.35,symptomaticTreatedShare:.35,completion:.75,disabilityWeight:.010,resolvedDurationYears:.75,benefitDelayYears:.10,attributableResolution:.50,harmQalyPerIncrementalCompletedPerson:0,grossMultiplier:1.10},
 {name:'favorable',weight:.05,fundingAdditionality:.60,symptomaticTreatedShare:.50,completion:.90,disabilityWeight:.019,resolvedDurationYears:1.50,benefitDelayYears:.05,attributableResolution:.75,harmQalyPerIncrementalCompletedPerson:0,grossMultiplier:1.05}
];
export function finiteDurationQaly(s,discountRate=.03){
 if(s.resolvedDurationYears<0||s.benefitDelayYears<0||s.disabilityWeight<0||discountRate<0)throw new RangeError('finite duration inputs');
 return s.disabilityWeight*s.resolvedDurationYears/(1+discountRate)**(s.benefitDelayYears+s.resolvedDurationYears/2);
}
export function calculate(i=inputs,ss=scenarios){
 const weight=ss.reduce((a,s)=>a+s.weight,0);if(Math.abs(weight-1)>1e-12)throw new RangeError('scenario weights');
 const giftShare=i.giftUsd/i.fy2025ExpenseUsd;const giftLinkedReportedClinicPatients=i.reportedClinicPatientsApprox*giftShare;
 const rows=ss.map(s=>{
  const incrementalCompletedSymptomaticPeople=giftLinkedReportedClinicPatients*s.fundingAdditionality*s.symptomaticTreatedShare*s.completion;
  const finiteResolvedStateQaly=finiteDurationQaly(s);
  const positiveQaly=incrementalCompletedSymptomaticPeople*finiteResolvedStateQaly*s.attributableResolution;
  const harmQaly=incrementalCompletedSymptomaticPeople*s.harmQalyPerIncrementalCompletedPerson;
  const netQaly=positiveQaly-harmQaly;const grossResourcesUsd=i.giftUsd*s.grossMultiplier;
  return {...s,incrementalCompletedSymptomaticPeople,finiteResolvedStateQaly,positiveQaly,harmQaly,netQaly,grossResourcesUsd,
   modeledOrdinaryGiftCostPer10Qaly:netQaly>0?i.giftUsd*10/netQaly:null,
   modeledGrossResourceCostPer10Qaly:netQaly>0?grossResourcesUsd*10/netQaly:null,
   verifiedMarginalGiftCostPer10Qaly:null,verifiedMarginalGrossCostPer10Qaly:null,
   bayQaly:netQaly*i.bayShare,sfQaly:netQaly*i.sfShare};
 });
 const weighted=rows.reduce((a,r)=>{a.netQaly+=r.weight*r.netQaly;a.positiveQaly+=r.weight*Math.max(r.netQaly,0);a.grossResourcesUsd+=r.weight*r.grossResourcesUsd;return a;},{netQaly:0,positiveQaly:0,grossResourcesUsd:0});
 weighted.modeledOrdinaryGiftCostPer10Qaly=weighted.netQaly>0?i.giftUsd*10/weighted.netQaly:null;
 weighted.positiveOnlyModeledGiftCostPer10Qaly=weighted.positiveQaly>0?i.giftUsd*10/weighted.positiveQaly:null;
 weighted.modeledGrossResourceCostPer10Qaly=weighted.netQaly>0?weighted.grossResourcesUsd*10/weighted.netQaly:null;
 const favorableRow=rows.find(r=>r.name==='favorable');
 weighted.favorableTailQalyContribution=favorableRow?favorableRow.weight*favorableRow.netQaly:0;
 weighted.favorableTailShareOfNetQaly=weighted.netQaly===0?null:weighted.favorableTailQalyContribution/weighted.netQaly;
 weighted.bayImpactShare=weighted.netQaly===0?null:i.bayShare;weighted.sfImpactShare=i.sfShare;
 weighted.verifiedMarginalGiftCostPer10Qaly=null;weighted.verifiedMarginalGrossCostPer10Qaly=null;
 return {inputs:i,giftShare,giftLinkedReportedClinicPatients,scenarios:rows,weighted,
  unknownExternalResources:['patient and caregiver time','school and community partner time','outside medical treatment','public or insurance resources induced by an incremental treatment plan'],
  verdict:'PUBLISH AS UNFAVORABLE/UNCERTAIN: direct dental mechanism, but treatment completion and outcome bridge are not measured by Sonrisas.'};
}
