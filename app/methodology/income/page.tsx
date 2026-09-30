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
  <p>Our main “$ per better life” metric is dollars per ten healthy-year welfare equivalents: modeled health QALYs plus attributable income benefits converted using the framework below. A DALY-based health estimate must be explicitly labeled; we do not assume that a DALY averted is automatically identical to a QALY gained. Income equivalents are not observed health improvements.</p>
  <p>Income can also improve wellbeing. Following <a href="https://coefficientgiving.org/research/cost-effectiveness/">Coefficient Giving’s cost-effectiveness framework</a>, we can express an income change as a <em>healthy-year welfare equivalent</em> for comparison—not as a measured health outcome. Their reference values treat a year of healthy life as 100,000 Coefficient Giving dollars ($CG), and value a proportional income change logarithmically relative to $50,000 annual reference income.</p>
  <p className="report-equation">Income-equivalent healthy years = ($50,000 × people × years × ln(1 + annual income gain ÷ baseline annual income) × causal share × local share × non-overlap share) ÷ $CG 100,000.</p>
  <p>For scale, a 1% income increase for 200 people for one year is approximately {benchmark.toFixed(2)} healthy-year equivalent. About 2,000 such person-years would be comparable to ten healthy years under these chosen values—not ten observed QALYs or DALYs.</p>
  <p>Income is part of the headline estimate, not an optional extra. Each revised report must identify affected people, baseline income, net gain, duration, causal counterfactual, geographic share and overlap with health effects. Sourced facts and judgment-based scenarios are labeled separately. We discount each annual income flow for its realization delay. Resource savings must account for implementation costs, transfers and who receives the benefit; GDP, company revenue and gross wages are not automatically net household welfare. Housing costs, displacement and public-resource costs also matter.</p>
  <p>Reports show separate health and income components and keep a health-only diagnostic. A zero-income scenario tests failure or no independent economic effect; it does not imply that missing evidence proves zero value. Older reports without income models retain their existing estimates while awaiting the recalibration pass. We do not invent economic benefits just to achieve a preferred ranking.</p>
  <p>These are contestable welfare weights, not a universal exchange rate. <a href="https://coefficientgiving.org/research/cost-effectiveness/">Read Coefficient Giving’s method and limitations.</a></p>
 </article><footer className="report-footer"><a href={canonicalBase+'/all'}>All editions</a></footer></div></main>;
}
