# GLIDE rental assistance: cost-boundary correction

2026-09-08. Read-only audit against `/private/tmp/mfi-top25-funding-first4.md` and `work/market-for-impact-large-bay-impact/` GLIDE model/report. No Site edits.

## Finding and recommended minimal correction

**The claim that the 20% uplift pays for delivery services absent from the $100,000 anchor is unsupported and risks double-counting. It is not possible to establish an exact duplicated dollar amount from the published narrative.** The prior funding audit directly inspected the primary report and found the historical cohort description includes case management and housing-stability workshops. The report is not an itemized grant/program ledger: it does not show whether every dollar of staff time, central overhead or other financed resource is included in $100,000.

**Recommended minimal correction: retain the existing $3,077 judgmental central cost, but reclassify the 20% strictly as an unverified current-marginal-cost contingency, not a separate charge for workshops/case management.** Preserve the no-uplift sensitivity and explicitly disclose that it may be the better cost anchor if the historical budget already captured delivery. This is not a new empirical justification for 20%; it preserves a conservative existing analyst allowance while correcting the false source attribution. A current ledger is needed to replace it.

Suggested exact replacement copy for report body and both model cost-basis fields:

> GLIDE's historical $100,000 cohort implies approximately $2,564 per assisted household. Its description already includes case management and housing-stability workshops; we do not treat those services as absent from the historical budget. Our $3,077 central cost retains an explicitly judgmental 20% contingency for uncertainty in today's marginal course cost—not a measured overhead rate or a second case-management charge. The no-uplift case uses the historical ratio, and $5,000 tests higher costs. None is a verified current marginal quote or complete resource-cost ledger.

Do not call it a documented inflation adjustment: the launch year is not a precisely dated cost cohort, and no inflation calculation was performed. Do not label $2,564 a verified lower bound either; future marginal costs could be lower or higher.

## Numerical acceptance and alternative without the contingency

Current health bridge remains .072 QALY per assisted household, separate from the native .02 shelter-entry effect. The cost audit supplies **no reason to change those effects or multiply the two models together**.

| Treatment of cost | Donor cost/case | Native central $/shelter entry averted | Central USD/10Q |
|---|---:|---:|---:|
| Minimal copy-only correction, existing rounded inputs | $3,077 | $153,850 | **$427,361.111111** |
| Exact historical ratio ×1.2, optional arithmetic normalization | $3,076.923076923 | $153,846.153846 | **$427,350.427350** |
| Remove contingency, exact historical ratio | $2,564.102564103 | $128,205.128205 | **$356,125.356125** |
| Remove contingency but retain current rounded raw input | $2,564 | $128,200 | **$356,111.111111** |

**No numerical change is required for the recommended minimum**, provided the contingency is labeled honestly. Current positive health range stays **$178,055.555556–$3,472,222.222222/10Q**, and native positive range stays **$51,280–$2,500,000** using current rounded costs. Neither is a statistical confidence interval; null remains possible.

If the manager instead chooses an entirely source-ratio central to avoid an unsupported uplift, use exact `100000/39` in a single calculator and update central to **$356,125.36/10Q**. The corresponding exact-ratio favorable bounds are **$178,062.68/10Q** and **$51,282.05 per shelter entry**; unfavorable bounds remain $3,472,222.22 and $2.5M. $100K then funds 39 hypothetical cases and .78 modeled additional shelter entries. The health denominator is 39×.072=2.808 Q per hypothetical $100K. Changing central downward by 16.67% is a modeling-policy decision, not a demonstrated empirical correction of exactly 20% duplicated costs.

## Exact affected fields and copy

1. `data/san-francisco/glide-rental-assistance-cea-v1.json`: input `marginal_cost_per_assistance_case_usd.basis` currently explicitly says add 20% for screening/workshops/case management/overhead. Replace it. Consider changing label from “Modeled marginal cost” to “Constructed donor cost per case” to avoid implying a quote.
2. `data/san-francisco/glide-rental-assistance-qaly-bridge-audit-v1.json`: `modeledBridge.modeledDonorCostPerAssistedHouseholdUsd.basis` repeats the same unsupported rationale. Replace it with consistent source-versus-contingency language.
3. `app/charities/glide/page.tsx`: `model.body` repeats it in public copy. `whyItMayWork` can describe services without implying separately priced costs. Current program page qualifies case management as available when capacity permits; do not promise it universally for every future case.
4. If numerical inputs change, update cached `bottomLine`, native `sensitivity`, `sharedDenominator.publishedPriceUsd`, bridge `decision`, `bestCostPerTenQalysUsd`, `costPerQalyUsd`, bridge `sensitivity`, and both cost ranges. The report contains hard-coded $154K/$427K summary/headline strings as well as computed values. Rebuild city registry/ranking/source hashes and dependent docs/workbook, rather than changing only one JSON value. No such edits were made here.

## Source trail and remaining limits

- [GLIDE Impact Report 2024–2025](https://www.glide.org/wp-content/uploads/2026/01/GLIDE-Impact-Report-2024-2025.pdf), physical PDF p7 / printed pp10–11: source for historical $100K/39 cohort, case-management/workshop description, and separate FY25 317-person/$965,254 headline. The preceding funding audit obtained direct PDF text; this audit's web fetch again failed on file size, so the exact cost-scope reading relies on that documented primary extraction. Do not pretend the report supplies a ledger or an audited marginal price. Do not merge the two cohorts.
- [Current Welcome Center page](https://www.glide.org/programs/welcome-center/), independently opened September 8: rental assistance for eviction, back rent and deposits; mandatory housing-readiness workshop; case management when available. This verifies program activities, not whether historical grant dollars funded every associated resource.
- [2016 Chicago causal study](https://pubmed.ncbi.nlm.nih.gov/27516600/) anchors the separate shelter-entry model, not the local delivery budget.
- [2024 VA temporary-financial-assistance model](https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2825636) anchors .144 external Q before local discount, not GLIDE's donor cost or funding room.

Keep Foundation social-service giving separate from Church giving. Historical sponsor funds and referral connections to Season of Sharing/Catholic Charities do not establish a new private funding gap. Donor cash, induced partner spending, public transfers and full resource cost remain distinct. This bounded correction addresses numerator provenance only; it does not endorse the VA utility assumptions or resolve missing current donor additionality.
