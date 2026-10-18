import {impactNode} from '@/components/ImpactMetric';
/* eslint-disable @next/next/no-html-link-for-pages -- Native anchors preserve canonical base-path navigation. */
import type {Metadata} from 'next';
import priorities from '@/data/bay/donor-priorities.json';
import progress from '@/docs/geography-progress.json';
import {unifiedResearch} from '@/lib/unified-research-index';
import {expandedGeographyResearch} from '@/lib/expanded-geography-research';
import {publishedEditionReports as editionReports} from '@/lib/published-geography-reports';
import {reportPrice,scenarioIncomeEquivalent,editionReportPath} from '@/lib/geography-reports.mjs';
import {featuredReports} from '@/lib/edition-featured.mjs';
import {canonicalBase,editionIds,editionPath} from '@/lib/geography-editions.mjs';
import {formatImpactPrice,impactMetric} from '@/lib/impact-metric.mjs';
import '../../givebetter.css';
import './city-theory.css';

// Every count and price below is computed from the published research data, so
// the synthesis cannot drift from the reports it summarizes. The prose is dated.
const unit=impactMetric().label;
const price=(p:number|null|undefined)=>p===null||p===undefined?'not estimated':formatImpactPrice(p)+' per '+unit;
const median=(xs:number[])=>{const s=[...xs].sort((a,b)=>a-b);return s.length?s[Math.floor((s.length-1)/2)]:null;};
const label=(id:string)=>progress.editions.find(e=>e.id===id)?.label??id;
const finite=(x:number|null|undefined):x is number=>typeof x==='number'&&Number.isFinite(x);
const total=editionReports.length+unifiedResearch.length+expandedGeographyResearch.length;

const editions=editionIds.map(id=>{
 const rs=editionReports.filter(r=>r.edition===id),priced=rs.map(reportPrice).filter(finite).sort((a,b)=>a-b);
 return {id,label:label(id),href:canonicalBase+editionPath(id),reports:rs.length,deep:rs.filter(r=>r.stage==='beta').length,lowest:priced[0]??null,median:median(priced),featured:featuredReports(editionReports,id) as typeof editionReports};
}).filter(e=>e.reports>0);
const fullEditions=editions.filter(e=>e.featured.length>0),earlyEditions=editions.filter(e=>e.featured.length===0);

type Example={name:string;href:string;price:number|null;where:string};
function ed(edition:string,slug:string):Example{const r=editionReports.find(x=>x.edition===edition&&x.slug===slug);if(!r)throw Error('Missing report '+edition+'/'+slug);return {name:r.organization,href:canonicalBase+editionReportPath(r),price:reportPrice(r),where:label(edition)};}
function bay(org:string):Example{const r=unifiedResearch.find(x=>x.organization===org);if(!r)throw Error('Missing Bay report '+org);return {name:r.organization,href:r.href,price:r.localUsdPerTenQalys,where:'SF Bay'};}
function archive(org:string):Example{const r=expandedGeographyResearch.find(x=>x.organization===org);if(!r)throw Error('Missing archive report '+org);return {name:r.organization,href:r.href,price:r.overallPrice??null,where:r.geography};}
const exampleList=(xs:Example[])=>xs.map((x,i)=><span key={x.href}>{i>0?'; ':''}<a href={x.href}>{x.name}</a> ({x.where}, {price(x.price)})</span>);

