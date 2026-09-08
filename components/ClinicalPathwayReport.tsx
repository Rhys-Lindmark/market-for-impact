import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import respite from '@/data/san-francisco/cfsf-respite-cea-v1.json';
import wound from '@/data/san-francisco/sfccc-wound-cea-v1.json';
import {respiteModel,woundModel} from '@/lib/clinical-pathways-model.mjs';
const money=(n:number|null)=>n===null?'No positive price':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
export default function ClinicalPathwayReport({kind}:{kind:'respite'|'wound'}){
 const isRespite=kind==='respite',data=isRespite?respite:wound,calc=isRespite?respiteModel:woundModel;
 const scenarios=data.scenarios.map(s=>({s,result:calc(s)})),central=scenarios[1],r=central.result,api=isRespite?'/api/sf-respite-model':'/api/sf-wound-model';
 const labels:Record<string,string>={days:'Supported course days',dailyCost:'Donor daily cost judgment',externalQalys:'External incremental QALYs through three months',cost:'Donor full-course cost judgment',ulcerFreeWeeks:'Additional ulcer-free weeks within one year',utilityGap:'Causal utility gap judgment',transfer:'Clinical context transfer',fundingAdditionality:'Additional delivery attributable to financing',harmQalys:'Extra net harm per additional course'};
 const content:CharityReportContent={
 organization:data.organization,program:data.program,eyebrow:'SAN FRANCISCO · CONDITIONAL CLINICAL PATHWAY',published:'7 September 2026',modelVersion:data.version,
 nutshell:{
 headline:isRespite?'Recovering safely after hospital discharge matters; the direct health evidence is weak.':'Sustained wound treatment is a clinical course, not a bag of supplies.',
 body:<>Our provisional best estimate is <strong>{money(r.costPerTenQalys)} per better life:10 additional QALYs</strong>. This is a narrow, highly uncertain health-only model, not the organization’s overall impact or a verified donation offer. <a href={api}>Inspect the assumptions →</a></>,
 whyItMayWork:isRespite?'A clinically appropriate respite place may improve recovery beyond an otherwise unsafe discharge.':'Sustained, appropriate venous-ulcer care may produce more time without an ulcer.',
 whyWeAreCautious:isRespite?'The small external utility difference was not statistically significant; local operational and clinical capacity have different funders.':'The treatment trial improved ulcer-free time but not generic health utility. Local protocol and course delivery are unverified.',
 recommendationBlocker:'Need a named clinically eligible cohort, additional capacity, all payer contributions and measured health difference versus actual usual care.',
 },
 summary:[
 {label:'BEST GUESS',value:money(r.costPerTenQalys),detail:'USD/10 incremental QALYs; conditional donor budget'},
 {label:'POSITIVE SCENARIOS',value:money(scenarios[0].result.costPerTenQalys)+'–'+money(scenarios[2].result.costPerTenQalys),detail:'Joint scenarios, not confidence intervals'},
 {label:'HEALTH EVIDENCE',value:'Null is plausible',detail:'A positive best guess does not rule out no added health'},
 {label:'FUNDING ROOM',value:'Unverified',detail:'Public contracts are not marginal donation offers'},
 ],
 programSection:{
 body:isRespite?'Community Forward SF operates respite facilities in partnership with SFDPH, which supplies clinicians and social workers. Public cost reimbursement may pay fixed operating costs despite unused capacity. Referrals or clinical staffing can be the bottleneck. A gift for amenities cannot claim the entire respite-versus-discharge effect.':'SFCCC’s Street Outreach Services describes mobile healthcare, including wound care. This does not establish a sustained venous-ulcer protocol. The model is for clinically assessed, eligible venous disease—not every wound or swollen leg. Federal health-center funding and other clinical providers must be reconciled.',
 steps:[
 {title:'Verify clinical eligibility',detail:isRespite?'Define an eligible admission offer and actual DPH clinical support, not simply an empty room.':'Diagnosis and vascular assessment precede treatment; inappropriate compression in arterial disease can harm.'},
 {title:'Fund the complete pathway',detail:isRespite?'Identify what additional operations and clinical resources are needed and which funder pays them.':'Budget weekly care while ulcerated plus aftercare and recurrence prevention, rather than borrowing full-course efficacy for twelve contacts.'},
 {title:'Compare actual usual care',detail:'Measure health and harms beyond existing services. Offer-level trial effects already contain uptake; do not multiply another generic completion factor.'},
 ],
 boundary:'Count each patient pathway once. Do not add mortality, housing, substance-use treatment or other overlapping benefits without separate causal models and reconciliation.',
 },
 model:{
 headline:money(r.costPerTenQalys)+' per10 QALYs',
 body:isRespite?'Central cost is53 days ×USD300 =15,900.53 is a judgmental midpoint of the published46–60day stay range, not a measured mean. We retain .0009 external QALY gain through three months, transfer .5 and financing .25, yielding .0001125 QALY. Longer local stays receive no automatic extra health multiplier.':'Central gross donor cost isUSD3,500 for a full-year pathway.5.9 extra ulcer-free weeks /52 ×.05 assumed utility ×.5 transfer ×.5 financing gives .00141827 QALY. The utility bridge is judgmental; the trial did not demonstrate a generic utility advantage.',
 equation:{label:'DOLLARS PER BETTER LIFE',expression:isRespite?'10 ×days ×daily cost / {financing × [external QALYs ×transfer −extra net harm]}':'10 ×course cost / {financing × [ulcer-free weeks /52 ×utility gap ×transfer −extra net harm]}',result:money(r.costPerTenQalys)+' per10 QALYs'},
 inputs:Object.entries(central.s).filter(([,v])=>typeof v==='number').map(([key,v])=>({key,label:labels[key]||key,confidence:['externalQalys','ulcerFreeWeeks'].includes(key)?'External study anchor; not local effect':'Analyst judgment',best:String(v),range:scenarios.map(x=>String(Object.entries(x.s).find(([k])=>k===key)?.[1])).join(' / '),basis:'Range order: favorable / central / pessimistic. No verified local marginal price.'})),
 inputColumnLabel:'Central',
 giftHeading:'Hypothetical course budget—not a verified funding tranche',
 sensitivity:scenarios.map(x=>({case:x.s.name,headline:money(x.result.costPerTenQalys)+' per10 QALYs',detail:x.result.netQalys.toPrecision(4)+' conditional QALY per offered course.'})),
 uncertaintyBoundary:'Zero actual utility benefit, unchanged care or fully replaced financing gives no finite positive price. Net harms can make health negative; this is not a negative-price bargain.',
 fundingBoundary:isRespite?'Daily prices are assumptions, not current quotes or full clinical resource costs. Public DPH clinical inputs remain unpriced. The five-year contract ceiling and mixed-program client counts cannot establish a marginal cost per admission. If clinical staff are unavailable, extra operating spending may add no admissions.':'Constructed course:32 planned contacts ×(.5 RN hour ×USD100 ×1.3 loading +USD30 supplies) +USD460 assessment/aftercare/travel/admin =3,500.32 is a planning proxy, not an observed visit count. The460 allowance needs itemization; volunteer/public resources and failed outreach require verification. No donor quote.',
 },
 evidence:isRespite?[
 {key:'trial',design:'Danish pragmatic trial/economic study',population:'96 participants; first 6 assigned without randomization; two-week offer',result:'Three-month incremental QALY .0016 − .0007 = .0009; nonsignificant, with incomplete questionnaires.',transfer:'Baseline Charlson comorbidity differed between groups, another potential explanation for differences. Utility measured only through three months; six/twelve-month estimates extrapolate. Eligibility required overnight self-care. Payer savings are not donor cash savings.'},
 {key:'local',design:'SF budget analysis',population:'Existing respite partnership',result:'46–60day stays; public clinical staff and fixed-cost reimbursement.',transfer:'Mixed respite/sobering clients and staff-hour counts cannot be relabeled respite admissions or bed-days.'},
 ]:[
 {key:'trial',design:'Morrell1998 randomized clinical bundle',population:'233 eligible patients; mean age about74',result:'5.9 additional ulcer-free weeks over one year; generic EuroQol/SF36 difference absent.',transfer:'Weekly treatment while ulcerated, then stockings/review. Arterial disease excluded. Weeks already incorporate recurrence; no extra recurrence credit.'},
 {key:'utility',design:'Small observational health-state comparison',population:'Healed and nonhealed venous-ulcer respondents',result:'Wong2023 .870 versus.812, p=.39; noncausal and imprecise.',transfer:'The .05 central and .16 favorable utility gaps are judgments, not established causal effects.'},
 ],
 reservations:isRespite?[
 'This health-only ledger omits potential resource savings and dignity benefits rather than pretending they are zero. It is not a verdict on all respite care.',
 'A fourteen-day course is a different dose from the local stay range; it is not used as the favorable same-course budget.',
 'No extra hospital-days-to-QALYs, mortality or medication-treatment benefit is added.',
 ]:[
 'Existing usual care may already deliver effective compression. Clinic location alone is not the active ingredient.',
 'A short twelve-contact pilot cannot inherit the complete one-year package effect without a separate model.',
 'No sepsis, amputation or mortality credit is inferred from generic wound-treatment encounters.',
 ],
 excludedBenefits:['Healthcare savings as donor cash','Unmodeled mortality reduction','Independent housing and substance-use benefits','Unpriced public or volunteered resources'],
 sources:data.sources,
 };
 return <CharityResearchReport content={content}/>;
}
