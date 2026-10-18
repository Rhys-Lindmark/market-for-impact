import {version,calculate,cases} from './newdoor-current-model.mjs';
export const modelVersion=version;
export const currentResult=calculate(cases.find(s=>s.id==='finiteCourseWorkingPrior'));
export const summary={
 intro:'New Door Ventures offers paid work experience, training and individual support to young people facing barriers to employment. It also provides education and career services in the Bay Area. Participants can receive wages, study stipends and practical help with transportation and next steps.',
 reasons:['Paid experience gives young people a concrete opportunity to practice workplace skills and earn money.','Individual support and education services can address obstacles that a job placement alone may not solve.','Original financial statements and program descriptions make the organization and its delivery pathways identifiable.'],
 reservations:['Local causal effects on health, household resources and sustained earnings are not established.','Counterfactual earnings, benefit reductions, time and participation costs can offset the value of wages.','Additional capacity, future allocation and unique recipient households are not identified for the next donation.'],
 cost:'A supported employment place is modeled at $20,000, an assumption rather than a provider quote. Our conditional partial reference produces net harm after household cash and time burdens are included, so it has no positive dollars-per-better-life price. This is not evidence of observed causal harm: the complete ordinary-donation expected value remains unknown. A separate lower-displacement sensitivity produces about $7.14M per better life in the Bay Area; it is not our reference or a confidence bound.'
};
export const markdown=`## Summary
Current findings and reservations are summarized below.

## What they do
New Door Ventures serves young people through paid employment experiences, training, education and career support. The legal entity is New Door Ventures, EIN 94-2780274. Programs operate in San Francisco, Oakland and San Jose; worksite location does not identify recipient residence.

The employment page describes a six-month program with 12–15 paid work hours per week and individual support. Its FAQ also retains a three-month description, so a uniform actual dose is not established. The stated 300-plus training hours do not establish that every hour is unpaid, additional to work, attended or caused by a donation.

Education participants can receive $15 per study hour and help with tests and transport. We do not automatically count those stipends alongside employment wages for the same household.

## Monitoring and information sharing
The 2025 impact page reports 325 young people served, 13,300-plus support/workshop hours and $918,000-plus in wages and stipends to participants and alumni. These totals have different scopes. Dividing wages and stipends by 325 would not establish mean employment-cohort pay or additional income.

Useful causal monitoring would record offered places, attendance, actual pay, alternative employment, taxes, benefit losses, household composition, travel and caregiving costs, time, subsequent earnings and health. Unique households must be identified before combining employment, education and career effects. We have not located such a local causal household panel.

## Clinical evidence and native outcomes
Randomized youth employment studies support evaluating actual wages and subsequent outcomes rather than assuming that all jobs create lasting health or earnings gains. A New York City summer-employment lottery study found contemporaneous earnings gains with crowdout and adverse subsequent earnings effects; a Chicago study found reduced violent arrests without average employment or schooling improvements. These populations and programs differ from New Door. Neither supplies a local QALY coefficient.

Adult employment-support trials are also not a direct youth-health bridge. The reference assumes a 0.0025 utility gain lasting an effective quarter-year per offered place, averaged over noncompletion. This is a subjective finite allowance, not measured New Door utility. Attendance is not multiplied into this offered-cohort health allowance again.

## What do you get for your dollar?
Donations may support paid places, training, individual support and shared delivery costs. Our hypothetical allocation is 70% employment, 15% education, 10% additional career services and 5% reserve/strategy. All donor costs remain in the numerator; unassessed allocation is not discarded. The $20,000 supported-place cost and 50% service additionality are research assumptions, not audited unit costs or a marginal funding offer.

| Conditional reference, per $100,000 appendix normalization | Bay Area, including SF | San Francisco |
| --- | --- | --- |
| Modeled health QALYs | +0.001094 | +0.000492 |
| Net income/consumption-equivalent years | −0.066062 | −0.029728 |
| Combined healthy-year equivalents | −0.064968 | −0.029236 |
| Positive dollars-per-better-life price | Conditional reference: net harm | Conditional reference: net harm |

Specified health, household cash and time assumptions produce a negative assessed-channel result. Complete ordinary-donation expected value remains unknown; these assumptions do not establish observed causal harm. A better life remains ten combined healthy-year equivalents, with income-equivalent years distinguished from clinical QALYs. A nonpositive denominator cannot yield a positive price or numeric shortlist rank.

The lower-displacement sensitivity produces +0.139992 Bay-equivalent years and about $7.14M per better life. It changes benefit displacement, alternative earnings, time valuation and the clinical allowance jointly. It is not an empirically weighted expected value, confidence interval or replacement for the reference.

## Health and net household resources
The household reference assumes three members sharing $24,000 in annual disposable resources. Branch probabilities are 50% full paid dose, 20% half dose and 30% no paid dose; these are priors, not observed New Door completion rates. Full dose is 13.5 paid hours for 26 weeks. The SF worksite wage allowance is $19.61 per hour; Oakland's $17.34 rate is tested separately. Neither rate establishes actual participant pay, residence or eligibility for SF's limited government-supported wage exception.

For the full-dose branch we subtract assumed taxes of 10% of gross pay, benefit displacement of 10%, $2,000 of alternative take-home earnings and $300 of uncovered travel/care costs. Half dose uses half those fixed amounts. Actual conditional expected net cash is $1,923.89 per offered place before service additionality—not the logarithmic welfare total or a measured income gain.

The full-dose time hypothesis is 609 incremental hours: 351 paid hours minus 120 alternative-work hours, plus 300 training, 26 support and 52 travel hours. Valuing this at $4 per hour is a normative opportunity-cost proxy, not a cash expense. Whether training is unpaid, additional or fully realized is unresolved. The no-paid-dose branch retains a $40 time burden.

Before netting, positive gross resource rows receive a 75% independent-credit allowance; all negative taxes, benefit losses, alternative earnings and time burdens remain full. We then sum signed rows within the same household, annualize the half-year flow once, and apply the documented Coefficient Giving-inspired logarithmic resource mapping over that half-year. The coefficient is 0.5 healthy-year-equivalent per person per natural-log income change per year. Household resources are not duplicated three times: aggregate resources are divided among the three members before the same ratio is applied.

This positive-credit allowance is a conservative normative overlap hypothesis, not a measured causal factor. Applying it after the logarithm would incorrectly shrink negative burdens. Negative clinical effects likewise receive no positive-overlap discount. Multiple paid participants in one household require a pooled ledger; a zero-household exposure case cannot erase known sibling burdens.

The reference uses Bay residence share 100% and SF share 45%, both unverified. SF is a subset of Bay benefits, not another benefit to add. Scenarios include zero additional services, independent harms, adverse time costs, a finite three-year later earnings loss, Oakland wages, outside-Bay residence and extra resource costs. They expose uncertainty without inventing scenario probabilities.

## Qualitative assessment
Paid work and individualized support are appealing native opportunities for young people facing employment barriers. Selection criteria and existing readiness can affect who is reached and how comparisons transfer. Program participation and post-program employment are not themselves causal welfare estimates.

Independent source and arithmetic checks support this conditional calculation, not its unmeasured assumptions. The sign is particularly sensitive to incremental training time, displaced resources and the positive-credit allowance. A funding decision needs those quantities and marginal capacity clarified; neither the favorable sensitivity nor the negative reference should be treated as demonstrated real-world impact.

## Funding and previous grants
The 2025 audit records $1,438,580 of government funding, a $2,005,878 operating decrease, cash of $880,296 and net assets of $9,630,835. These figures describe annual accounts, not an available match or the capacity to absorb a large gift. Restricted resources and existing commitments matter.

Full societal resource costs—including public services, volunteer inputs, employer output and displacement of other workers—remain unknown. Donor cost includes wages once as a cash outlay; participant gains are assessed separately. Annual organization expense is not a marginal course price.

## Spending breakdown and financial appendix
Original annual returns cover calendar years ending December 31.

| Calendar year | Revenue | Total expenses | Net assets |
| --- | --- | --- | --- |
| 2023 | $5,571,283 | $5,050,598 | $12,625,570 |
| 2024 | $5,003,794 | $6,211,850 | $11,434,857 |
| 2025 | $4,717,359 | $6,505,120 | $9,630,835 |

The three-original-return average expense is $5,922,523. The 2025 audit also reports $6,505,120 of total expense and $5,078,730 of program expense. Employment expenses are $1,843,419 for SF, $1,784,535 for Oakland and $427,257 for San Jose; education is $572,181 and transition services $451,338. These accounting categories do not verify the hypothetical prospective allocation or participant residence.

Audit and IRS revenue presentation differ; they are not interchangeable marginal-cost denominators. The annual-work case scales the $6,505,120 budget and all modeled delivery together as a forward hypothesis, not observed 2025 impact. It does not divide an annual numerator by a small-gift denominator.

## Revision record and model appendix
The initial conditional health-only portfolio prices were $228,571,429 per better life in the Bay Area and $507,936,508 in SF. They remain historical diagnostics, not the current price. The revision reduces the unsupported clinical allowance and adds finite signed household resources, including time and crowdout; the assessed reference becomes negative rather than a positive price.

An intermediate author calculation of $27.06M Bay/$60.13M SF was rejected because post-net overlap factors attenuated harms. The repaired signed-row calculation passed independent reconstruction of all 13 cases and domain/exposure controls. No favorable sensitivity was substituted to force a positive result.

All eight original portfolio worlds and three earlier employment-only diagnostics are preserved separately in the API. They have different intervention boundaries. The $100,000 appendix normalization is not a recommended gift or verified absorption commitment; donation tests permit smaller tranches under the same assumptions. Complete ordinary donation EV, probability-weighted EV and complete societal resource cost remain unidentified.
`;
const source=(title,url,publisher,limit)=>({title,url,publisher,published:'See original document',retrieved:'2026-10-04',limit});
export const sources=[
 source('Employment program','https://www.newdoor.org/what-we-do/employment-program/','New Door Ventures','Conflicting duration descriptions; intended dose is not observed dose.'),
 source('Education program','https://www.newdoor.org/what-we-do/education/','New Door Ventures','Study stipends are not automatically additional household gains.'),
 source('2025 impact','https://www.newdoor.org/our-impact/','New Door Ventures','Wage and participant counts have different scopes.'),
 source('2023 original Form 990','https://www.newdoor.org/wp-content/uploads/2024/08/2023_FORMS-990_PUBLIC-DISCLOSURE-COPY_NDV.pdf','New Door / IRS','Original calendar-year legal-entity finances.'),
 source('2024 original Form 990','https://www.newdoor.org/wp-content/uploads/2025/11/2024_Forms-990_Public-Disclosure-Copy_NDV.pdf','New Door / IRS','Annual costs are not marginal funding quotes.'),
 source('2025 original Form 990','https://www.newdoor.org/wp-content/uploads/2026/07/2025_Form-990_Public-Disclosure-Copy_NDV.pdf','New Door / IRS','EIN 94-2780274.'),
 source('2025 audited financial statements','https://www.newdoor.org/wp-content/uploads/2026/07/NDV-2025-Audit-Report.pdf','New Door Ventures','Signed June 12, 2026; IRS/audit revenue scope differs.'),
 source('SF historical minimum wage rates','https://media.api.sf.gov/documents/2026_Historical_San_Francisco_Minimum_Wage_Rates_M9ynRNo.pdf','City of San Francisco','Ordinary worksite floor, not actual New Door pay.'),
 source('Oakland minimum wage','https://www.oaklandca.gov/Government/Departments/Workplace-Employment-Standards/Oakland-Minimum-Wage-Sick-Leave-and-Other-Labor-Laws','City of Oakland','2026 worksite sensitivity.'),
 source('NYC summer youth employment lottery','https://www.nber.org/papers/w20810','NBER','External randomized evidence; no local earnings coefficient imported.'),
 source('Chicago youth employment experiment','https://www.nber.org/papers/w23443','NBER','External crime and employment findings, not a QALY bridge.'),
 source('Cost-effectiveness methodology','https://coefficientgiving.org/research/cost-effectiveness/','Coefficient Giving','Normative health/income comparison; local implementation assumptions remain explicit.')
];
