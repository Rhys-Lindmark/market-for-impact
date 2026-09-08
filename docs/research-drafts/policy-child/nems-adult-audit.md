> PARALLEL RESEARCH DRAFT — not yet accepted for public ranking. Assumptions require owner review.

# Independent adult NEMS HBV implementation audit

Reviewed 2026-09-07. Read-only review of lib/hbv-retention-model.mjs, data/san-francisco/nems-hbv-cea-v1.json, docs/nems-hbv-source-audit.md and app/charities/north-east-medical-services/page.tsx in work/market-for-impact-hbv. No Site edits. This concerns adult registry re-engagement, not infant HBV prevention.

## Result

No arithmetic correction found. Independently executed implemented model: optimistic $41,393.94/10 QALYs; central **$1,201,090.59/10**, $807.7987895 discounted navigation cost/person, .00672554424 net QALY/person, .832576668 QALY/$100k; pessimistic $325,962,998.35/10. Central timing fraction=.4384711493. These match report rounding.

Recurring full staffing costs are charged throughout each funded duration; a closed initial cohort gets no replacement-patient health credit or attrition salary saving. The health allocation normalizes discounted weights against an already discounted lifetime total, avoiding an extra discount of that total. It is explicitly an unvalidated timing heuristic, not a disease-transition reconstruction. Finite-duration attribution remains a limitation: early care can cause later benefit, and later health cannot generally be allocated causally by truncating a generic curve. Report already discloses this adequately.

## One material wording correction

Clarify **clinically inactive HBV** versus **inactive/disengaged registry status**. The source starts participants in an inactive clinical disease state: normal ALT, no cirrhosis and no current antiviral indication under its modeled guidance. This is not synonymous with overdue or lost-to-follow-up. The report's phrase “initially inactive adult HBV registry patients” risks conflating them. Suggested wording: “The calibration starts with clinically inactive CHB; the proposed additional outreach concerns overdue patients. Applying the calibration to a mixed-severity overdue registry requires further case-mix adjustment.” Do not silently claim the source models the entire disengaged registry, particularly already treatment-eligible patients.

Primary verification: Starinieri et al.,2026, https://onlinelibrary.wiley.com/doi/full/10.1111/jvh.70176 (accessed2026-09-07; PMC access challenged, Wiley full text retrieved). Section1.1 supplies clinical-state definition. Tables2/3 support the monitoring rates and lifetime QALY anchor used. Reported abstract/results ICER differences and inconsistent combined-strategy QALY difference row are real; existing source audit accurately preserves them. No causal validation of the navigation effect was obtained by this audit.

## Funding, exclusions and donor takeaway

Tests, drugs, surveillance and other healthcare resources are explicitly excluded from donor costs, not treated as free resources. The estimate therefore cannot be presented as a societal ICER or directly substituted for the source's healthcare-perspective ICER. Current NEMS services/ReLink are correctly the counterfactual, and no verified SF restricted tranche is claimed. Null and net-negative health return no finite positive cost-effectiveness ratio; hypothetical $100k scaling is labeled an illustration rather than a purchasable tranche.

Current donor takeaway is appropriate: investigate additional targeted re-engagement; do not recommend an unrestricted gift on this calibration. The optimistic case does not justify overriding the central result. Fixed staffing capacity, funded duration, case mix and gift additionality need a concrete provider plan. No additional material corrections found in the four reviewed files.
