import CharityResearchReport,{type CharityReportContent} from './CharityResearchReport';
import notes from '@/data/international/calibration-v2-notes.json';
import {calculate,scenarios,data} from '@/lib/harmonized-calibration.mjs';
const money=(n:number|null)=>n===null?'No positive-health ratio':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
export default function CalibratedGlobalReport({id,legacy}:{id:'amf'|'ni';legacy:CharityReportContent}){
 const r=calculate(id),n=notes.organizations[id],p=r.inputs;
 const oldApi=id==='amf'?'/api/amf-model':'/api/new-incentives-model';
 const content:CharityReportContent={
 ...legacy,modelVersion:data.version,
 nutshell:{headline:money(r.usdPer10GlobalQalys)+' per better life globally.',
 body:<>Our conditional best estimate is <strong>{money(r.usdPer10GlobalQalys)} per 10 global QALYs</strong>, or {money(r.usdPer10GlobalQalys/10)} per QALY. {n.sections[0].body} <a href={'/api/harmonized-calibration?org='+id}>Inspect the current model</a>. <a href={oldApi}>Original v1 model and scenarios</a>.</>,
 whyItMayWork:legacy.nutshell.whyItMayWork,whyWeAreCautious:notes.sharedSections[1].body,recommendationBlocker:legacy.nutshell.recommendationBlocker},
 summary:[{label:'Global health',value:money(r.usdPer10GlobalQalys),detail:'per 10 additional QALYs; whole-gift historical-benchmark scenario'},{label:'Bay Area health',value:'0% credited',detail:'No quantified direct local benefit; unknown spillovers are not relabeled global impact.'}],
 model:{headline:money(r.usdPer10GlobalQalys)+' per 10 global QALYs',
 body:n.sections[1].body+' '+notes.sharedSections[0].body,
 equation:{label:'Gift-time incremental health',expression:'Gift × core share ÷ historical dollars per modeled death × relative mortality yield × age-weighted discounted future QALYs − new harms',result:money(p.giftUsd)+' produces '+r.netQalys.toFixed(3)+' modeled global QALYs; full gift ÷ QALYs × 10 = '+money(r.usdPer10GlobalQalys)},
 inputs:[
 {key:'benchmark',label:'Historical cost per modeled life saved',best:money(p.nativeUsdPerModeledDeath),range:'Historical benchmark; relative-yield scenarios 0–2×',confidence:'GiveWell 2022–24 opportunities, not next-gift quote',basis:notes.sharedSections[1].body},
 {key:'core',label:'Share of whole gift assigned to modeled core',best:String(p.coreShare),range:'Central allocation; 100% sensitivity',confidence:'Analyst prior, not overhead rate',basis:n.sections[3].body},
 {key:'age',label:'Early versus older death share',best:'80% / 20%',range:'0–100% early',confidence:'Analyst prior',basis:data.assumptions.age},
 {key:'early',label:'Early-death survival trajectory',best:'40 years; annual survival .99; utility .85',range:'Three-year tail sensitivity',confidence:'Not a fitted national life table',basis:data.assumptions.survival},
 {key:'older',label:'Older-death survival trajectory',best:'20 years; annual survival .98; utility .80',range:'Three-year tail sensitivity',confidence:'Not a fitted national life table',basis:data.assumptions.survival},
 {key:'timing',label:'Years from gift to prevented death',best:'Early: '+p.earlyEventYears.join(', ')+'; older: '+p.olderEventYears.join(', '),range:'Explicit conditional event schedule',confidence:'Analyst timing judgment',basis:n.sections[2].body},
 {key:'discount',label:'Annual health discount rate',best:'3%',range:'Fixed in these scenarios',confidence:'Model convention',basis:'Discount gift-to-event and event-to-health intervals once each; midpoint annual integration.'},
 {key:'harm',label:'New shared and independent harms',best:'0 QALYs',range:'0–0.1 present-value QALYs per specified gift',confidence:'Sensitivity, not measured harm',basis:data.assumptions.harm}],
 giftHeading:'Representative ordinary gift',
 sensitivity:scenarios(id).map(s=>({case:s.scenarioId,headline:money(s.usdPer10GlobalQalys)+' per 10 global QALYs',detail:s.netQalys.toFixed(3)+' net QALYs for the whole '+money(s.inputs.giftUsd)+' gift.'})),
 uncertaintyBoundary:notes.sharedSections[4].body+' '+notes.comparisonNote,
 fundingBoundary:(id==='ni'?'GiveWell’s March 2025 extension funds existing support through March 2028. That funded baseline is not a newly available donation offer. The current model assumes representative historical mortality yield for an ordinary gift; current marginal funding room is unverified.':legacy.model.fundingBoundary)+' '+notes.sharedSections[3].body},
 evidence:legacy.evidence.map(e=>({...e,transfer:'Historical intervention evidence and context, not another numerical multiplier on the already adjusted mortality benchmark. '+(id==='ni'?'Enrollment, additional vaccination and death-age denominators must remain distinct.':'Modern campaign mix and adult/child effects remain uncertain.')})),
 reservations:[notes.sharedSections[1].body,notes.sharedSections[2].body,notes.sharedSections[3].body,n.sections[2].body],
 excludedBenefits:['No additional morbidity, income or education multiplier is added to this mortality calibration.','No direct SF/Bay health is credited; unknown indirect effects are not assumed impossible.'],
 sources:[...legacy.sources,...notes.sources.map(s=>({publisher:'GiveWell',title:s.title,url:s.url,published:'Mixed-vintage technical analysis; see linked source and model',retrieved:'8 September 2026',sourceType:'Primary evaluator analysis; independent QALY conversion'}))]
 };
 return <CharityResearchReport content={content}/>;
}
