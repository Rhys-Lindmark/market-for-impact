# Hearing-aid access: final reviewed conditional research

2026-09-08. **Central $1.25M donor cash per10 incremental QALYs; extended favorable stress $74,074; pessimistic $160M.** Cash-plus-device resource diagnostics are$1.75M,$123,457 and$224M respectively. No current priced offer or tax-deductible receiving route has been verified. The favorable case is an unsupported-local-duration stress, not the central estimate or a statistical interval.

This report and `/private/tmp/mfi-hearing-final-model.json` supersede the earlier hearing packet's ambiguous time/harm language and outdated identity warning. Arithmetic remains unchanged because effective years are now explicitly defined as discounted exposure judgments within finite calendar windows. Seven signed scenarios are preserved.

## Actual SF pathway and nonduplication

[PHC's current Core Senses page](https://www.projecthomelessconnect.org/programs/coresenses/), independently re-read September8, names the Hearing and Speech Center of Northern California partnership: screening, necessary aids, batteries, support and follow-up; insurance is not required. The model begins with an already clinically eligible, willing adult **offered** assessed/fitted/supported hearing care. Broad outreach/screening is outside this denominator and must be added if needed. One or both ears as indicated produce one person-level outcome.

This is a real shared clinical pathway, **distinct from PHC's glasses program**, not two independent hearing benefits. Use ledger key `phc-hsc-adult-hearing-aid-access` across operators/funders. [Device-donation information](https://hearingspeech.org/donate/item-donations/) describes refurbishing suitable devices; it supplies no current stock, yield, marginal fitting capacity or price. A device alone does not produce the fitted-and-rehabilitated utility effect.

The Center's [current donation page](https://hearingspeech.org/donate/) permits program instructions but does not verify a marginal hearing tranche or present legal eligibility. Its dated references and conflicting old/new addresses make website freshness a genuine concern; a current crawl is not evidence of recent operational verification.

## Recipient status: stronger than a secondary warning, weaker than proof of current closure

The accepted same-day [identity audit](/private/tmp/mfi-hearing-identity.md) directly searched both primary IRS bulk datasets. The [IRS landing page](https://www.irs.gov/charities-non-profits/tax-exempt-organization-search-bulk-data-downloads), independently re-read for this final pass, still labels them June9,2026. The [revocation dataset](https://apps.irs.gov/pub/epostcard/data-download-revocation.zip) record for historical EIN94-1322198 identifies automatic revocation **effectiveNovember15,2025, postedMarch10,2026, with blank reinstatement date**. No match was found in the checked [Publication78 dataset](https://apps.irs.gov/pub/epostcard/data-download-pub78.zip). The exact record and primary data-dictionary mapping are preserved in the identity audit/model.

This is no longer merely an IRS-derived-directory warning. It also **does not prove current clinic closure, misconduct, corporate dissolution or absence of later reinstatement**. Subsequent reinstatement, successor or fiscal sponsor remains unverified after the dataset cutoff. The [historical2020 sponsorship document](https://www.hearingspeech.org/wp-content/uploads/2019/10/HSC_Gala_Sponsor_Packet_2020INDIV.pdf) connects the clinical organization to that EIN, but cannot establish current deductibility.

The audited [primary NPPES record](https://npiregistry.cms.hhs.gov/api/?number=1164577433&version=2.1) had an active clinical NPI, updatedJune8,2026. NPI status is not nonprofit exemption or appointment availability. PHC's partnership page does not establish ownership/fiscal sponsorship. Do not silently route the same modeled gift to PHC, assume its current giving processor establishes control of the hearing program, or increment the roster of verified eligible charitable recipients without a recipient/authority crosswalk. Conditional clinical research can remain published with that limitation.

## Primary clinical effect, not an imported lifetime ICER

[Kaur2020](https://link.springer.com/article/10.1186/s12913-020-05977-x) randomized Singapore community centres to immediate fitting/rehabilitation versus three-month delayed fitting. The reported HUI3 increment is **.12 utility**, not .12QALYs. Participants wanted aids and had hearing loss; prior aid nonuse for ten years was required, not necessarily first-ever use. The control questionnaire omitted aid-use questions. The paper's analyzed groups were264/163 after12 missing-data exclusions. Allocation, selected participants and instrument design limit transfer to SF adults experiencing homelessness.

Rehabilitation included early follow-up. At one year71.4% used aids among66% telephone respondents; that is not a complete-cohort persistence rate. Five-year constant utility was extrapolated. No published ICER, dementia prevention, mortality, employment or additional social-health stack is imported. Near-zero effects with less hearing-sensitive utility instruments motivate the explicit.01 pessimistic instrument judgment; it is not a local estimate. Our .5/.75 transfer factors are judgments, not trial coefficients, and do not repeat pre-fitting failure.

## Finite calendar horizon and discount convention: corrected

Time0 is the hypothetical offer/commissioning date. The central and pessimistic models stop **one calendar year later**; the favorable extended stress stops **four calendar years later**. No health or unpaid support is credited after these windows. These are researcher-selected windows, not observed local follow-up.

Effective years are `Σ annual_incremental_benefit_fraction[y]/1.03^y`, using **3% annual end-of-year discounting**. Conditional on pre-fitting completion, each annual fraction combines ramp-up, continued useful wear, survival and benefit still additional before equivalent alternative care catches up. It is a utility-equivalent exposure fraction, not a measured adherence rate. No additional retention/catch-up multiplier applies.

| Scenario | Calendar years | Annual fractions, judgment | Discounted effective years |
|---|---:|---|---:|
| Central | 1 | .515 | .5 |
| Extended favorable stress | 4 | .5380540904 in each of4 years | 2 |
| Pessimistic | 1 | .2575 | .25 |

The equal favorable fractions are a transparent coarse annual-average schedule, not evidence that use is flat. The discounted maximum within four years is about3.7171, so two effective years is feasible mathematically but unverified clinically. Modeling early ramp and later declining wear could change the result. A three-month trial does not validate this four-year scenario.

The **whole cash budget is committed/reserved at time0**, including future support. Thus it is not separately discounted as if those committed donor dollars were future gifts. Favorable$150 batteries/repair/support must cover the entire four-calendar-year window, roughly$37.50 per year, not only two benefit-equivalent years. This is particularly optimistic and may fail with repairs, loss or replacement. Raise costs if needed; do not extend free support beyond the priced window.

## Model, budgets and harms

`Q = a * (u * transfer * pre_fitting_completion * discounted_effective_years - shared_pathway_harm) - donor_specific_harm`.

Funding additionality a concerns displaced finance, not later alternative care (already in exposure). Shared harm is net pathway health burden per commissioned offer **before** funding additionality, excluding burdens already reflected in the utility anchor. Donor-specific harm is separately attributable health loss that persists outside that factor. Neither is unqualified monetary opportunity cost: dollars belong in costs, and displaced health requires explicit separate evidence.

| Per-offer cash, all analyst2026-dollar budgets | Central | Extended stress | Pessimistic |
|---|---:|---:|---:|
| Paid assessment/fitting/rehabilitation labor | 600 | 400 | 1,000 |
| Refurbishment/molds | 250 | 150 | 450 |
| Support for entire calendar window | 250 | 150 | 400 |
| Coordination/failures | 200 | 100 | 300 |
| Facility/admin/contingency | 200 | 100 | 350 |
| Cash commitment | 1,500 | 900 | 2,500 |
| Donated-stock resource allowance | 600 | 600 | 1,000 |

Costs include failed offers; they are neither provider quotes nor retail prices. Clinical labor is paid in the constructed budget even if currently volunteered. The resource allowance is a judgment opportunity value for stock, **not a complete net societal ICER**. It is added gross per commissioned offer, not scaled by financing additionality, and does not establish what resources would be used under identical replacement funding. Patient time is unknown; no cost offsets claimed.

| Scenario | u | Transfer | Completion | Effective years | a | Q/offer | Cash/10Q | Cash+stock/10Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Central | .12 | .5 | .8 | .5 | .5 | .012 | 1,250,000 | 1,750,000 |
| Extended favorable stress | .12 | .75 | .9 | 2 | .75 | .1215 | 74,074 | 123,457 |
| Pessimistic | .01 | .5 | .5 | .25 | .25 | .00015625 | 160,000,000 | 224,000,000 |

Regression scenarios: identical funding replacement(a=0) cancels shared.001Q treatment harm →0Q; separate donor-specific.001Q harm witha=0 persists →−.001Q. Another signed case has zero benefit, a=.5 and independent.001Q harm →−.001Q. These harms are hypothetical judgments, not observed adverse-event rates. Both cash and resource ratios are null when netQ≤0, not negative “bargains.” All scenarios carry complete inherited cost/resource fields.

At central other inputs, a$1,500 course would require6.25 effective incremental years to meet$100K/10Q. **That exceeds the one-year model horizon and is not an achievable core sensitivity.** Within the actual core exposure, donor cash must fall below$120. The extended stress requires about1.4815 discounted effective years at$900, but its resource diagnostic remains above target. The old three-month-only.25-effective-year test gives$2.5M; it is an exposure sensitivity, not an exact undiscounted quarter-calendar observation.

## Remaining evidence doubts and acceptance

Existing [Medicare exclusions](https://www.medicare.gov/coverage/hearing-aids), possible Medicare Advantage benefits, [Medi-Cal conditions](https://www.healthcareoptions.dhcs.ca.gov/content/dam/digital/united-states/california/ca-hco/documents/english/2024-MCP-EOC-member-handbook.pdf), and [adult mild/moderate OTC options](https://www.fda.gov/medical-devices/hearing-aids/otc-hearing-aids-what-you-should-know) belong in the alternative-care path; the older Medi-Cal template is not verified2026 plan-specific authorization. No insurance requirement for the program does not mean public coverage is absent. Severe/profound cases cannot inherit OTC suitability.

Specific unresolved facts: post-cutoff IRS status/recipient authority; currently completed adult hearing courses and eligible unfunded backlog; actual fitting delay without new money; current insurance/reimbursement and device-stock constraints; full support costs over one/four years; longitudinal wear and utility; and division of expenses between PHC and Center. These unknowns make this completed **conditional research**, not a current funding recommendation. The clinical mechanism is real and separate from glasses; the legal recipient and attractive long-duration scenario remain unverified. No outreach or Site changes.
