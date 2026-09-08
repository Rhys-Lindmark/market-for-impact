# SPUR unrestricted portfolio v2: reviewed research asset

September 8, 2026. Companion: `/private/tmp/mfi-spur-portfolio-v2.json`. Implements `/private/tmp/mfi-spur-portfolio-independent-audit.md`; preserves the scope, underlying priors and source trail of `/private/tmp/mfi-spur-portfolio-proposal.md`. No Site changes, fresh source claims, invented donor offer or target tuning.

## Answer and status

**Central donor estimate remains $6.57M per 10 SF-resident QALYs, or $1.44M per 10 Bay-resident QALYs including SF.** This is a provisional judgmental whole-unrestricted-gift model, not empirical cost-effectiveness. SF and Bay are alternative denominators, not additive outcomes. The model retains a $100,000 gift once: housing $35,000; transit $30,000; clean heat $20,000; governance/procurement $10,000; economic/downtown $5,000, including allocated overhead. The last $15,000 remains in cost with unquantified health, not zero asserted welfare.

## Audit corrections implemented

1. **Resident allocation is explicit.** Housing/transit use a judgmental 25% SF / 75% rest-of-Bay health exposure allocation. Existing field names retain “Sf” and “RestBay” for compatibility but now denote benefit-equivalent exposure assigned to resident groups, not verified project or service locations. Neither an SF building nor an SF bus makes every beneficiary an SF resident. This reinterprets the existing geographic split transparently without changing its numbers. A future origin/location-to-residence matrix may reallocate cross-border rent, commuter and moving-chain effects. Heat has its separate scenario-specific SF health-share prior. Bay coverage still does not capture all out-of-region effects.

2. **Finite housing schedules are inspectable.** Central/favorable and their derivative stresses use years 3,4,5,6,7,8 after gift, with equal undiscounted equivalent-home exposure in those years and zero outside. Their 3% annuity factor is 5.106222494. Annual exposure is integrated-input H divided by that factor; H=1,000 therefore corresponds to about 195.8395 annual equivalent homes, not exactly 200. The old “200 homes for approximately five discounted years” remains only a scale illustration. Pessimistic housing uses **year 3 only**, zero afterward, with annual exposure H×1.03³: SF112.5509/restBay337.6527 equivalent homes integrate to100/300 home-years. These schedules are arbitrary but finite decompositions of fixed priors, not newly observed pipelines.

3. **No duration twice.** The housing formula uses integrated discounted H once. Do not multiply by six calendar years, five effective years or an extra annuity. Transit receives explicit years1–5 schedules normalized to its existing discounted service-hour totals; zero outside. Trips divided by400 remain recurrent-use-equivalent rider-years, not another five-year benefit horizon. Heat retains the prior component's bounded effective mortality-impact-year convention; no second survival or calendar discount is added.

4. **Disjoint benefits, not disjoint people.** Multiple distinct health changes for the same individual can coexist. Deduplicate the same housing-state, travel/activity, pollution or injury gain across channels, and deduplicate supply/coordinator/delivery partner credit. Do not automatically discard a transit rider merely because that person benefits from housing. Housing-related travel health already credited in housing cannot receive a second full transit credit; heat remains outside housing projects already credited for those emissions changes.

5. **Zero-spillover sensitivities added.** Set only nonoccupant housing spillover-household-years to zero, retaining all other inputs and the whole gift. Central becomes **$12.96M SF / $2.52M Bay** per10Q. Favorable becomes **$212,947 SF / $46,211 Bay**. The favorable SF threshold crossing therefore depends materially on the speculative nonoccupant channel. These are diagnostics, not alternate selected centrals, confidence bounds or evidence that spillovers are zero.

## Recomputed outcomes

| Scenario | SF net QALYs | Bay including SF | Donor $/10 SF Q | Donor $/10 Bay Q |
|---|---:|---:|---:|---:|
| central | 0.1521400 | 0.6964000 | 6,572,893 | 1,435,956 |
| favorable | 12.19600 | 51.64000 | 81,994 | 19,365 |
| pessimisticPositive | 0.00004469000 | 0.0002498000 | 22,376,370,553 | 4,003,202,562 |
| nullGiftContribution | 0.000000 | 0.000000 | No positive ratio | No positive ratio |
| nullPhysicalOutput | 0.000000 | 0.000000 | No positive ratio | No positive ratio |
| centralDonorHarm | -0.04786000 | -0.003600000 | No positive ratio | No positive ratio |
| nullContributionDonorHarm | -0.2000000 | -0.7000000 | No positive ratio | No positive ratio |
| centralZeroHousingSpillover | 0.07714000 | 0.3964000 | 12,963,443 | 2,522,704 |
| favorableZeroHousingSpillover | 4.696000 | 21.64000 | 212,947 | 46,211 |

## Retained causal and resource boundaries

All gift-to-output contributions, resident shares and generic health utilities are explicit analyst judgments. Housing contribution already combines financing replacement, implementation failure and collaborator attribution; transit uses the same bundled concept. Do not add another probability to either. Heat retains its different explicit factorization and proportional funding sensitivity, not a proven linear funding-output law.

Actual policy/research fits remain valid: [housing-law implementation guidance](https://www.spur.org/publications/research/2026-06-30/california-housing-laws), [permitting reform](https://www.spur.org/publications/spur-report/2026-05-27/permitting-progress), and [Muni financial analysis](https://www.spur.org/publications/research/2026-03-26/taking-munis-vitals). They do not establish a funded physical-output pipeline or health effect. [Family Zoning](https://sfplanning.org/sf-family-zoning-plan) is already enacted baseline; the [$590M transit bridge](https://www.gov.ca.gov/2026/02/19/governor-newsom-signs-legislation-authorizing-590-million-emergency-loan-to-bay-area-transit/) is an already authorized public loan. Charter-dependent permitting proposals are not operating administrative pilots. No election-success probability is inferred.

Housing spillovers have plausible economic mechanisms but no measured utility mapping in this packet. Transit health depends on car/walk/cycle/no-trip substitution, access and injury; extra trips alone are not QALYs. Existing channel priors are net of their defined shared burdens; independently donor-induced harm is separately outside them. Null contribution and null physical output retain costs and zero health. Independent harm persists under complete contribution replacement. Ratios are null whenever aggregate health is nonpositive.

The model remains **donor-only**, not a complete resource or welfare CEA. Additional net implementation, construction, operations, appliances and time resources cannot vanish because public/private parties pay them. The unchanged $1M resource stress is a diagnostic, not an empirical cost estimate. Central full-stress ratios are $72.30M SF/$15.80M Bay; favorable $901,935 SF/$213,013 Bay. Zero-spillover favorable resource stress is $2.34M SF/$508,318 Bay. Ordinary fiscal flows, rents, GDP and grants are not themselves QALYs; no invented healthcare savings are deducted.

## Verification
## Verification

Recomputed all nine scenarios from primitive inputs. **141 checks passed:** 36 annual-schedule integrals (housing/transit × two residence groups × nine scenarios) plus105 comparisons of all15 output fields for the existing seven scenarios. Original central/favorable/pessimistic/null/harm outputs remain unchanged within floating-point tolerance. Budget allocation sums to100,000; only one numerator is used. New sensitivities are separately tagged and excluded from core scenario choice. Source entries are preserved from v1 with inherited-access provenance; no primary-source re-fetch is claimed in this conversion.
