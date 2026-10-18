# FUF isolated modeling handoff — 2026-10-01

Implemented `/private/tmp/fuf-calibrated-model.mjs` and `/private/tmp/fuf-calibrated-model.test.mjs` only. Ready for root to import into `lib/` and `scripts/`; test import resolves either location. No checkout edits, frozen-engine changes, source-search interval, installation, dependency copy, server or publication.

Focused standalone test passed using existing Node24.18.0. Independent equations use `Math.log(1+x)` and negative-power discounts, not wrapper intermediate values; every case agrees with source proposal. Central health=.14748279238566356, income=.004084708908121619, price6597720.431253185. Fractions/finite values,15yr maximum health horizon, <=26paidweeks, signed null/harm, distinct SF/Bay health/income shares, once-only portfolio assignment and unknown-input guards checked. No probability weighting or extra survival attenuation accepted.

Annual burden correction is explicit: `burdenAnnualResourceWindowYears=1` is fixed/validated and describes one annual household-resource window. Independent receipt discount remains .25years. Burdens use exposed allocated participants, not successful/job-funded participants; replacement with B500 gives -.0009220115930543576 income-equivalent years and no positive price. Paid-week0 removes wage flow but not incurred burden. No separate six-month duration multiplier is applied to annual burden.

Scientific judgment basis exported separately from source-derived inputs; code/test correctness is not independent scientific/publication acceptance. Parent must challenge causal/local/remaining-life/netnew retention and temporary net household-resource assumptions. Whole expense allocation is not a price quote or complete societal resource cost.

Dedicated modeling interval: 2026-10-01T19:57:53.148Z–2026-10-01T20:00:24.637Z,151.489seconds/2.5248166667minutes. User-confirmed inherited GPT-6.1 Sol, no override or independent runtime metadata claim. Closed before idle/root integration. Existing phase baseline97MB checkout/29GiBfree; only compact isolated files retained.
