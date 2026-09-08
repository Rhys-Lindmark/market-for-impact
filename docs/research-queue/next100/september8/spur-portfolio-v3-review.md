# SPUR whole-organization conditional portfolio — v3 evidence update

September 8, 2026. Research asset only; no Site change. Supersedes v2 central, not the source record or favorable/pessimistic joint scenarios.

## Outcome

A hypothetical marginal $100,000 unrestricted gift produces an analyst best estimate of **0.09214 SF QALYs and 0.4564 Bay Area QALYs including SF**: **$10.853 million per 10 SF QALYs**, or **$2.191 million per 10 Bay Area QALYs**. These geographic totals must not be added together. This is a conditional partial-health portfolio estimate, not an empirical SPUR effect, verified marginal offer, complete welfare valuation or recommendation.

## Why the central changed

The primary-source check in [housing utility evidence](/private/tmp/mfi-spur-housing-utility-check.md) found no transferable preference-based utility mapping for modest rent savings, burden or crowding change. Bentley's longitudinal affordability result is a mental-health score, Denary's within-person rental-assistance transition is null-compatible, and Reeves' benefit-cut result is depressive symptoms rather than QALYs. These findings warrant caution about automatically awarding .005 utility to every counted spillover adult-year.

V3 reduces the **unconditional analyst average** spillover utility from .005 to **.001 per counted nonoccupant adult-year**. It is not a sourced symptom-to-utility conversion, a conditional responder utility or an observed SPUR effect. No additional response probability is applied: such a factor would redefine this average and must not be silently multiplied in. The former .005 central survives as a named historical sensitivity, not as an alternative ranking estimate. This is a downward evidence-informed judgment update, not target tuning.

Primary evidence and limits:

