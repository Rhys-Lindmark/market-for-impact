# Per Scholas (NYC, in-depth): source and model audit

Auditor: claude-opus-nyc-beta-audit (Claude Opus 5.5), in a separately timed source-audit interval. **This is the same AI model as the author, not an independent second agent.** The user directed Claude to research these reports itself.

## Source checks

- Year-6 earnings of $38,404 versus $32,122 (+$6,281, 20%) and the WorkAdvance sample of 2,564: Arnold Ventures follow-up page.
- Bronx site sample of 349 + 341: DOL CLEAR three-year profile.
- Gains in years 2–5 and 7–8 and no year-10 effect: MDRC 10-year report page (September 2025).
- Operating cost of $5,700 per participant (net $3,500): What Works Growth summary of the MDRC cost analysis.
- CY2021–23 expenses ($36.1M, $55.0M, $62.1M): ProPublica API.
- Over 4,600 learners in 2023: Wikipedia, citing the annual report. This is secondary; Per Scholas' own report page did not load.

Removed in audit: course length (12–15 weeks) and learner-education claims, because they were not in the sources read.

## Model checks

- One pathway, years 2–8 (delay 1, 7 years), nothing after; the null year-10 result is respected. Pass.
- Causal factors (0.7 × 0.85) multiply once; edition share 0.9. Pass.
- Central about $90K per DALY; the trial-cost scenario is about $50K.

## Clarifications

The average gain ($5,000) is a judgment, because MDRC's per-year dollar impacts were not available beyond year 6. Whole-organization cost per learner ($13,497) is far above the trial's cost, so the scaled program's effect is the main risk.

## Decision

Accepted as an NYC in-depth (beta) report.
