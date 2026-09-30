import type {Metadata} from 'next';
import {EditionMasthead} from '@/components/GeographyEdition';
import {canonicalBase} from '@/lib/geography-editions.mjs';
import {earningsResearchLanes,earningsResearchUpdated,earningsScreen} from '@/lib/better-paying-jobs.mjs';
import {incomeHealthyYearEquivalent} from '@/lib/income-health-equivalence.mjs';
import '@/app/givebetter.css';
import '@/app/report-reading.css';

export const metadata:Metadata={title:'Better-paying jobs — GiveBetter Research',description:'Evidence and research priorities for improving earnings in the Bay Area, California, NYC and USA.',alternates:{canonical:canonicalBase+'/research/better-paying-jobs'}};
const money=(x:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(x);
export default function EarningsResearchPage(){
 return <main className="givebetter charity-report"><EditionMasthead/><div className="report-reading-column">
  <header className="report-heading"><h1>Better-paying jobs</h1><p>Higher earnings can improve lives even when a program’s health effects are hard to measure.</p><small>Research synthesis · Updated {earningsResearchUpdated}</small></header>
  <article>
   <p>We are investigating two routes: helping people qualify for better-paid work, and removing housing barriers that keep them away from productive labor markets. This is a source-backed discovery brief, not four new organization reviews. The candidates below do not change the shortlist or report counts.</p>
   <nav aria-label="Earnings research locations">{earningsResearchLanes.map((lane,i)=><span key={lane.id}>{i>0?' · ':''}<a href={'#'+lane.id}>{lane.label}</a></span>)}</nav>
   <h2>What the evidence says</h2>
   <p><strong>Sector training can raise earnings—but the provider and period matter.</strong> MDRC’s randomized WorkAdvance evaluation found a 32% average earnings increase at St. Nicks Alliance in Year 10; the other three sites did not show effects on that year’s confirmatory outcomes. Per Scholas had gains in earlier years. We should model the observed trajectory rather than extrapolate one successful year indefinitely. <a href="https://www.mdrc.org/work/publications/effects-sector-focused-training-after-10-years">MDRC’s ten-year findings</a>.</p>
   <p><strong>Year Up has unusually strong long-run evidence.</strong> Its federally sponsored evaluation reports a $1,895 quarterly earnings difference in quarters 23–24, approximately 28% above the comparison group. That is a historical trial result, not a current marginal donation estimate. Before applying it, reconcile the current program, participant mix, delivery costs and earnings definition. <a href="https://acf.gov/sites/default/files/documents/opre/year%20up%20long-term%20impact%20report_apr2022.pdf">Evaluation report</a> · <a href="https://www.yearup.org/research">Current research library</a>.</p>
   <p><strong>Housing reform is a jobs intervention too.</strong> Duranton and Puga model how loosening planning restrictions in productive cities can let more people move into higher-opportunity labor markets. Their counterfactual includes New York, the SF/Oakland/San Jose region and several California cities. It predicts gains from relocation, but is not an experiment or an estimate of one nonprofit’s contribution. Wages, rents, commuting and incumbent losses all matter. <a href="https://diegopuga.org/papers/Duranton_Puga_ECMA_2023.pdf">Urban Growth and Its Aggregate Implications</a>.</p>
   <h2>What do you get for your dollar?</h2>
   <p>For training, the relevant output is an additional supported training place that leads to higher <em>net household income compared with what would otherwise happen</em>. Gross graduate wages, credentials and placements alone do not establish that gain. Include training-time earnings losses, taxes, lost benefits, childcare and commuting costs. Employer and public contributions must be disclosed alongside donor costs.</p>
   <p>For housing policy, trace the chain from additional advocacy to changed rules, additional completed homes, access to jobs and net income. Discount for reforms that would happen anyway. Legal capacity is not completed housing, and national GDP growth is not a donation’s household-income effect.</p>
   <h3>A screening calculation—not a charity estimate</h3>
   <p>Suppose $1M supports 100 additional trainees whose counterfactual disposable income is $25,000 a year. Assume the income gain is net of the costs above, 80% of benefits occur in the edition, and the remaining transfer/additionality multiplier is applied once. Under our <a href={canonicalBase+'/methodology/income'}>Coefficient Giving-based comparison</a>, the following assumptions yield:</p>
   <ul>{earningsScreen.scenarios.map(s=>{
    const equivalent=incomeHealthyYearEquivalent({...earningsScreen,...s});
    return <li key={s.id}><strong>{s.label}:</strong> {money(s.annualIncomeGainUSD)} annual gain for {s.years} years, with a {s.causalShare*100}% transfer/additionality multiplier: {equivalent.toFixed(1)} income-equivalent healthy years, or {money(10*earningsScreen.costUSD/equivalent)} per better life on this income-only comparison.</li>;
   })}</ul>
   <p>These inputs are judgments for screening, not values established for any candidate. Zero additional earnings means zero credited income benefit. Income loss is harmful, not a positive cost-effectiveness ratio. The actual model should use yearly earnings changes and a consistent price base, not assume a flat gain.</p>
   <p>Our main list retains <strong>$ per better life: 10 QALYs or an explicitly labeled DALY-based estimate</strong>. Income-equivalent healthy years are a welfare comparison, not measured QALYs or DALYs. They can appear separately alongside health, with overlap removed; they do not silently change health-only rankings.</p>
   {earningsResearchLanes.map(lane=><section id={lane.id} key={lane.id}>
    <h2>{lane.label}: research priorities</h2><p>{lane.focus}</p>
    <ul>{lane.candidates.map(candidate=><li key={candidate.name}><strong><a href={candidate.url}>{candidate.name}</a>:</strong> {candidate.mechanism}</li>)}</ul>
    <p>{lane.next}</p><p><a href={canonicalBase+'/'+lane.id+'/all'}>All {lane.label} research</a></p>
   </section>)}
   <h2>Next evidence to collect</h2>
   <ul><li>A current marginal budget and a documented use for additional funding.</li><li>Administrative earnings follow-up against a credible counterfactual, including all enrolled participants—not just successful graduates.</li><li>Benefit duration, local resident share and transfer from evaluated cohorts to today’s labor market.</li><li>Net household gains, displacement of other workers and overlap with already-counted health or housing benefits.</li></ul>
  </article><footer className="report-footer"><a href={canonicalBase+'/methodology/income'}>Health and income method</a> · <a href={canonicalBase+'/all'}>All editions</a></footer>
 </div></main>;
}
