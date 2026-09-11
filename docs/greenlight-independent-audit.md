# Greenlight Clinic independent audit

Final decision: ACCEPT for exploratory publication; HOLD giving. Author completed both bounded corrections below, independently rechecked. No clinical or cost coefficients were retuned.

## Primary checks

Read original decoded FY2024 Form 990 and compared source identity/period: January 1–December 31, 2024, submitted November 12, 2025. Whole expense $345,616, program $318,951, administration $26,665, government grants $20,800. Part III says 75–80 young people each week, not annual unique courses. Part I/W-3 says 22 employees; Part III describes volunteer clinicians. The report preserves this inconsistency, does not assume all labor donated, and does not infer a recurring public grant from the $20,800 classification. No deficit-as-funding-gap error found. [Primary filing](https://projects.propublica.org/nonprofits/full_text/202503169349303990/IRS990).

Current [clinic site](https://www.greenlightclinic.org/) confirms Bay residents ages 14–26, individual/couples/groups, clinician training and current virtual sessions. This supports local scope but not precise 98% residence, CBT fidelity or present marginal slots. Report correctly labels FY2024 cost as a historical proxy rather than 2026 budget.

Independently read [Dickerson trial economic paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC5810604/): 212 ages12–18 with depression declining/discontinuing antidepressants; CBT plus usual care versus usual care. Reported 12-month effect 26.8 depression-free days and .067 QALY. Methods state .4 utility decrement; simple 26.8×.4/365=.02937 differs. The discrepancy is real in the published text but its cause is not established; do not label it a proven paper error. No direct .067 transfer is made. Supervised CBT, diagnosis and age mix differ from Greenlight; imminent suicide risk excluded. Base utility-duration remains an explicit judgment, with DFD sensitivity, not validated local treatment effect. [IMPACT trial](https://pubmed.ncbi.nlm.nih.gov/27914903/) is an active-comparator counterweight, not evidence therapy never helps versus no access.

## Model and exact checks

21 existing tests pass, including exact saved results. Whole expense retained. Central throughput 77.5×48/24×.9=139.5 annual episode equivalents, not observed unique completed courses. Cash additionality, alternative-access additionality and benefiting fraction are separate declared assumptions; no second CBT completion multiplier is added. Benefit duration is finite .25–.75 years in positive worlds, no mortality or lifetime projection. Harm remains signed and is deducted before Bay attribution. No favorable-output tuning requested.

Weighted Bay health per $10,000: .028286302572797566; $3,535,280.008500235/10Q. Favorable10% contributes87.07% of signed benefit; removed/renormalized price approximately$24.60M. DFD sensitivity approximately$7.61M. These are judgment-driven diagnostics, not calibrated probabilities or purchasable marginal returns. Broad whole-gift cost is preserved; external resource cost remains unknown.

## Material corrections requested

1. **Validation:** `calculate({wholeExpense:Number.MIN_VALUE})` returns NaN weighted health; setting all world `weekly` to Number.MAX_VALUE also returns NaN. Finite input alone does not ensure finite derived outputs. Add explicit worlds-array/object and unique nonempty-id validation, plus finite guards on episode counts, health and aggregate results; reject overflow/underflow-induced invalid results. Add regression tests. Preserve entire default snapshot exactly. This is necessary for a portable user-input model, not coefficient retuning.
2. **Rendered evidence completeness:** existing evidence has correct key/design/population/result/transfer shape, but clinical row says “See clinical ledger” without a rendered ledger. Include a concise actual trial population/comparator and .067 versus26.8DFD/.4 mapping explanation directly in evidence, and a separate IMPACT active-comparator row. The external source ledger alone should not carry the decisive disconfirmation. No full new review needed.

Other presentation: spacing is compressed in many draft strings; root may mechanically format for readability without altering numbers. No dependency/render installation needed for this audit. Donation URL is official general giving, not proof of an accepted marginal restriction.

## Timing and provenance

Observed wall interval 2026-09-11 07:10:40–07:14:23 UTC (3m43s), including correction coordination and waits; active effort unmetered. Final 29 tests pass, including entire default saved-output deep equality and malformed/overflow regressions. Independently reran MIN_VALUE/MAX_VALUE reproductions: now reject. Correctly shaped clinical_cbt and clinical_impact entries now render explicit trial/mapping and active-comparator evidence. Exact price unchanged $3,535,280.008500235. Parent-confirmed gpt-6-astra / low. Space Saver applied: existing files/runtime read; no installs, Site edits, outreach, nested workers or previews.
