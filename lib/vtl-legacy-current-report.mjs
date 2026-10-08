import {version,calculate} from './vtl-legacy-calibrated-model.mjs';
export const modelVersion=version;
const current=calculate();
export const summary={
 intro:'Vision To Learn brings eye examinations and prescription glasses to children through schools and mobile clinics. Its teams coordinate with school staff to identify children who need further evaluation, fit glasses and provide replacements. The organization operates across several states, including California.',
 reasons:['School-based care reduces practical barriers between detecting a vision problem and receiving usable glasses.','Published evaluations report improved vision and some short-term academic benefits, giving the program concrete outcomes to investigate.','Mobile delivery, fitting and replacement support offer a plausible way to reach children who would otherwise miss care.'],
 reservations:['Additional care funded by the next unrestricted donation is not measured; completed services are not automatically additional services.','Our pediatric health-utility and household-savings assumptions are uncertain, and academic test-score effects do not establish lifetime earnings.','The Bay Area and San Francisco residence shares are conditional assumptions, not verified shares of the next donation.'],
 cost:'Our conditional national estimate is about $1.72M per better life: ten combined modeled health and income-equivalent years. A fully supported examination-and-glasses course is modeled at $300, including upstream work and replacements; this is a research assumption, not a donation offer. Useful corrected vision drives most of the modeled benefit, with a small net household purchasing-savings contribution. The earlier estimate was about $801K; the revision uses a smaller pediatric utility gain and a longer delivery delay, while correcting delivery-cost and household accounting.'
};
export const markdown=`## Summary
The editorial summary presents the current conditional estimate and its principal reservations.

## What they do
Vision To Learn coordinates school-based screening, optometric examinations, prescription glasses and follow-up replacement support. The delivery pathway matters: identifying a child with a possible vision problem is not equivalent to providing a clinically useful pair of glasses.

The FY2025 original tax return reports 273,618 screenings, 107,520 examinations and 93,225 pairs of glasses. These are distinct activity counts, not three interchangeable beneficiary totals. They do not establish unique children, sustained use, untreated need or services caused by an additional donation.

Our delivery unit is a fully supported examination-and-glasses course. Its modeled $300 cash cost includes screening and examination work that does not end in completed treatment, coordination, organizational support and replacement provision. We do not subsequently apply another clinical-budget percentage or charge the same recognized donated goods a second time.

## Monitoring and information sharing
The organization publishes annual reports and describes its delivery and replacement process. Original returns establish the legal entity, national spending and service counts. They do not identify the next donation's allocation, additional completed courses, purchaser savings or geographic residence.

A useful follow-up would link unique children to prescription, dispensing, continued wear and replacements, while distinguishing children who would otherwise obtain care. It would also identify net household out-of-pocket payments and participation costs. School location alone is insufficient to identify where the marginal recipient lives.

## Clinical evidence and native outcomes
A Baltimore randomized school-based evaluation found a one-year i-Ready reading effect of approximately 0.09 standard deviations, but not a corresponding PARCC effect or sustained two-year benefit. We do not translate that test-score result into lifetime wages or claim it is itself a QALY gain.

Other school-based evidence reports improved visual acuity after glasses and imperfect continued use. In one follow-up, most children wore glasses during observation, but fewer than two-thirds reported prescribed use and replacement was common. These findings motivate explicit adherence and replacement assumptions; they do not directly measure a year of sustained benefit in the next donation cohort.

The health-utility proxy also has important transfer limitations. The Indian hospital study includes mixed conditions and interventions and is not a causal estimate for ordinary U.S. pediatric refractive correction. We use a judgmental 0.01 quality-of-life improvement for one incremental year, with 0.02 retained as a sensitivity, rather than importing the hospital value as a measured program effect.

## What do you get for your dollar?
Donations could support examinations, fitting, glasses, replacements and the shared delivery infrastructure. Our conditional $300 supported-course assumption is checked against national expense per reported pair, but annual spending divided by pairs is not a marginal price.

The reference models 50% financial additionality, 60% otherwise-unmet care and 60% effective wear. These assumptions answer different questions: whether donations expand services, whether the recipients would otherwise lack care, and whether correction is used. Effective wear already includes loss and nonwear; we do not apply another device-survival reduction.

A three-month donation-to-dispensing delay and 3% annual discount reduce benefits. Provider descriptions of delivery after an examination do not establish the time from donation to examination. The health horizon is finite: one additional year, not a child's lifetime. A small per-course clinical harm allowance is charged independently of unmet-care and wear discounts.

| Outcome for the reference normalization | United States | Bay Area | San Francisco |
| --- | --- | --- | --- |
| Net clinical healthy years | 0.578594 | 0.046288 | 0.008679 |
| Net income/consumption-equivalent years | 0.003307 | 0.000265 | 0.000050 |
| Dollars per better life | $1.72M | $21.48M | $114.57M |

The national price is the current archive-list comparison. Bay Area and San Francisco results are conditional diagnostic allocations, not independently priced local funding opportunities. San Francisco is included in the Bay Area, and both are included in the national total; the three rows must not be added.

## Health and net household resources
We assess health and signed household resources separately before combining them. The reference assumes 0.8 distinct households per additional course and a disjoint 5% purchaser subgroup with $50 of net avoided purchasing expenditure. It does not count insurance savings, retail sticker prices, or a separate household for every family member.

For each household cohort, purchasing savings, fees, travel, participation costs and actual take-home pay are netted before applying the logarithmic income/consumption transformation. The model uses a $50,000 household baseline and the documented Coefficient Giving-inspired normative mapping. These are income-equivalent healthy years, not observed clinical QALYs.

Exactly equal savings and costs for the same household cancel exactly. Negative net resources remain negative; an overlap discount applies only to positive benefit rows, not to fees or lost earnings. Purchasers, caregivers and residual households are distinct cohorts rather than separately logged gains and losses for the same people.

Caregiver earnings, future earnings, transfers and medical cash changes have no identified central gain. This is an explicit exclusion of unidentified channels, not evidence that their true effects are zero. Signed scenarios examine adverse participation costs, caregiver pay and future-income hypotheses. Future-income incidence uses distinct otherwise-unmet households, not the number of children multiplied into duplicate households.

The future-income scenario is a finite hypothesis, not an empirical conversion from the reading effect. Unsupported overlapping education and participation resource windows are rejected pending a joint cohort ledger. Induced failed-access burdens and independent harms can survive zero additional treatment when that counterfactual is specified; literal no-change scenarios remain zero.

## Qualitative assessment
School-based vision care has a clear practical mechanism and relevant service evidence. The strongest case is improved functional vision for children who otherwise would miss correction, supported by fitting and replacement rather than distribution counts alone.

The strongest alternative explanation is that many services replace care that would have occurred anyway, or that an unrestricted donation does not expand clinically useful delivery. National expenditure, mobile clinics and an existing network do not resolve these questions.

We therefore retain a quantitative conditional reference while distinguishing it from a measured ordinary-donation expected value. The model has undergone independent arithmetic and scientific challenge; this does not empirically identify its uncertain utility, additionality, purchaser or residence assumptions.

## Funding and previous grants
The ordinary reference assumes no public match. California matching arrangements require their own eligibility and approval evidence; their existence does not make an unrestricted donation automatically matched.

An explicitly hypothetical approved one-to-one match on the assumed 40% California donor allocation contributes $40,000 per $100,000 normalization. Its additionality and residence shares are modeled separately from national delivery. It is not included in the ordinary reference and is not a verified funding offer.

Complete associated resource cost remains unknown because school and partner inputs are not fully priced. The donor-plus-new-public cash amount is a known cost floor, not complete gross cost. An explicit $40 external resource allowance per funded course produces a separate conditional envelope; it charges all funded courses before additionality discounts. Ordinary unrestricted-gift expected value remains unidentified without a current allocation and capacity commitment.

## Spending breakdown and financial appendix
Vision To Learn is EIN 45-3457853. The following original returns cover fiscal years ending June 30, not calendar years.

| Fiscal year | Revenue | Total expenses | Revenue less expenses | Net assets |
| --- | --- | --- | --- | --- |
| 2023 | $20,192,814 | $19,589,987 | $602,827 | $18,859,375 |
| 2024 | $21,595,103 | $24,131,355 | -$2,536,252 | $16,323,123 |
| 2025 | $28,180,734 | $25,497,887 | $2,682,847 | $19,005,970 |

Average annual expenses were $23,073,076 across those three years. FY2025 program expenses were $20,761,273, administration $3,314,355 and fundraising $1,422,259. Restricted net assets were $15,354,367; unrestricted net assets were $3,651,603. Neither figure is verified cash headroom or room for more funding.

FY2025 government grants, Medicaid and CHIP revenue are separate from an approved match for the next donation. Reported expense per pair is approximately $274. Subtracting $1,359,892 of noncash contribution revenue before dividing by pairs yields about $259, but that is an unreconciled expense-less-contribution proxy, not verified cash expense. Contribution revenue is not a reconciled functional cash-expense adjustment.

A FY2025 audit listing was located. The audit opinion was not verified from an accessible original PDF, so we do not assert that no audit exists or that a clean opinion has been reviewed.

## Revision record and model appendix
The earlier national estimate was $801,436 per ten clinical QALYs; the current conditional estimate is $1,718,504 per ten combined health and income-equivalent years. The main changes are a smaller pediatric utility assumption and a longer activation delay, offset partly by removing a duplicated budget allocation filter and including a small net purchasing-savings channel.

The earlier Bay Area and San Francisco diagnostic prices were $10,017,955 and $53,429,092. Current conditional diagnostics are $21,481,302 and $114,566,943. Local marginal residence shares remain assumptions. The complete eleven-world historical model and original source hashes are preserved; revised values do not overwrite the earlier diagnostic record.

The $100,000 reference amount is solely an arithmetic normalization within a bounded model, not a specific gift recommendation or verified absorption commitment. Smaller normalized tranches scale under the same assumptions; capacity beyond that domain is not inferred.

Independent review challenged same-household cash netting, unique-household future-income incidence, signed overlap and unknown gross resources. The corrected model passed that scientific challenge. Sensitivity scenarios are not confidence intervals and have no empirically established probability weights. Current sources and assumptions, rather than an arbitrary desired numerical change, determine the comparison.
`;
const source=(title,url,publisher,limit)=>({title,url,publisher,published:'See original document',retrieved:'2026-10-04',limit});
export const sources=[
 source('Mobile Optometric Services program','https://www.dhcs.ca.gov/services/medi-cal-resources/medi-cal-eligibility-division/mobile-optometric-services-mos-program/','California DHCS','Provider program eligibility does not identify the next national donation allocation.'),
 source('MOS funding and provider requirements','https://www.dhcs.ca.gov/services/medi-cal-resources/medi-cal-eligibility-division/frequently-asked-questions-mos-faqs/','California DHCS','Public funding arrangements are not an automatic match or verified capacity for an unrestricted gift.'),
 source('MOS donor approval process','https://www.dhcs.ca.gov/services/medi-cal-resources/medi-cal-eligibility-division/how-do-i-become-a-donor/','California DHCS','Donor approval and conflict review are required; no approval was obtained in this research.'),
 source('FY2025 original Form 990','https://projects.propublica.org/nonprofits/full_text/202621359349308582/IRS990','IRS / ProPublica','National legal-entity finances and distinct service counts; not marginal costs.'),
 source('FY2024 original Form 990','https://projects.propublica.org/nonprofits/full_text/202511289349304146/IRS990','IRS / ProPublica','Fiscal year ends June 30.'),
 source('FY2023 original Form 990','https://projects.propublica.org/nonprofits/full_text/202401359349308510/IRS990','IRS / ProPublica','Fiscal year ends June 30.'),
 source('FY2025 audit listing','https://projects.propublica.org/nonprofits/display_audit/2025-06-GSAFAC-0000420841','ProPublica','Listing located; original opinion not verified.'),
 source('School-based randomized evaluation','https://jamanetwork.com/journals/jamaophthalmology/fullarticle/2783867','JAMA Ophthalmology','Short-term reading result, mixed assessments and no verified earnings bridge.'),
 source('Glasses use and replacement follow-up','https://pubmed.ncbi.nlm.nih.gov/31112777/','Primary research / PubMed','Observed use is not a full year of adherence.'),
 source('Hospital pediatric utility study','https://pmc.ncbi.nlm.nih.gov/articles/PMC11380325/','Primary research','Mixed Indian hospital population, not causal U.S. refractive correction utility.'),
 source('Visual acuity and refractive findings','https://eye.hms.harvard.edu/publications/visual-acuity-and-refractive-findings-children-prescribed-glasses-school-based','Harvard Ophthalmology / primary research','Clinical findings, not an untreated usual-care causal comparison.'),
 source('Glasses and replacements','https://visiontolearn.org/glasses/','Vision To Learn','Provider descriptions; activation time from donation is not identified.'),
 source('How delivery works','https://visiontolearn.org/our-work/how-vision-to-learn-works/','Vision To Learn','Provider operations, not independently measured marginal effects.'),
 source('Northern California operations','https://visiontolearn.org/where-we-work/northern-california/','Vision To Learn','Service locations do not verify marginal resident shares.'),
 source('Cost-effectiveness framework','https://coefficientgiving.org/research/cost-effectiveness/','Coefficient Giving','Normative comparison framework; does not validate our program assumptions.')
];
export const contentsMapping={'summary':'summary','what-they-do':'what','monitoring-and-information-sharing':'monitoring','clinical-evidence-and-native-outcomes':'monitoring','what-do-you-get-for-your-dollar':'cost','health-and-net-household-resources':'cost','qualitative-assessment':'qualitative','funding-and-previous-grants':'funding','spending-breakdown-and-financial-appendix':'funding','revision-record-and-model-appendix':'funding'};
export const currentResult=current;