const promising=[
 {id:'donated-care',title:'Coordinating donated clinical care',body:'In several editions, some of the lowest estimates come from organizations that match uninsured patients with surgeons, dentists or equipment that would otherwise go unused. The charity pays for coordination; clinicians and hospitals donate the expensive part. The catch is that donated time is still a real cost, and a gift only helps if more volunteers, operating-room slots or devices are actually available.',examples:[ed('california','operation-access'),ed('usa','surgery-on-sunday'),ed('usa','dental-lifeline-network'),bay('The ReCARES Network')]},
 {id:'free-clinics',title:'Free clinics for uninsured adults',body:'Small free clinics recur near the top in Chicago, Denver, Houston, Los Angeles and New York. They treat people with few alternatives at low cost per visit. The main uncertainty is the counterfactual: where Medicaid or a community health center would have served the same patient, the clinic adds less than its visit count suggests.',examples:[ed('chicago','old-irving-park-community-clinic'),ed('chicago','tri-city-health-partnership'),ed('los-angeles','lestonnac-free-clinic'),ed('new-york-city','parker-family-health-center'),ed('denver','doctors-care')]},
 {id:'harm-reduction',title:'Harm reduction and naloxone',body:'Harm-reduction programs rank among the cheapest local estimates in most cities we studied. Overdose is common, often fatal and cheaply reversible. Our estimates count unique people and finite survival rather than treating every reversal as a lifetime saved, a correction that first changed our HEPPAC report and now applies everywhere.',examples:[ed('denver','harm-reduction-action-center'),ed('chicago','chicago-recovery-alliance'),ed('california','harm-reduction-services'),ed('seattle','peoples-harm-reduction-alliance'),bay('HOPE Pacifica')]},
 {id:'sensory',title:'Vision and hearing access',body:'Glasses and hearing aids are cheap relative to the years of better function they can provide. The questions are whether the device fits, whether people keep using it, and whether they would have obtained one anyway.',examples:[ed('california','vision-to-learn'),ed('usa','help-america-hear'),bay('Hearing and Speech Center of Northern California')]},
 {id:'policy',title:'National policy research',body:'The lowest numbers in the whole library are national policy organizations. They are also the most assumption-dependent: a small change in the assumed chance of influencing a rule moves the estimate by orders of magnitude. Treat them as high-variance bets, not safer choices.',examples:[ed('usa','institute-for-progress'),ed('usa','center-for-science-in-the-public-interest')]},
];
const expensive=[ed('chicago','chicago-cred'),ed('california','youth-alive'),ed('new-york-city','common-justice'),ed('houston','allies-in-hope'),ed('los-angeles','illumination-foundation'),ed('denver','tennyson-center'),ed('boston','community-servings'),ed('new-york-city','we-act-for-environmental-justice')];

// Initial (alpha) estimates are retained inside in-depth reports under these scenario ids.
const originalIds=['historical-alpha-central','alpha-central-diagnostic','alpha-reproduced','alpha-diagnostic','alpha-retained-diagnostic','alpha-reference'];
const shifts=editionReports.filter(r=>r.stage==='beta').flatMap(r=>{
 const o=r.model.scenarios.find(s=>originalIds.includes(s.id));if(!o||!finite(o.costUSD)||!(o.costUSD>0))return [];
 const benefit=(o.editionQalys??0)+(scenarioIncomeEquivalent(o)??0);if(!(benefit>0))return [];
 return [{r,before:10*o.costUSD/benefit,after:reportPrice(r)}];
});
const worse=shifts.filter(s=>finite(s.after)&&s.after>s.before),better=shifts.filter(s=>finite(s.after)&&s.after<=s.before),withdrawn=shifts.filter(s=>!finite(s.after));
const shiftRatio=median(worse.concat(better).map(s=>(s.after as number)/s.before));
const biggestRises=[...worse].sort((a,b)=>(b.after as number)/b.before-(a.after as number)/a.before).slice(0,3);
const incomes=editionReports.map(r=>{const c=r.model.scenarios.find(s=>s.id==='central');return c?scenarioIncomeEquivalent(c):null;}).filter((x):x is number=>finite(x)&&x!==0);
const negativeIncome=incomes.filter(x=>x<0).length;

const byOrganization=new Map<string,typeof editionReports>();
for(const r of editionReports)byOrganization.set(r.organization,[...(byOrganization.get(r.organization)??[]),r]);
const repeated=[...byOrganization.entries()].filter(([,rs])=>new Set(rs.map(r=>r.edition)).size>1);

const domestic=[...editionReports.map(r=>({name:r.organization,price:reportPrice(r)})),...unifiedResearch.map(r=>({name:r.organization,price:r.localUsdPerTenQalys})),...expandedGeographyResearch.filter(r=>r.geography!=='International').map(r=>({name:r.organization,price:r.overallPrice??null}))];
const threshold=100000;
const underThreshold=domestic.filter(d=>finite(d.price)&&d.price<threshold);
const bestCurrentLocal=Math.min(...editionReports.map(reportPrice).filter(finite),...unifiedResearch.map(r=>r.localUsdPerTenQalys).filter(finite));
const amf=archive('Against Malaria Foundation'),newIncentives=archive('New Incentives');
const gap=finite(amf.price)?Math.round(bestCurrentLocal/amf.price/10)*10:null;

