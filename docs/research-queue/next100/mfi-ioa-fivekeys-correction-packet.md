# IOA / Five Keys funding-boundary correction packet

Audited 2026-09-08, read-only, against `work/market-for-impact-research-index` under `/Users/rhyslindmark/Documents/Codex/2026-08-29/okay-you-re-gonna-make-this`. Compared the actual native models, bridges, report adapters, registry and model tests with `/private/tmp/mfi-funding-correction-queue.md`. No Site files changed.

## Decision

The queue is materially correct. Both existing central and pessimistic calculations reconcile. Neither model numerically accounts for funding replacement. Their health-transfer discounts do not do that job. Minimal justified correction: retain the numerical resource scenarios, remove misleading donor-price/extra-allowance wording, and label their implicit funding additionality of 1 explicitly. Add separate funding sensitivity, rather than quietly inserting an evidence-free haircut. Verified current funding room remains unknown, not zero.

If the product insists on a single donor-adjusted central rather than a conditional resource benchmark, a new additionality coefficient is a substantive analyst decision. Sources establish payer overlap, not its magnitude; 0.5 is permissible as a declared judgment but is not an audit-derived estimate. Do not present the following illustrative sensitivity as newly measured evidence.

## 1. Institute on Aging

### Cost correction

`institute-on-aging-cea-v1.json` input `marginal_cost_per_participant_usd.basis` claims a modest non-call allowance. Yet 52 calls × 20 minutes / 60 × $60 = **$1,040 exactly**. Change the basis to: “52 assumed calls × 20 assumed minutes including notes × a $60 assumed fully loaded resource-hour rate. The loaded rate includes allocated supervision, volunteer management, training, technology and overhead; no separate non-call allowance is added. This is not an IOA quote or verified marginal cash cost.”

Do not add another support uplift when the $60 rate already claims those components. The $600 and $1,560 endpoints are independent whole-course cost scenarios, not joint products of every listed low/high operating input. Label this explicitly: the listed extremes would instead yield $260 and $2,925. No numerical correction is needed to the chosen cost scenarios themselves.

### Arithmetic and counterfactual

Health per newly delivered participant = remission probability × observational utility gap × retained health share × effective duration. Central: .07 × .04 × .5 × .5 = .0007 QALY. Favorable .12 × .04 × 1 × 1 = .0048. Pessimistic .02 × .04 × .25 × .125 = .000025.

| Case | Cost | Q per delivered participant | Existing fully-additional USD/10Q |
|---|---:|---:|---:|
| Favorable | 600 | .0048 | 1,250,000 |
| Central | 1,040 | .0007 | 14,857,142.857143 |
| Pessimistic positive health | 1,560 | .000025 | 624,000,000 |

With the same gross outlay and additional-delivery share `a`, donor-attributable Q = `a * Q`; price = `10*C/(a*Q)`. At `a=.5`, the central is $29,714,285.714286 and pessimistic $1,248,000,000; at `a=.1`, $148,571,428.571429 and $6,240,000,000. At `a=0`, additional benefit is zero and no finite positive price exists. Do not lower donor outlay merely because replacement occurred. Health harm, if modeled later, belongs inside the funded net-effect term for identical replacement; independent fundraising burdens are separate.

The .5 retained utility share addresses confounding and mapping, not displacement. The .07 remission estimate already addresses program causal uncertainty and incomplete participation; do not apply scheduled-call completion or pilot retention again without redefining the estimand. Effective duration is already integrated onset/persistence, not a full-year bonus.

