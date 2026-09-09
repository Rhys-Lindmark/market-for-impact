# Fistula Foundation independent audit

2026-09-08. Status: ACCEPT corrected packet as conditional research, not a verified marginal offer or validated net-societal estimate. All material corrections below are resolved.

## Material corrections identified

1. Initial clinical anchor used followed-patient 57% dry and 35% residual-incontinence rates while claiming lost/unclassified outcomes received zero benefit. The [primary Nielsen abstract](https://pubmed.ncbi.nlm.nih.gov/19459865/) reports 44 operated, 38 followed, with classified urinary counts 21 dry, 13 residual, 3 persistent. Author agreed to 21/44 and 13/44 full-cohort rates: lost and unclassified patients then genuinely receive no durable improvement. This is a source-denominator correction, not threshold tuning.
2. Initial calculator accepted a missing utility input and returned NaN health with status zero; finite extreme gift/cost inputs overflowed. Author agreed required-input and finite-output guards, plus tests.
3. Initial report lacked required model.giftHeading. Author agreed addition and full schema verification against CharityResearchReport.tsx.

## Checks already completed

Independent 20,000-step integration of discounted finite survival/decay and independent episode/utility/resource reconstruction passed 105 assertions across the original 15 scenarios. Full gift remains in donor denominator; administration/fundraising and all nominal repeat/tear operations are costed. Distinct-episode haircut avoids duplicate durable-health streams. Tear benefit is excluded while episode harm is retained. Dry/partial utilities are explicit gains relative to untreated health, not conversion of questionnaire scores or DALYs.

Five-year central advantage truncates health at later counterfactual treatment rather than extrapolating lifetime cure. Funding replacement and later repair are distinct counterfactuals. Procedure harm must include all operations in a unique episode; charging full current harm without subtracting delayed counterfactual surgery harm is conservative. Independent harms survive zero activity.

Overseas direct health is separate from zero modeled SF/Bay direct health and unknown uncredited local indirect effects. Both donor and gross-associated-resource ratios use the same signed all-region health; nonpositive health must not produce a positive ratio. Gross resources are visibly not net incremental societal costs: external hospital/patient/family resources are added to all nominal surgeries even with donor replacement, and released/delayed no-gift resources are not netted out. This restricted claim is acceptable; do not promote the denominator to validated full net societal spending.

Primary [2024 report](https://fistulafoundation.org/wp-content/uploads/2019/03/FF_Annual-Report_2024_PR5_24-Pg_Reader-Spreads_250708_Reference-1.pdf) text independently confirms $19,726,107 full expenses and 16,587 surgeries (one-based PDF pages 11 and 6). $624 promotional treatment price is not substituted for whole-organizational cost. Annual accrual/output mismatch and current marginal uplift remain explicit priors. The [2022 quality-of-life study](https://pubmed.ncbi.nlm.nih.gov/35178255/) abstract search result supports ongoing morbidity, not causal absence of surgical benefit. No verified current incremental tranche; funding room remains unknown.

## Final corrected-packet acceptance

Author regenerated all 15 scenarios with 21/44 dry and 13/44 partial central probabilities, added required giftHeading, required every numeric input and rejected nonfinite arithmetic outputs including finite-input overflow. Full-episode repeat-operation harm and conservative delayed-harm treatment are now explicit. No compensating parameter retuning occurred.

I reran the author self-check: 3,276 checks pass, including 1,000 finite-domain cases. An additional 358 independent checks pass across actual required report schema, every scenario's 20,000-step numerical finite-health reconstruction, episode/utility/resource arithmetic, SF/Bay direct-zero semantics, positive/null ratios, missing-every-key rejection and extreme-input rejection. Saved/report/calculator parity passes the author tests. No remaining material correction.

Corrected central: 13.108625232105014 net overseas QALYs; donor $76,285.6502717652 and gross resources $101,944.03448427646 per 10 QALYs. The gross-resource central is above $100,000. SF/Bay direct health remains zero with unavailable positive ratios; indirect local health unknown/uncredited. Preserve these denominator and geography labels on integration.

Stable files audited: /private/tmp/mfi-fistula-model.json, calculator.mjs, results.json, report-content.json, review.md, self-check.mjs (all with mfi-fistula- prefix). No Site/repository changes.
