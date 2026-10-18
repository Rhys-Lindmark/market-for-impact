import {version,calculate} from './huckleberry-current-model.mjs';
export const modelVersion=version;
export const currentResult=calculate();
export const summary={
 intro:'Huckleberry Youth Programs offers individual, family and group counseling in San Francisco and Marin. It also provides crisis support, health services and educational programs. We investigate a targeted behavioral course for eligible adolescents, rather than treating every service as the same intervention.',
 reasons:['Accessible counseling can help young people manage anxiety and participate in daily life.','A randomized economic evaluation provides a concrete, time-limited health benchmark for a matched behavioral course.','Local services and no-fee access offer a potential route to adolescents facing barriers to care.'],
 reservations:['The external trial is not a local evaluation and cannot be assigned to every crisis or young-adult service.','Supported course costs and additional offers funded by a donation are planning assumptions.','Travel, fees, foregone pay and possible household savings need local measurement.'],
 cost:'Our conditional estimate is about $4.22M per better life: ten combined health and income-equivalent years for a proposed course serving SF residents. A $2,400 supported-course allowance models twelve staff hours, not a guaranteed donation purchase. Finite clinical gains drive the estimate; assumed travel costs reduce household welfare. This is not ordinary unrestricted-donation expected value.'
};
export const markdown=`## Summary
Accessible behavioral counseling offers a concrete route to better youth wellbeing.

## What they do
Huckleberry Youth Programs, Inc., EIN 94-1687559, provides counseling, crisis, health and educational services in San Francisco and Marin. Counseling includes individual, family and group work, with Medi-Cal no-fee and sliding-scale-to-zero access. The modeled prospective behavioral course concerns eligible SF residents aged 12–16, not the entire 12–24 counseling portfolio.

## Monitoring and information sharing
The organization publishes audits and service descriptions. Its FY2025 audit reports 228 SF counseling youth aged 12–24 and families; these historical contacts are not available additional places. Aggregate wellbeing improvements are monitoring, not causal QALYs.

A course proposal should track protocol, eligibility, genuinely additional offers, alternative care, integrated utility, unique households, fees, travel and net paid-work changes. Different household IDs must represent genuinely disjoint shared resource pools. Current charity-registry standing and October capacity were not independently established.

## Clinical evidence and native outcomes
The external randomized economic trial enrolled 185 youth aged 8–16.9, comparing 8–12 weekly 45-minute behavioral sessions against assisted referral and access support. Its adjusted .026 HUI2 QALY increment is integrated through 32 weeks (95% CI .009–.046). Count assignment and duration once; no extra completion or 32/52 multiplier. This mixed-cohort result is not an anxiety-only subgroup or local effect.

Exclusions included current suicidal plan, current abuse, substance dependence, bipolar disorder and active alternative treatment, among others. Crisis and older-young-adult transfer is unsupported. Depression-specific superiority was not established. Societal/payer/school savings are not household cash or donor refunds.

Positive local clinical transfer is assumed at 50%. Negative effects remain full per caused course. A 16/52-year discount midpoint approximates timing within the observed horizon, not a measured utility trajectory. No separate anxiety-free-day, future-wage or caregiver-health benefit is added to integrated QALYs.

## What do you get for your dollar?
The proposed $2,400 nominal 2026 allowance covers twelve staff hours at an assumed all-in $200/hour: nine direct and three assessment, engagement, administration and supervision. Overhead is counted once. This is not a local quote or converted trial cost.

At assumed 50% funding/offer additionality, one nominal course budget causes half an additional course-equivalent. This concerns substitution of funding or offers, not a second discount for alternative-care access already included in the trial. The full donor budget stays in the numerator.

| Conditional SF-resident course | Result |
| --- | --- |
| Nominal donor budget | $2,400 |
| Additional course-equivalents | 0.5 |
| Clinical QALYs | +0.00644115 |
| Net income-equivalent years | −0.00075061 |
| Combined healthy-year equivalents | +0.00569054 |
| Dollars per better life | $4,217,526 |

SF and Bay results match only for this restricted SF-resident hypothesis; actual organization-wide residence allocation is unknown. A better life means ten combined equivalents, not ten measured clinical QALYs. Ordinary-gift EV, verified funding room and complete social costs remain unknown, not zero. Specified external-resource stress is not complete social accounting.

## Health and net household resources
Reference: one recipient/caregiver household, three members, $30,000 assumed annual disposable resources, 32 weeks. Incremental travel −$30 assumes eight in-person course visits versus two alternative-care visits at $5 each. Neither size, resources nor travel is measured locally. Remote treatment or assistance can remove the burden; zero- and high-travel cases remain available.

Reference fees are zero for the no-fee cohort; zero alternative-care fees are assumed. Caregiver/adolescent net pay, household out-of-pocket savings and cash assistance receive no unmeasured positive credit. Zero means unidentified/uncredited, not no benefit. Net pay must reflect taxes and benefit offsets; foregone pay and the same monetized time cannot both be charged. Payer savings are not household savings; symptom improvement does not establish lifetime wages.

Each positive row receives an explicit independence/overlap credit before same-household netting; negatives remain full. Baseline plus net must stay positive before logarithmic conversion. Coefficient Giving-inspired equivalence is .5 × members × discounted years × ln(1 + net resources / horizon baseline). These are welfare equivalents, not clinical QALYs.

The exposed-household −$30 yields −.00150122 equivalents; 50% causal exposure yields −.00075061. Exposure applies outside the logarithm to ALL course-caused signed effects. This is not discounting conditional harm. Independent gift harms remain separate from clinical QALYs and persist without courses. Cash uses start-of-period discount timing. Reference ends at 32 weeks; longer selectable cash horizons are unsupported hypothetical alternatives, never clinical extrapolation.

## Qualitative assessment
Accessible counseling and no-fee services offer promising delivery features. A specified behavioral course is more tractable to evaluate than unspecified allocation across counseling, crisis work and education. Independent review accepted conditional equations and source interpretation, not local efficacy or a funding offer.

Low transfer, large burdens or adverse clinical results can eliminate positive modeled welfare. Caregiver-pay scenarios remain hypotheses without empirical probabilities. Other institutional pathways remain unassessed, not zero.

## Funding and previous grants
Audits describe government reimbursement and grants, including a 54% government share of FY2025 revenue. Private gifts may supplement or substitute for this funding. Surplus, restricted balances and recipient-free care do not establish incremental capacity. Undated relative-year contract language is not an October 2026 offer.

A funding assessment needs allocation, staffing, waiting-list demand, reimbursement and genuinely additional offers. The course model does not price the full portfolio.

## Spending breakdown and financial appendix
Fiscal years end in June; original audited expenses are kept separate from IRS-return conventions.

| Fiscal year | Audited expenses | Evidence |
| --- | --- | --- |
| 2025 | $9,377,959 | Original FY2025 audit |
| 2024 | $8,816,252 | Original FY2024 audit / FY2025 comparative |
| 2023 | $7,839,024 | Previously audited comparative in original FY2024 audit |

Three-year average audited expenses: $8,677,745. FY2023 was not separately opened. FY2025 activities are PDF page 5, functional expenses page 6. Separate IRS extraction reports $9,320,865 / $8,764,072 / $7,757,013; do not mix conventions. No original FY2025 Form 990 was inspected in this pass. Organization size is not course cost or funding room.

## Revision record and model appendix
Initial health-only $3.69M and three original worlds remain frozen. Revised conditional $4.22M adds planning travel costs and timing; undiscounted combined $4.17M and timed health-only $3.73M are separate diagnostics. Movement is not newly measured local efficacy.

Independent review rejected the intermediate $4.80M proposal: it discounted positive health for funding exposure but charged full burdens even when no course was caused. Corrected exposure applies to signed course effects; positive-only overlap discounts never reduce conditional harms. An exhausted-baseline logarithm boundary bug was also repaired.

Twenty complete current cases and three original worlds appear in the API. Stress scenarios are not local confidence intervals. Nonpositive welfare receives no positive price. Actual closed research clocks exclude idle waiting, integration, QA and publication; earlier missing time stays missing.
`;
const source=(title,url,publisher,limit)=>({title,url,publisher,published:'See original document',retrieved:'2026-10-04',limit});
export const sources=[
 source('Counseling services','https://www.huckleberryyouth.org/counseling-programs/','Huckleberry Youth Programs','Services, not causal efficacy or funding capacity.'),
 source('Entity and fiscal year','https://www.huckleberryyouth.org/nonprofit-annual-economic-statement/','Huckleberry Youth Programs','EIN and fiscal-year identification.'),
 source('Original behavioral economic trial','https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2777443','JAMA Network Open','Mixed-cohort integrated 32-week endpoint, not local efficacy.'),
 source('Original FY2025 audit','https://www.huckleberryyouth.org/wp-content/uploads/2026/02/101052_Huckleberry-Youth-Program_6.30.25-YE-FINAL-FS.pdf','Huckleberry Youth Programs / auditors','Original fiscal expenses and historical program scope.'),
 source('Original FY2024 audit / FY2023 comparative','https://www.huckleberryyouth.org/wp-content/uploads/2025/05/101052.AUD_Huckleberry-Youth-Programs-Inc._6.30.24-YE-FINAL-FS.pdf','Huckleberry Youth Programs / auditors','2023 previously audited comparative, not separately opened return.'),
 source('Separate IRS-derived expense convention','https://projects.propublica.org/nonprofits/organizations/941687559','ProPublica / IRS','Not mixed into audited mean.'),
 source('Health and income comparison','https://coefficientgiving.org/research/cost-effectiveness/','Coefficient Giving','Normative resource bridge, not clinical QALYs.')
];
