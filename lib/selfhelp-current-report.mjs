import {version,calculate,defaults} from './selfhelp-current-model.mjs';
export const modelVersion=version;
export const currentResult=calculate(defaults);
export const summary={
 intro:'Self-Help for the Elderly provides health, social and practical support to older adults. Its activity centers offer free six-week Tai Chi for Arthritis and Fall Prevention classes. We investigate a longer, trial-matched therapeutic course for older adults at high risk of falling, distinct from that existing service.',
 reasons:['Balance training offers a concrete route to reducing falls and improving daily wellbeing.','A randomized trial and economic evaluation provide a health-outcome benchmark for a specifically matched curriculum.','The organization’s local centers and language-access services offer a potential delivery route worth investigating.'],
 reservations:['The current six-week Sun-style service is not the 24-week therapeutic curriculum evaluated in the main trial.','The $600 fully supported course cost, local clinical transfer and additional places are assumptions, not a funding offer.','Participation burdens and uncertain household savings or earnings can materially change the estimate.'],
 cost:'Our conditional estimate is about $643K per better life for a prospective trial-matched course serving San Francisco residents: ten combined health and income-equivalent years. A $600 supported-course allowance buys a modeled place, not a verified donation purchase. Finite health gains drive the estimate; incremental travel and time costs reduce household welfare. This is a course hypothesis, not the expected value of an ordinary donation to the organization.'
};
export const markdown=`## Summary
The summary distinguishes the promising intervention from current local delivery.

## What they do
Self-Help for the Elderly, EIN 94-1750717, provides health, activity, social and practical services for older adults. Current classes are free, six-week simplified Sun-style Tai Chi for Arthritis and Fall Prevention. Our prospective 24-week therapeutic TJQMBB course is a different intervention, not a description of current delivery.

The organization also provides benefits counseling, nutrition, home support and other services. Those pathways may affect health or household resources, but they are not automatically benefits of a tai chi donation. Recipient residence must be distinguished from the location of a center.

## Monitoring and information sharing
The organization publishes program reports and a tax return. These establish services and organizational scale, not the effect or marginal capacity of a future therapeutic course. Useful course monitoring would record eligibility, offered places, curriculum fidelity, actual attendance, realistic alternative exercise, health utility, falls, incremental travel, caregiving, fees and lost work.

Household tracking should identify unique recipients before combining exercise, benefits counseling and home services. One household per offered participant is a model hypothesis; overlapping recipients need a pooled ledger, not duplicated income credits.

## Clinical evidence and native outcomes
The economic evaluation followed 670 high-risk adults aged 70 or older over a 24-week TJQMBB-versus-stretching trial. Its methods duration-weight utility to QALYs; the table reports .50 versus .46, a .04 increment. Prose also calls .04 a utility difference. We use the integrated-QALY reading as the strongest internal interpretation, while retaining the ambiguity and original endpoint calculation.

The .04 is counted once, without another half-year/onset multiplier. Intention-to-treat already incorporates trial nonattendance, so no extra attendance discount is applied. We assume 50% positive clinical transfer locally and discount the benefit at a quarter-year midpoint. These local factors are judgments, not trial findings. Negative clinical effects retain full magnitude. No separate injury or survival benefits are added on top of utility.

The paper’s delivery costs were $847 before travel and $906 with travel, excluding research/development. Our $600 provider allowance is a distinct planning prior, not a paper-derived figure or local quote. Instructors, licensing, space, recruitment, translation and evaluation would all need to fit that fully supported budget. Current six-week Sun-style delivery does not establish trial fidelity.

## What do you get for your dollar?
Our course hypothesis supports a place in a specified therapeutic program, rather than an unspecified institutional service. At $600 per offered place and 50% additionality, $1,200 of modeled donor spending causes one additional course-equivalent. Actual added places and costs remain to be established.

| Conditional prospective course, per $100,000 appendix normalization | SF residents | Bay Area, including SF |
| --- | --- | --- |
| Additional course-equivalents | 83.33 | 83.33 |
| Modeled health QALYs | +1.654396 | +1.654396 |
| Net income/consumption-equivalent years | −0.100241 | −0.100241 |
| Combined healthy-year equivalents | +1.554155 | +1.554155 |
| Dollars per better life | $643,436 | $643,436 |

The identical regional figures describe a prospective SF-resident cohort wholly inside the Bay Area, not the residence mix of the organization’s actual beneficiaries. A better life means ten combined healthy-year equivalents; income-equivalent years are a normative welfare comparison, not clinical QALYs. The API retains alternate residence shares, zero additional services, harms, delayed delivery and cost stresses.

The whole donor budget stays in the numerator. A separate annual-work case uses 10% of FY2025 expenses for hypothetical courses and the full expense numerator, producing about $6.43M per better life for the assessed pathway. The remaining 90% has unknown impact, not zero. That annual allocation is neither observed 2025 impact nor ordinary-donation expected value. Complete ordinary-donation EV, scenario-weighted EV and full social-resource costs remain unidentified.

## Health and net household resources
The reference assumes one person in a household with $40,000 annual disposable resources and a half-year participation period. It credits no unmeasured positive medical savings, wages or transfers. This exclusion does not establish that those pathways are zero. Signed sensitivities separately test $150 of out-of-pocket savings and $500 of additional net take-home pay.

Incremental travel/care costs are assumed at $48 and incremental time at 12 hours valued at $4 per hour. These must be additional burdens versus realistic alternative exercise, not all trial hours or gross travel. Time is a welfare proxy, not cash expenditure; lost paid earnings cannot also be counted as that same time burden. Reference net cash is −$48 per offered household and time-inclusive resources are −$96.

Signed rows are netted within the same household before the logarithmic mapping. Positive rows receive a 75% independent-credit allowance first; negative costs remain full. This is a conservative normative overlap rule, not an observed reduction in household cash. Equal positive and negative cash nets to zero at full positive credit; a reduced positive credit deliberately produces a negative credited subtotal.

We annualize the half-year −$96 flow once, then integrate over that half-year: 0.5 × 0.5 × ln(1 + (−96 / 0.5) / 40,000) = −0.001203 income-equivalent years per offered course. The first 0.5 is our documented Coefficient Giving-inspired coefficient; the second is duration. Service additionality scales both course-caused gains and costs. Independent gift harms survive zero additional courses. Future earnings, caregiver health and insurer savings are not silently credited to this household.

## Qualitative assessment
Balance training is a promising, intelligible health pathway, especially for people whose prior falls or mobility impairment place them at elevated risk. Language access and local centers may help reach that population. These advantages warrant exploring a specific delivery proposal, not assuming every exercise class shares the trial effect.

The independently reconstructed model accepts a finite conditional calculation, not measured local efficacy or funding capacity. Low transfer, high participation burdens or adverse clinical effects can eliminate positive benefit. Positive savings scenarios are not substituted for the reference or assigned empirical probabilities. No scenario range is presented as a confidence interval.

## Funding and previous grants
A January–March 2026 CalFresh Healthy Living closeout document lists $96,673 plus $9,667 contingency for mixed activities and wind-down. It is expired, not an October funding gap, course quote or absorption commitment. Current institutional revenue and net assets likewise do not establish what the next donation funds.

The 2024–25 program report describes HICAP counseling for 3,011 clients and estimated savings of $4,128,240 for 818 people. Those are reported service/savings totals, not causal household gains attributable to this course. A separate assessment would need program costs, unique households, residence, counterfactual savings, categories, duration and signed burdens before applying an income bridge.

## Spending breakdown and financial appendix
Fiscal years end in June; the organization-hosted Form 2023 covers FY June 2024, not calendar 2023.

| Fiscal year | Revenue | Total expenses | Finance evidence |
| --- | --- | --- | --- |
| 2023 | $32,889,735 | $30,668,421 | IRS-derived extraction only |
| 2024 | $40,470,563 | $33,179,167 | Original organization-hosted return, Parts VIII/IX/XI |
| 2025 | $36,381,154 | $33,282,597 | IRS-derived extraction only |

Three-year average expenses are $32,376,728. Bounded original FY2023/FY2025 retrieval attempts failed; those years are not described as original-return verified. Program annual reports do not replace original annual financial statements. Institutional expenses provide size context, not a marginal course price or evidence of available funding room.

## Revision record and model appendix
The initial endpoint-utility hypothesis was $2.4M per better life. Its separate integrated .04-QALY diagnostic was $600K. Both remain frozen diagnostics. The new conditional reference is about $643K: interpreting the increment as integrated QALYs removes an extra duration/onset adjustment, while discounting and incremental household costs make it worse than the $600K health-only diagnostic.

Nineteen complete input/result cases are exposed in the API, alongside all three original worlds. The $100,000 normalization is an appendix scale, not a suggested gift. Smaller tranches use the same hypotheses; current actual capacity remains unknown. Unknown ordinary-donation EV is never substituted with zero, and nonpositive combined effects do not receive a positive price.

Actual closed research intervals are separate from historical estimated time. The abandoned open research interval is excluded; idle waiting, testing, review administration and publication are not research minutes.
`;
const source=(title,url,publisher,limit)=>({title,url,publisher,published:'See original document',retrieved:'2026-10-04',limit});
export const sources=[
 source('Current six-week tai chi service','https://www.selfhelpelderly.org/our-services/activity-centers/tai-chi','Self-Help for the Elderly','Sun-style delivery is not the prospective 24-week TJQMBB curriculum.'),
 source('Therapeutic tai ji quan economic evaluation','https://academic.oup.com/biomedgerontology/article/74/9/1504/5284888','Journal of Gerontology','Duration-weighted methods/table support integrated QALYs; prose ambiguity remains.'),
 source('FY2024 original return, labeled Form 2023','https://www.selfhelpelderly.org/wp-content/uploads/2025/05/SHE-2023-Form-990.pdf','Self-Help / IRS','Fiscal year June 2024; expense $33,179,167.'),
 source('IRS-derived annual finance extraction','https://projects.propublica.org/nonprofits/organizations/941750717','ProPublica / IRS','FY2023 and FY2025 original retrieval failed; extracted amounts only.'),
 source('2024–25 program report','https://www.selfhelpelderly.org/wp-content/uploads/2026/01/Annual-Report-2024-2025-DIGITAL.pdf','Self-Help for the Elderly','HICAP estimated savings are not a causal course-income effect.'),
 source('2023–24 program report','https://www.selfhelpelderly.org/wp-content/uploads/2025/02/SHE-FY-2023-2024-Annual-Report.pdf','Self-Help for the Elderly','Program reporting, not a substitute for original finances.'),
 source('CalFresh closeout document','https://www.sfhsa.org/sites/default/files/media/document/2025-12/self-help_for_the_elderly_calfresh_healthy_living_program.pdf','SF Human Services Agency','Expired January–March 2026 mixed-activity closeout, not current funding room.'),
 source('Health and income cost-effectiveness methodology','https://coefficientgiving.org/research/cost-effectiveness/','Coefficient Giving','Local log-resource implementation is a documented normative bridge.')
];
