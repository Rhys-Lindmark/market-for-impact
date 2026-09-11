# Shared clinical-prior diagnostics: MELP/AbleCloset and ReCARES

Actual start 2026-09-11 01:20:15 UTC; completed 2026-09-11 01:21:50 UTC. Root-confirmed dispatch gpt-6-astra / low (Astra Lite). No base models/priors, Site files or external state changed.

## Results

All prices are donor dollars per 10 **Bay** QALYs for each model's $10,000 whole gift. These are diagnostics, not replacement forecasts.

| Target model and clinical swap | Central price | Signed weighted price |
|---|---:|---:|
| MELP original | $1,725,534 | $3,009,665 |
| MELP: ReCARES central clinical values in central scenario only | $572,533 | $2,117,236 |
| MELP: ReCARES matched clinical values in all three positive-benefit scenarios | $572,533 | $1,317,403 |
| ReCARES original | $128,892 | $185,910 |
| ReCARES: MELP central clinical values in central scenario only | $455,104 | $250,711 |
| ReCARES: MELP matched clinical values in all three positive-benefit scenarios | $455,104 | $507,197 |

“Positive-benefit scenarios” means the named cautious_positive, central and favorable scenarios, not a filter on positive net results. MELP cautious_positive has negative net health; it is still mapped because it contains positive benefit pathways. Cash-neutral, clinical-null, null and harm worlds are unchanged. None is discarded or renormalized.

Neither clinical family is empirically established. A common family changes both estimates materially: with ReCARES' family, MELP is $1.317M weighted versus ReCARES' original $186k; with MELP's family, ReCARES is $507k versus MELP's original $3.010M. Remaining differences reflect costs, service mix, additionality, populations, geography, harms and different subjective weights—not independently proven comparative performance. These diagnostics do not harmonize all uncertainty or prove one organization superior.

## Exact replacement maps

Categories: MELP `adult_mobility` ↔ ReCARES `mobility`; `bathing_transfer` ↔ `bathing_transfer`; MELP `consumables_other` ↔ ReCARES `supplies_other`. Pediatric_adaptive has no ReCARES counterpart and remains unchanged. Each cell is **utility, effective years**; only those two fields are exchanged.

| Scenario | Shared category | MELP family | ReCARES family |
|---|---|---|---|
| cautious_positive | mobility | .01, .10 | .02, .25 |
| cautious_positive | bathing | .01, .10 | .01, .25 |
| cautious_positive | supplies | .001, .03 | .002, .05 |
| central | mobility | .03, .25 | .05, .50 |
| central | bathing | .02, .25 | .03, .50 |
| central | supplies | .002, .05 | .005, .08 |
| favorable | mobility | .05, .50 | .08, .75 |
| favorable | bathing | .03, .50 | .04, .50 |
| favorable | supplies | .004, .08 | .01, .12 |

Central-only uses only the three central rows. All-matching uses all nine. Reverse diagnostics exchange source/target columns. Costs, gift size, plan realization, throughput/cash additionality, deduplication, category shares, unmet access, safe use, harms, Bay/SF shares and scenario weights are untouched. No additional loan-reuse multiplier or lifetime credit.

## Concise report-ready text

“Clinical assumptions are not directly calibrated to either charity. As a comparability check, replacing MELP's adult mobility, bathing and supply utility/duration assumptions with ReCARES' corresponding assumptions lowers MELP's signed weighted Bay estimate from $3.01M to $1.32M per 10 QALYs. Applying MELP's assumptions in the reverse direction raises ReCARES from $186k to $507k. These swaps preserve each charity's costs, delivery assumptions, geography, harms, scenario weights and MELP's pediatric pathway. They are sensitivity checks, not new preferred estimates or evidence of measured superiority. Neither set of utility/duration assumptions is empirically established.”

Optional narrower disclosure: “Changing only the central clinical scenario produces $2.12M weighted for MELP and $251k for ReCARES; the all-scenario check also tests the favorable tail.”

## Reproduction and verification

Pure portable helper: `/private/tmp/mfi-device-clinical-comparison-helper.mjs`. Exports `compare()` and `replacement()`; imports the two unchanged sibling model modules, with no filesystem or output writes. `compare()` returns exact before/after replacement maps, central/weighted Bay prices and health totals.

Run `node /private/tmp/mfi-device-clinical-comparison-test.mjs`. Tests passed. The test prints full machine-readable JSON to stdout without writing files. Checks verify only utility/years change; three categories map per selected world; pediatric/null/harm preservation; costs/mix/weights/geography preservation; no base-object mutation; and independent central diagnostic anchors.

The category correspondence is an explicit abstraction: ReCARES mobility/supplies are not proven to have the same recipients or item mix as MELP. That limitation is why these are diagnostics rather than evidence-based coefficient replacements. For future revision, generic clinical evidence should inform both families consistently, while genuine local timing and case mix can justify differences if documented.
