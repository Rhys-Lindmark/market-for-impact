# ReCARES: first P0 calibration packet

Status: **candidate arithmetic/evidence packet; independently checked, not accepted or wired to public prices.** Inventory is reconciled; this is not a completed recalibration. No new report is counted. See [independent challenge](recares-recalibration-challenge-2026-10-01.md).

## What changed in our understanding

The current list uses the central marginal health case, $74,720 per ten Bay QALYs. Its earlier independent audit instead specified the signed scenario-weighted price ($107,774 after the FY2025 update). The weights are subjective, not calibrated frequencies. Neither figure should be called empirically identified expected value. We must settle the common aggregation convention before syncing rankings, rather than switch statistics to improve position.

The current model is not the same incoherent full-budget/extra-gift construction found in some policy reports: it divides a bounded hypothetical gift by annual accounting cost per reported recipient, then applies a funding-response prior. Removing that prior without changing scope would overstate marginal throughput. The candidate therefore keeps two separate questions: annual-work accounting efficiency, and the original bounded marginal-gift illustration. It does not certify funding room, a linear response or a larger gift.

## Source refresh and limits

- [FY2025 original Form 990-EZ](https://projects.propublica.org/nonprofits/full_text/202621259349200012/IRS990EZ), directly fetched in memory October 1 (HTTP 200), continues to report the activity floor used by the previous model and accrual accounting. Earlier independently checked expense $72,583 and 2023–25 original filings are retained; this pass has not independently re-extracted every financial line or checked for a subsequent amendment.
- [Current operations](https://www.recares.org/about), [recipient instructions](https://www.recares.org/receive) and [FAQ](https://www.recares.org/faq) were reopened October 1. They support a real free-distribution service and availability constraints, not measured marginal output or household savings. The undated about page has a much lower historical activity floor than the dated return; do not average the two or claim contradictory exact unique-person totals.
- [WHO wheelchair guidance](https://www.who.int/publications/i/item/9789240074521) was reopened. Its assessment/training/follow-up requirements do not establish ReCARES utility coefficients. The prior controlled-evidence memo `docs/recares-utility-evidence.md` identifies null quality-of-life results in walking-aid trials; this packet reuses that evidence, not a fresh full-text clinical re-review.
- [Coefficient Giving's crosswalk](https://coefficientgiving.org/research/cost-effectiveness/) was reopened: $50,000 reference income and $100,000 CG per healthy year. Its logarithmic income valuation supplies a comparison method, **not** a ReCARES savings estimate.

## Health and economic ledger

Health: retain original deduplication, device mix, unmet need, safe use, utility and finite duration as transparent judgments for exact reconstruction. Test the previously recorded lower clinical family; do not silently treat the more optimistic family as newly validated.

Income/consumption: free equipment can preserve household purchasing power **only where a recipient would otherwise pay for an equivalent item**. A device's retail value is not automatically a cash saving; insurance reimbursement, foregone purchases and donated inventory must not be counted as new income. Model the counterfactual purchasers separately from the otherwise-unmet group receiving the health benefit. The candidate central assumption is 30% of deduplicated recipients, $50 net savings per recipient once in a one-year income flow, $20,000 baseline income. All three are **unsourced sensitivity judgments**, not measured recipient characteristics. The net saving is after acquisition travel and transaction costs; no wage, caregiver-time, avoided-admission or environmental bonus is added. A negative case charges $20 acquisition cost even with no purchase saving.

Transfers and cost: no resale proceeds, insurer savings or equipment sticker value are credited. Annual recognized organization expense remains $72,583; volunteer time and donated-equipment opportunity costs remain unvalued, so neither scope is a complete societal-resource analysis. The real resource-cost stress cases in the prior model must remain accessible. A household-saving transfer to donors/insurers could offset benefit; this is an unresolved incidence question, not a documented net gain.

## Reproducible candidate results

| Scope / scenario statistic | Health years | Income-equivalent years | $ per better life |
| --- | ---: | ---: | ---: |
| Existing marginal central, health only | 1.3383 | 0 | $74,720 |
| Marginal central, candidate household savings | 1.3383 | 0.1752 | $66,069 |
| Marginal signed weighted, candidate savings | 0.9279 | 0.0784 | $99,381 |
| Annual-work central, candidate savings | 19.4279 | 2.5440 | $33,034 |
| Annual-work signed weighted, candidate savings | 9.6315 | 0.7648 | $69,816 |
| Marginal central, lower clinical family + savings | 0.3790 | 0.1752 | $180,414 |

Annual-work comparisons remove only the funding-response throughput prior and charge the full annual expense; recipient counterfactual access and harm remain. They are **not new marginal donation offers**. The $74,720 → $66,069 comparison isolates added economic welfare at the same gift scope and same central health assumptions; larger changes arise from different clinical judgments or different cost questions, not evidence of a measured effectiveness change. These stress cases are not confidence intervals.

Run `node --test scripts/recares-recalibration.test.mjs`. Seven tests cover exact original marginal reconstruction, scope separation, signed harms/nulls, purchase/unmet overlap rejection, clinical/income sensitivity, independent health-null/income-positive and health-positive/income-zero cases, adverse acquisition cost, and invalid input rejection. Candidate module: `recares-recalibration-2026-10-01.mjs`. These additions address the challenger's arithmetic stress-case requests, not its substantive publication gates.

Independent fresh financial extraction found cash accounting in 2023–24 and accrual in 2025. The raw three-year expense arithmetic mean is $88,845, **not a reconciled comparable cash-cost estimate**. Original expenses and expense buckets match; the apparent decline in 2025 cannot alone establish efficiency gains. No inspected filing's amended checkbox was checked, but available indexes are incomplete, so no exhaustive amendment clearance is claimed. The independent memo contains the original source links and reconciled annual rows.

## Acceptance handoff

- [x] Independent challenger verified equations and sources; accepted diagnostic arithmetic only, not the chosen purchase share/baseline or public headline.
- [x] Fresh original extraction of all three annual returns and their amended flags; accounting change and incomplete amendment-index coverage explicitly recorded, not cleared as comparable.
- [ ] Re-examine clinical judgments against the existing controlled evidence; select or retain with explicit reasoning, not a forced price change.
- [ ] Resolve central-versus-weighted common ranking convention and give both statistics proper labels.
- [ ] Decide how to expose uncertainty in savings without turning arbitrary sensitivities into observed outcomes; keep zero and adverse income cases.
- [ ] Root integrates accepted narrative, model, timing and report/list/shortlist together, tests, then publishes. Until then public prices remain unchanged.

Timing: a specifically clocked root research/calculation interval ran 2026-10-01 16:31:14–16:33:48 UTC, GPT-6.1 Sol (2m34s). Earlier source inspection in this run was not fully timed and is not reconstructed. This is an internal packet, not the final report time. Integration/scheduling/inventory time is excluded.
