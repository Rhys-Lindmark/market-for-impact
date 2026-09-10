# Marin Treatment Center — publication audit

Status: independent research audit accepted; integration and release checks in progress. Not yet counted as published. Baseline: 68/115, latest main `1e13b22590b16bb460f5d8d201250e00a665b43f`. Session began 2026-09-10T18:11:24Z. Root integrates; new_eyes_report68 authors; high_ev_pipeline independently reviews. HEPPAC is a separate concurrent report, not part of this branch.

## Required corrections

- Match the fiscal expense denominator to the historical County observation period. The 257 OTP clients are an 11-month County-contract measure, not demonstrated whole-organization annual unique clients or treatment person-years. Preserve the latest financial statement separately for funding-room analysis.
- Separate methadone and buprenorphine evidence. Do not apply the methadone mortality difference to an unknown medication mix. Treat retention and causal transfer as explicit judgments rather than observed MTC outcomes.
- Calculate finite survival-adjusted health using a stated horizon, competing/recurrent mortality, utility, and discounting. Merely labeling 15–25 QALYs as finite does not establish the calculation.
- Separate retrospective resource accounting from a conditional marginal-donation model. Annual expense divided by historical clients is not an offered marginal treatment price. Any proportional-funding assumption needs explicit capacity, replacement and additionality limitations; missing marginal gross-resource data stays unknown.
- Assess the entire organization, retaining the cost of unquantified services and explaining major omitted benefits. Do not call the quantified OTP component the complete health value of all services.
- Missing SF beneficiary residence is unknown, not measured zero. Bay attribution may be a reasoned judgment but must not be described as observed allocation.
- Include an explicit no-additional-benefit case and distinguish a donation HOLD from a research-publication failure. An unfavorable estimate alone is not grounds to withhold a substantive report.

## Accepted research evidence

Independent audit accepted the final finite-survival model: 2.842/5.875/9.915 QALYs per averted death across scenarios, a genuine null scenario, matched fiscal-period accounting, separate treatment/access/funding assumptions, stated prior rationale and unknown verified marginal prices. Conditional weighted ordinary-gift estimate is $7.133M/10 QALYs overall, central $24.213M, upside $1.300M. Full donation cash stays in the numerator. Bay geography remains a judgment; SF is unknown.

Root added independent geometric-series parity, zero-funding guards and cost-boundary tests; all three pass. The test's initial first-year discount exponent was corrected to match the inspected midpoint-timing convention, without changing the accepted model.

## Release evidence still needed

- Integration tests, report/API agreement, production build and affected responsive interactions.
- Exact-commit deployment and canonical route verification before incrementing the count.

The previous cleanup-only turn reverified an already shipped change; it did not advance the report count. This phase must produce audited research rather than repeated status or screening.