- [Bentley et al., 2011](https://pubmed.ncbi.nlm.nih.gov/21821543/): affordability transition associated with −1.19 mental-health-score points; nonrandomized, not utility and not symmetric proof of rent-reduction benefit.
- [Denary et al., 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8299474/): assistance receipt cross-section favorable, within-person transition distress reduction not statistically significant; no utility mapping. The inherited bounded check accessed indexed passages, not an independently verified full table.
- [Reeves et al., 2016](https://eprints.lse.ac.uk/67723/1/Reeves_Reductions%20in%20UK%20benefit_2016.pdf): benefit cuts associated with 1.8 percentage points more depressive symptoms; not diagnosed depression, utility, a current SF dose or a reversible linear dose-response.

The central direct .01 remains a judgment conditional on an improved harmful housing state for 15% of residents, equivalent to .0015 average per direct resident-year. The actual harmful state and dose remain unspecified, so this is not source calibration either.

## Inspectable central arithmetic

Housing SF = 1000 integrated occupied-home-years × .02 net gift contribution × (2 people × .15 improved-state fraction × .01 conditional utility + .5 nonoccupant household-years × 1.5 adults × .001 average utility) = **.075 QALY**, consisting of .06 direct and .015 spillover. Rest-Bay exposure is 3000 home-years, yielding .225 QALY. The integrated home-years already include the illustrative finite years 3–8 schedule and 3% annual discount; do not multiply by six years again.

Transit remains .0025 SF + .0075 rest Bay. Heat remains .01464 SF + .13176 rest Bay. Central SF = .075 + .0025 + .01464 = .09214; Bay = .09214 + .36426 = .4564. Ratio = 10 × $100,000 / positive net QALYs.

## Recomputed scenarios

Positive joint scenarios are not confidence intervals or probabilities.

| Scenario | SF net QALYs | Bay including SF net QALYs | Donor $/10 SF QALYs | Donor $/10 Bay QALYs |
|---|---:|---:|---:|---:|
| central | 0.092140000 | 0.45640000 | $10,853,050 | $2,191,060 |
| favorable | 12.196000 | 51.640000 | $81,994 | $19,365 |
| pessimisticPositive | 0.000044690000 | 0.00024980000 | $22,376,370,553 | $4,003,202,562 |
| nullGiftContribution | 0.0000000 | 0.0000000 | No positive-Q ratio | No positive-Q ratio |
| nullPhysicalOutput | 0.0000000 | 0.0000000 | No positive-Q ratio | No positive-Q ratio |
| centralDonorHarm | -0.10786000 | -0.24360000 | No positive-Q ratio | No positive-Q ratio |
| nullContributionDonorHarm | -0.20000000 | -0.70000000 | No positive-Q ratio | No positive-Q ratio |
| centralZeroHousingSpillover | 0.077140000 | 0.39640000 | $12,963,443 | $2,522,704 |
| favorableZeroHousingSpillover | 4.6960000 | 21.640000 | $212,947 | $46,211 |
| historicalCentralSpilloverPrior | 0.15214000 | 0.69640000 | $6,572,893 | $1,435,956 |

Null gift contribution and null physical output remain zero. Independent donor harm remains signed and outside already-net shared contribution terms; it can persist when contribution is zero. Central harm now produces negative health in both geographic cells. Neither zero nor negative QALYs earns a positive cost-effectiveness ratio.

Central-zero-spillover retains its zero household exposure while its unused utility metadata follows the new central .001. Favorable, pessimistic-positive and favorable-zero-spillover inputs/outputs are unchanged. The historical prior exactly reproduces v2 central within floating-point tolerance.

## Preserved boundaries

- This is one unrestricted portfolio budget, not a sum or average of component cost-effectiveness ratios: housing $35k, transport $30k, heat $20k, governance/procurement $10k and economic-security/downtown $5k. Shared administrative costs are included once; the last $15k receives no quantified health, not a claim of no welfare.
- Housing/transport 25% SF resident benefit is an explicit unverified geography allocation prior, not inference from building or transit location. SF/rest-Bay cells are benefit-equivalent exposures. Heat's SF share is also a residence prior.
- All housing scenarios retain finite calendar schedules: years 3–8 for central/favorable-derived cases, year 3 only for pessimistic, zero thereafter. Transit stops after year 5. Integrated exposures enter each health formula once.
- Gift contribution already incorporates displacement, implementation and collaborator attribution; enacted laws and already-funded service are baseline, not automatically new gift output. No new success probability or marginal provider offer was manufactured.
- Direct/nonoccupant housing benefits must be disjoint; cross-channel health states must be deduplicated. A shared person can have genuinely distinct benefits; do not exclude every overlapping beneficiary merely because the person appears twice.
- Full construction, appliance, transit and implementation resources remain unpriced. Adding $1m net induced resources once yields central **$119.384m/10 SF QALYs** and **$24.102m/10 Bay QALYs**; this is an unpriced stress, not a complete societal estimate. The favorable donor ratio alone cannot establish resource cost-effectiveness.

## Assets and verification

[Inspectable v3 model](/private/tmp/mfi-spur-portfolio-v3.json). Lineage: [v2](/private/tmp/mfi-spur-portfolio-v2.json), [v2 review](/private/tmp/mfi-spur-portfolio-v2-review.md), original proposal and independent audit preserved in JSON provenance. No v1/v2 overwrite.
[Inspectable v3 model](/private/tmp/mfi-spur-portfolio-v3.json). Lineage: [v2](/private/tmp/mfi-spur-portfolio-v2.json), [v2 review](/private/tmp/mfi-spur-portfolio-v2-review.md), original proposal and independent audit preserved in JSON provenance. No v1/v2 overwrite.

All 10 scenarios recalculated from named inputs. **112 arithmetic/invariance checks passed**: 40 finite discounted exposure integrals, 10 geographic sums, 45 unchanged favorable/pessimistic output comparisons, 15 historical-central comparisons, and two independently expanded central totals. This verifies internal accounting, not the truth of output, attribution or utility priors. All original primary-source links remain, with three utility-check references added and access limits preserved.
