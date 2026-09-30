import type {Metadata} from 'next';
import {canonicalBase} from '@/lib/geography-editions.mjs';
import {incomeHealthyYearEquivalent} from '@/lib/income-health-equivalence.mjs';
import {EditionMasthead} from '@/components/GeographyEdition';
import '@/app/givebetter.css';
import '@/app/report-reading.css';

export const metadata:Metadata={title:'Comparing health and income — GiveBetter',description:'How GiveBetter keeps health estimates and income-equivalent benefits distinct.',alternates:{canonical:canonicalBase+'/methodology/income'}};

export default function IncomeMethodology(){
 const benchmark=incomeHealthyYearEquivalent({people:200,annualIncomeBeforeUSD:50000,annualIncomeGainUSD:500,years:1});
 return <main className="givebetter charity-report"><EditionMasthead/><div className="report-reading-column"><header className="report-heading"><h1>Comparing health and income</h1></header><article>
  <p>Our main “$ per better life” metric is dollars per ten additional quality-adjusted life years (QALYs), or an explicitly labeled DALY-based health estimate. We do not assume that a DALY averted is automatically identical to a QALY gained.</p>
  <p>Income can also improve wellbeing. Following <a href="https://coefficientgiving.org/research/cost-effectiveness/">Coefficient Giving’s cost-effectiveness framework</a>, we can express an income change as a <em>healthy-year welfare equivalent</em> for comparison—not as a measured health outcome. Their reference values treat a year of healthy life as 100,000 Coefficient Giving dollars ($CG), and value a proportional income change logarithmically relative to $50,000 annual reference income.</p>
  <p className="report-equation">Income-equivalent healthy years = ($50,000 × people × years × ln(1 + annual income gain ÷ baseline annual income) × causal share × local share × non-overlap share) ÷ $CG 100,000.</p>
  <p>For scale, a 1% income increase for 200 people for one year is approximately {benchmark.toFixed(2)} healthy-year equivalent. About 2,000 such person-years would be comparable to ten healthy years under these chosen values—not ten observed QALYs or DALYs.</p>
  <p>We retain health-only prices as the headline. A report may show a separate income-adjusted comparison only when it identifies the affected people, actual income baseline and gain, duration, causal counterfactual, geographic share, overlap with already-counted health effects and source evidence. Housing cost changes, displacement and public-resource costs also matter. We do not silently add speculative wages to health estimates or retroactively change rankings where those inputs are missing.</p>
  <p>These are contestable welfare weights, not a universal exchange rate. <a href="https://coefficientgiving.org/research/cost-effectiveness/">Read Coefficient Giving’s method and limitations.</a></p>
 </article><footer className="report-footer"><a href={canonicalBase+'/all'}>All editions</a></footer></div></main>;
}