[Current IOA Friendship Line page](https://www.ioaging.org/friendship-line/), retrieved September 8, explicitly offers outbound intake, uses staff and volunteers, and identifies partial SF Disability and Aging Services and California Department of Aging support. It does not give an incremental participant price, available funded capacity, or share a donation would replace. Open intake is not evidence of a waiting list or funding gap.

### Minimal public-copy replacement

“Our conditional resource-cost estimate is about $14.9 million per 10 QALYs, assuming the modeled resources create fully additional proactive-call capacity. Actual donor cash cost and replacement of existing public or health-plan funding are unknown. The $1.25M–$624M range varies positive health and resource assumptions; it does not bound funding displacement.”

Keep the model useful; do not turn unknown additionality into a claim of no value. Conversely do not label the conditional estimate a verified donor price.

## 2. Five Keys Independence High School

### Accounting verified; donor conversion conditional

[FY2024 audit](https://www.fivekeyscharter.org/s/2024-06-GSAFAC-0000362373.pdf), printed pp18,24,26 (PDF pp20,26,28), verifies annual ADA 2,232.74 and FKIH expenses $30,984,984 education + $6,228,634 management/general = $37,213,618. Ratio **$16,667.24204340855 per annual ADA-equivalent** is correct. It is neither SF-only nor cost per unique student or completed student-year. Keep historical annual ADA paired with that fiscal year's expenses.

[2025–26 FKIH LCAP](https://www.fivekeyscharter.org/s/2526_INDH_LCAP.pdf), physical pp1,4–6, reports P2 ADA 2,484.28, and CSI-funded graduation-support activities. This is a newer planning/implementation source, not a matching replacement for FY2024 annual ADA. It does not establish a currently unfinanced donor expansion. Preserve older LCAP citations for their correctly dated historical GED observation.

Central Q per ADA-equivalent = .10 additional credential × .34 discounted lifetime Q per induced credential = .034. Native health transfer retains 20% of the external 1.7-QALY graduate model; this is not a funding adjustment.

| Case | Credential effect | Q per induced credential | Existing fully-additional USD/10Q |
|---|---:|---:|---:|
| Favorable | .20 | 1.7 | 490,213.001277 |
| Central | .10 | .34 | 4,902,130.012767 |
| Pessimistic positive health | .05 | .05 | 66,668,968.173634 |

At unchanged gross cost and `a=.5`, central is $9,804,260.025534 and pessimistic $133,337,936.347268; at `a=.1`, $49,021,300.127672 and $666,689,681.736342. Pure identical replacement gives zero incremental health, not the original central value.

For a future real offer, use `donor_cost = incremental_resource_cost - incremental_non_donor_financing` for genuinely induced delivery, then `10*donor_cost/(additional_delivery_share*credential_effect*Q_per_credential)`. Public financing is not automatically replacement: new enrollment may trigger new reimbursement and lower the cash gift needed, while a gift financing already-budgeted instruction may add no delivery. Define these as distinct counterfactuals, not a single public-funding percentage applied twice. Neither reimbursement nor additionality can be inferred from schoolwide revenue shares. Resource perspective should retain total incremental resources even when donor cash is lower.

Minimal public label: “Historical gross-resource scenario for fully additional FKIH instruction; not a verified marginal donor price.” Keep the school identity and multiple-county scope adjacent to the estimate.

Additional factual defect found: `five-keys-review-v1.json:model.nativeOutcome` still requires remaining out of custody for 24 months. The implemented native model counts an additional credential only and explicitly excludes recidivism. Remove the custody requirement from that stale field; do not silently add a joint success denominator.

## 3. Exact implementation footprint

All paths below are relative to the audited worktree; these are instructions for the owner, not edits performed here.

**IOA:** `data/san-francisco/institute-on-aging-cea-v1.json`: cost input basis/label, `bottomLine.interpretation`, `fundingRoom.boundary`, optionally explicit additionality input and formula. `institute-on-aging-qaly-bridge-audit-v1.json`: `decision`, `modeledBridge.modeledDonorCostPerParticipantUsd` label/basis (retain key for minimum compatibility), `formula`, `nullBoundary`, and separate funding sensitivities. `institute-on-aging-review-v1.json`: `model.qalyBoundary` and any marginal-price wording. `app/charities/institute-on-aging/page.tsx`: hero/detail and qaly headline; change `donor_cost` display label “Modeled donor cost” to “Assumed full-resource cost.”

**Five Keys:** `data/san-francisco/five-keys-credential-cea-v1.json`: gift/native interpretation, `fundingRoom` and new LCAP source; preserve FY2024 cost keys. `five-keys-credential-qaly-bridge-v1.json`: `decision`, `modeledBridge.formula/nullBoundary`, explicit additionality sensitivity; replace unqualified “judgmental donor estimate.” `five-keys-review-v1.json`: `model.nativeOutcome`, current funding context/source and `model.qalyBoundary`. `app/charities/five-keys/page.tsx`: headline/summary conditional cost perspective (gross-cost input label is already sound).

**If numbers change:** bridge `sharedDenominator.publishedPriceUsd`, `modeledBridge.bestCostPerTenQalysUsd`, `costPerQalyUsd`, `positiveEffectRangeUsd`, `sensitivity[*]`; IOA also `qalyPerParticipant` if redefining it as gift-attributable instead of delivered-person health. Preserve explicit distinction, preferably add `qalyPerFundedEquivalent` rather than silently changing units. If native donor-effect tables change, update native `bottomLine`, all `sensitivity` rows and formulas too. Report price hardcodes and review/index prose must follow.

**Downstream:** `data/san-francisco/city-registry-config-v1.json` costPerspective; regenerate `city-registry-v1.json` using `scripts/lib/sf-city-registry.mjs` even for bridge-copy changes because its source SHA256 changes. The builder's `bridge` branch currently copies stored `modeledBridge.bestCostPerTenQalysUsd`, not independently recomputing it. `lib/research-cost-ranking.mjs` and `lib/sf-research-index.ts` consume registry prices; index still has price/range literals and detail copy to synchronize. City-theory/ranking order changes only if central changes. Rebuild external workbook through its owner; no workbook generator was located in this checkout, so no fabricated path is prescribed.

## 4. Acceptance tests

Current `scripts/sf-institute-on-aging-review.test.mjs` and `scripts/sf-five-keys.test.mjs`: **9/9 tests passed** using bundled modern Node. This validates current arithmetic, not additionality completeness.

Extend these actual files with: central cost decomposition; endpoints independently reconciled; `a=1` reproduces existing values; `a=.5` doubles price without halving cost; `a=0` returns zero benefit and null/nonfinite price; health transfer fixed while only funding changes; gross-resource price unchanged by payer allocation; no double funding factor. If adding finite signed effects, test harm stays negative and no negative price is ranked as attractive. Test Five Keys native outcome contains no required custody endpoint. Retain factual/source/payer tests rather than weakening them.

`scripts/sf-city-registry.test.mjs`, `scripts/research-cost-ranking.test.mjs`: regenerate/hash consistency, canonical coverage and valid sort. `e2e/mobile-release.spec.ts`: IOA report test currently asserts $14.9M, $1.25M, $624M and .0007 QALY; Five Keys report test checks its native/bridge display. Update numeric assertions only when the selected central changes, and add visible fully-additional/gross-resource qualification and explicit unknown donor funding room. `scripts/sf-five-keys.test.mjs` also regex-checks report and index $4.9M literals. Do not merely alter tests to hide a numerator/denominator mismatch.

## Recommended release scope

Publish the copy/accounting fixes and visible funding sensitivities now, retaining historical/conditional central figures. If the owner elects donor-adjusted central figures, explicitly record the judgment, its date, and the counterfactual definition; the .5 results above are transparent arithmetic, not a source-supported new probability. No evidence in this audit warrants identifying either program as having a verified marginal funding offer.