export const metadata:Metadata={title:`What we learned from ${total} reports — GiveBetter`,description:'Patterns across every GiveBetter edition: what tends to be cost-effective locally, how deeper research changed our estimates, and our San Francisco giving priorities.'};
export default function CityTheory(){return impactNode(<div className="givebetter">
<header className="givebetter-masthead"><a href={canonicalBase+'/all'}>Give<span>Better</span></a></header>
<main className="donor-synthesis"><aside aria-label="Table of contents"><h2>Contents</h2><a href="#summary">Summary</a><a href="#editions">Where we looked</a><a href="#mechanisms">What keeps looking promising</a><a href="#expensive">What usually looks expensive</a><a href="#deeper">What deeper research changed</a><a href="#geography">Geography changes the answer</a><a href="#global">The global gap</a><a href="#priorities">San Francisco priorities</a><a href="#method">Method and limits</a></aside>
<article><h1>What we learned from {total} reports</h1><p className="donor-reviewed">Research synthesis · 18 October 2026</p>
<section id="summary"><h2>Summary</h2>
<p>We have published {total} reports: {editionReports.length} across {editions.length} city, state and national editions, {unifiedResearch.length} in the San Francisco Bay Area, and {expandedGeographyResearch.length} earlier national and international comparisons. Five lessons hold across all of them.</p>
<ol>
<li><strong>The cheapest local opportunities remove a specific barrier to care that already exists.</strong> Coordinating donated surgery and dentistry, free clinics for uninsured adults, harm reduction and naloxone, and vision and hearing access lead in city after city.</li>
<li><strong>Looking harder usually makes an estimate worse.</strong> When an initial estimate went through an in-depth review, the price rose in {worse.length} of {shifts.length} cases, typically by about {shiftRatio?shiftRatio.toFixed(1):'—'}×, and {withdrawn.length} lost their estimate entirely.</li>
<li><strong>Where you draw the boundary changes the answer.</strong> The same organization can differ several-fold between editions, depending on how much of its work reaches the people in that edition.</li>
<li><strong>No local report comes close to the best global health charities.</strong> Our best current local estimate is roughly {gap??'—'} times the cost of the Against Malaria Foundation estimate.</li>
<li><strong>We have not found a verified marginal-gift offer anywhere.</strong> Every price is a conditional research estimate. Before a larger gift, a donor still needs to confirm what an extra dollar would add.</li>
</ol></section>

<section id="editions"><h2>Where we looked</h2><p>Each edition began with about 100 candidate organizations, published 25 initial reports, took ten into in-depth review and named four featured opportunities. “Lowest” and “median” are current central estimates; they are not rankings of recommendation strength.</p>
<div className="synthesis-table-wrap"><table className="synthesis-table"><thead><tr><th scope="col">Edition</th><th scope="col">Reports (in-depth)</th><th scope="col">Lowest</th><th scope="col">Median</th><th scope="col">Featured four</th></tr></thead><tbody>
{fullEditions.map(e=><tr key={e.id}><th scope="row"><a href={e.href}>{e.label}</a></th><td data-label="Reports (in-depth)">{e.reports} ({e.deep})</td><td data-label="Lowest">{price(e.lowest)}</td><td data-label="Median">{price(e.median)}</td><td data-label="Featured four">{e.featured.map((r,i)=><span key={r.slug}>{i>0?', ':''}<a href={canonicalBase+editionReportPath(r)}>{r.organization}</a></span>)}</td></tr>)}
<tr><th scope="row"><a href="/san-francisco">San Francisco Bay</a></th><td data-label="Reports">{unifiedResearch.length}</td><td data-label="Lowest">{price(Math.min(...unifiedResearch.map(r=>r.localUsdPerTenQalys).filter(finite)))}</td><td data-label="Median">{price(median(unifiedResearch.map(r=>r.localUsdPerTenQalys).filter(finite)))}</td><td data-label="Featured">See <a href="#priorities">ten priorities</a> below</td></tr>
</tbody></table></div>
<p>Early reports also exist for {earlyEditions.map((e,i)=><span key={e.id}>{i>0?(i===earlyEditions.length-1?' and ':', '):''}<a href={e.href}>{e.label}</a></span>)}; those editions have no in-depth reviews yet.</p></section>

<section id="mechanisms"><h2>What keeps looking promising</h2><p>The same few mechanisms surface in every city. None is proven best; each has a known way of failing that a donor should check.</p>
{promising.map(m=><section key={m.id} className="synthesis-pattern"><h3>{m.title}</h3><p>{m.body}</p><p className="synthesis-examples">Examples: {exampleList(m.examples)}</p></section>)}</section>

<section id="expensive"><h2>What usually looks expensive</h2><p>Violence intervention, supportive and HIV housing, residential children’s services, medically tailored meals and local environmental-justice organizing tend to sit at the costly end in every edition. Examples: {exampleList(expensive)}.</p><p>That is not a verdict that this work is low-value. It costs more per person served, its health effects are harder to attribute, and much of its value (safety, rights, dignity, community power) falls outside the health-and-income measure we use. A donor who values those outcomes directly should read these reports as partial estimates.</p></section>

<section id="deeper"><h2>What deeper research changed</h2><p>In-depth reviews keep the initial estimate for comparison. Of {shifts.length} reviews where both exist, {worse.length} raised the price, {better.length} lowered it and {withdrawn.length} withdrew it. The largest rises: {biggestRises.map((s,i)=><span key={s.r.slug}>{i>0?'; ':''}<a href={canonicalBase+editionReportPath(s.r)}>{s.r.organization}</a> ({price(s.before)} to {price(s.after)})</span>)}.</p><p>The usual causes were the same everywhere: counting unique people instead of contacts, using finite effect durations, assigning the whole organization’s cost rather than its most favorable program, and crediting only care that would not have happened anyway. The lesson for comparing reports: an initial estimate is an optimistic first look. An organization that has not had an in-depth review should not outrank one that has merely because its number is lower.</p><p>Income cuts both ways. Of {incomes.length} reports with a nonzero household-resources estimate, {negativeIncome} found a net loss from fees, time, travel or lost benefits. We keep those losses instead of setting them to zero.</p></section>

<section id="geography"><h2>Geography changes the answer</h2><p>{repeated.length} organizations appear in more than one edition. Their estimates differ because each edition credits only the benefits that reach its own residents, and because the cost scope can differ:</p><ul>{repeated.map(([name,rs])=><li key={name}><strong>{name}:</strong> {rs.map((r,i)=><span key={r.edition}>{i>0?' · ':''}<a href={canonicalBase+editionReportPath(r)}>{label(r.edition)}</a> {price(reportPrice(r))}</span>)}</li>)}</ul><p>Compare organizations within an edition, not across editions, unless the reports use the same boundary.</p></section>

<section id="global"><h2>The global gap</h2><p>The <a href={amf.href}>Against Malaria Foundation</a> estimate is {price(amf.price)} and <a href={newIncentives.href}>New Incentives</a> is {price(newIncentives.price)}. Our best current local estimate is {price(bestCurrentLocal)}. The models differ, but the gap is too large for those differences to close.</p><p>Only {underThreshold.length} of {domestic.length} U.S. reports fall under our {price(threshold)} screening hypothesis ({underThreshold.map(d=>d.name).join(', ')}), and those are older whole-gift estimates. A donor who cares only about health per dollar should give globally. Our local editions answer a different question: if you want to give where you live, where does a dollar go furthest?</p></section>

<section id="priorities"><h2>San Francisco: ten giving priorities</h2><p>Our Bay Area work came first and is the most developed. Our first places to investigate are ReCARES, Project Homeless Connect and Pacific Hearing Connection; Pacific Vision Foundation is a fourth lead. <a href="/charities/glide">GLIDE’s housing-prevention model</a> shows why housing and policy stay in scope even when their health estimates are less certain.</p><p>Editorial order, not numerical rank. None has a verified marginal health offer in the reviewed public evidence. The questions below are for a prospective donor; we have not contacted these organizations.</p>
{priorities.map((item,i)=>{const row=unifiedResearch.find(r=>r.href==='/charities/'+item.slug);if(!row)throw new Error('Missing donor report '+item.slug);return impactNode(<section className="donor-priority" id={item.slug} key={item.slug}><h3>{i+1}. <a href={row.href}>{row.organization}</a></h3><p><strong>Gift scope:</strong> {item.scope}</p><p>{item.fundingEvidence}</p><details><summary>What to confirm before a larger gift</summary><ul>{item.donorQuestions.map(q=><li key={q}>{q}</li>)}</ul><p>Primary sources, reviewed 11 September 2026: {item.sourceURLs.map((url,n)=><span key={url}>{n>0?' · ':''}<a href={url}>Source {n+1}</a></span>)}</p></details></section>)})}</section>

<section id="method"><h2>Method and limits</h2><p>Each estimate divides the reviewed cost by modeled health gains plus signed household-resource changes for residents of that edition. Reports share clinical evidence and assumptions, so {total} reports are not {total} independent experiments. Initial reports are single-pass; in-depth reviews were independently checked.</p><p>Public donation pages, waitlists and reserves do not prove a funding gap. A useful next step is a dated, accepted gift purpose with full delivery costs, available capacity and the expected additional care. No organization is required to guarantee outcomes.</p><p>Each linked report keeps its sources, dates, model and uncertainties. The <a href="/api/sf-city-theory">original 25-program San Francisco ledger</a> is historical evidence, not a current recommendation list. <a href={canonicalBase+'/all'}>Read all research</a> or <a href="/archive/expanded-geography-research">browse the earlier national and international reports</a>.</p></section>
</article></main></div>);}
