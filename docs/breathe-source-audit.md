# Breathe implementation acceptance — September 7, 2026

Independent research audit: sf_research_audit; root reproduced models and integrated citations. Full source list and retrieval dates are in data/san-francisco/breathe-cea-v1.json. This accepts an inspectable conditional model, not an available SF funding offer.

- Adult central: USD200 per enrolled person, .03 additional six-month quit probability × .5 discounted lifetime QALY/quitter × .5 post-quit health transfer × .5 funding additionality = .00375 QALY; USD533,333 per10 QALYs. The six-session budget is constructed, not quoted. Medicines and other payers are excluded; adding USD100 yields USD800,000/10Q.
- External Txt2stop calibration already includes relapse, future background quitting, population weights and3.5% discounting. Do not multiply another duration, relapse or death credit. It does not establish local group-course efficacy. The provider's uncontrolled six-week headline is not a causal six-month quit rate.
- Childhood asthma is separate, not a second organization or additive benefit. 24.4 symptom-free days /365 × .1 utility ×1 equivalent year ×.5 transfer ×.5 financing = .00167123 QALY, USD5,983,607/10Q at USD1,000. Utility and costs are judgments; only symptom-day anchor is trial-based. Favorable duration corrected from unsupported two years to one: USD253,472/10Q.
- Added primary 2024 Philadelphia trial:626 children, no between-group asthma-control advantage at12months. Different intervention/population, not a direct Breathe trial.
- DHCS pages21–24: existing APS covers education/assessment; fromJanuary2026 these no longer sit in Asthma Remediation Community Supports. Supplies/modifications remain distinct. Coverage is not access or a marginal philanthropic gap.
- SF cessation cohort, legal gift recipient, marginal capacity and medicine payer remain unverified. Local asthma delivery has stronger directory support. Free Kick It California is part of usual care.

Verification:256 unit tests; lint and production build; eight phone/tablet report, ranking and homepage checks passed. Native workbook Sep7ResearchModels A296:E316 formulas and calculated central outputs match both JS models; input layout visually inspected in separate Codex browser. Null/harm and invalid-input tests preserve no-positive-price behavior. Full GitHub gate and public release remain required.

Next evidence: named SF course and itemized marginal budget; causal sustained quits among all enrollees; child preference-based utility and actual uncovered access bottleneck.
