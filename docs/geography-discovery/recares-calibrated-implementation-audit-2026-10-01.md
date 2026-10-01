# ReCARES calibrated implementation: independent bounded audit

October 1, 2026. **Accept the numerical calibration, central/annual scope separation, report/index/API integration and economic interpretation, including parent's concurrent zero-geography fix.** An initially reproduced NaN geographic edge case was corrected during this audit. Newly added strict-equality regression initially failed on finite signed zero (−0 versus +0), a test/normalization issue rather than remaining nonfinite arithmetic. No product edits by the auditor.

## Independent reconstruction

Inspected `lib/recares-calibrated-model.mjs`, retained `lib/recares-v2-model.mjs`, API, Bay index, report, saved narrative, report page and research-time component/registry. Reconstructed arithmetic directly rather than trusting saved results:

- Marginal unique equivalents `11000 × .65 × 10000/72583 × .5 = 492.53957538266536`.
- Bay health `N × [.20×.50×.85×.03×.25 + .15×.40×.85×.02×.25 + .65×.30×.90×.002×.05 − .0001] × .95 = .37903259888679164`.
- Explicit income central 0; total same; price **$263,829.550000969**, SF **$835,460.2416697349**. Index imports the central row rather than a weighted diagnostic.
- Annual equivalents 7,150; Bay health **5.502264625**; cost **$72,583**; price **$131,914.77500048446**. Annual correctly omits only extra-gift throughput, not recipient counterfactual access.
- Independent small-positive calculation `.5 × N × .95 × .01 × log1p(45/50000) = .0021046597298830863`, implementation .002104659729883086; price $262,372.66952841805. Adverse income remains negative −.2340733544998881, price $689,849.0704952555.
- Signed weighted marginal .3401034178974416 / $294,028.21241318743; annual 2.72510291625 / $266,349.5736883255. Neither is silently substituted for the accepted central ranking.
- Complete health/income null keeps spent $10,000 and returns null positive price. Negative expense rejected; zero annual expense rejected; zero gift yields zero recipients/health/income and null prices. Negative-benefit cases retain sign and cost.

## Concrete defect

`sfTotalYears = totalYears × r.sfShare / r.bayShare` divides zero by zero when all scenarios set `bayShare=0, sfShare=0`. The retained prior accepts this geography and produces finite zero Bay/SF values, but the new wrapper returns `sfTotalYears: NaN`; JSON silently serializes it to null. Reproduced by cloning `scenarios`, setting both shares to zero, then calling `calculate({healthScenarios: changed})`. Other row totals remain zero.

Fix by directly computing SF from the unscaled health/income components with SF share, or explicitly returning zero when Bay share is zero (nested geography validation requires SF zero there). Add finite-tree assertion or direct regression test so NaN cannot masquerade as unavailable output. This must preserve default and zero-gift arithmetic. Parent notified immediately; no auditor product fix.

**Fix reinspection at 17:14:28 UTC:** parent now computes health/income before geography and multiplies each nested share directly. This removes division and NaN and preserves default arithmetic. Regression invocation passed the other six combined tests and the retained 56/56 legacy checks; its new zero-share strict equality failed only because adverse SF output is −0. Numeric −0 is finite and economically equal to 0, but the test expects +0. Parent notified to normalize zero or adjust the assertion; no remaining arithmetic publication blocker identified. This acceptance is a code/arithmetic audit, not a claim that a live render or new empirical measurements were verified.

## Economic/source and presentation checks

Positive purchaser share plus weighted unmet-health share is constrained to at most one. Income parameters are finite, baseline positive and consumption after loss positive; validation applies even with no exposed people. Adverse burden uses its own exposure share rather than requiring purchaser exposure. Positive welfare-offset sensitivity does not remove negative burden. No ordinary lifetime earnings after survival, retail equipment valuation as household income, or second donor-income subtraction is added.

Report clearly says 1% purchase, $45 payment and $50k baseline are external-transfer judgments, not local observations; nationally reported price gaps and Medicare coinsurance do not establish actual household payments. Zero net credit is an unidentified-sign judgment, not omission of the economic channel. Clinical utility and duration are transparent transferred judgments. Finances remain reported accrual expenses, not full societal resources or a priced expansion offer. Donor/accounting cost and resource benchmarks are separately labeled. Health-null/income-positive and adverse cases are exposed independently.

API imports accepted module, exposes scope and central-zero interpretation, retains null verified offer and source packet; it does not introduce an observed-effect claim. Long report and saved narrative are exactly equal. Summary states current central approximately $264k and historical values are labeled. Earlier reports/old tests remain historical rather than rewritten.

Timing concern initially raised from page `minutes=23` / `GPT-6 Astra Light` was **withdrawn** after inspecting `LongFormResearchReport`: its expanded display explicitly labels v1, v2 and Calibration sessions, and combined time groups sessions by model. October 1 Sol interval is recorded separately in `data/research-effort.json`, including this agent's earlier decision interval 16:46:27–16:52:31 UTC. Updated date does not silently relabel historical 23-minute V2 research as Sol calibration. No live browser/render inspection was performed in this bounded audit.

Bounded clocked inspection/calculation interval **17:11:51–17:13:17 UTC (1m26s), GPT-6.1 Sol**; subsequent test invocation and memo writing outside that interval, not padded to three minutes. Existing checkout/Node24 runtime reused under Space Saver/Token Saver; no installation/server/download artifact. Parent owns correction and publication acceptance.
