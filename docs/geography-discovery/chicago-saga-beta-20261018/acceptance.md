# Saga Education (Chicago, in-depth): source and model audit

Auditor: claude-opus-chicago-beta-audit (Claude Opus 5.5), in a separately timed source-audit interval. **This is the same AI model as the author, not an independent second agent.** The user directed Claude to complete the full review itself.

## Source checks (all pass)

These figures were string-matched against the extracted text of IPR WP-21-12 (Guryan, Ludwig et al.):
- Samples: 2,633 and 2,710 students.
- Math effects of 0.16 SD and 0.37 SD; pooled 11th-grade effect 0.22 SD, with a 0.18 GPA-point gain.
- Math grade gains of 0.56 and 0.42 points; math course failures down 49% and 44%.
- Graduation +1.9 points (interval -4.8 to +8.6).
- Cost of $3,800 per participant; six percentile points for study 1; Chetty et al. at $150 per percentile.

Annual-report figures (3,083 Direct students, 29 schools, three regions, $5.6M philanthropy) come from saga.org. The Form 990 expenses come from the ProPublica API. Arnold Ventures' Top Tier rating was confirmed on evidencebasedprograms.org/programs.

## Model checks

- The gross gain reproduces the authors' own mapping: 0.22 SD × 37.5 percentiles/SD × $150 = $1,238 in 2010 dollars, or about $1,819 in 2025 dollars. The authors' figures were $900 (study 1) and $2,100 (study 2).
- Discounting runs from age 15 to earnings at ages 25 to 59, matching the authors' window. Pass.
- Health is zero; graduation is not added on top of earnings, so nothing is double counted. Pass.
- The `calculate.mjs` scenarios reproduce the report: central $1,210,842 per better life, about $121K per DALY.

## Clarifications retained

1. The FY2023 expense and the 2024–25 student count come from different years. Expenses have risen each year, so the cost per student could be understated. Charging all Widespread work to Direct students pushes it the other way.
2. The 0.5 causal share of the test-score-to-earnings association is a judgment, and it is the dominant uncertainty: the estimate ranges from $61K to $242K per DALY across 1.0 to 0.25.
3. No adult outcomes were measured.

## Decision

Accepted as a Chicago in-depth (beta) report. At about $121K per DALY, the central estimate would rank first in Chicago, ahead of Chicago Recovery Alliance (about $264K). Because that ranking rests on an inferred, not measured, earnings effect, the report states this prominently.

## Revision audit (deeper research, same day)

Same-model, separately timed audit of the revision requested by the user.

- **Cost:** FY2025 total expense ($25,426,248), deficits (-$11.5M in FY2024, -$6.7M in FY2025), net assets ($12.6M) and program revenue ($5.1M) were read from ProPublica's Form 990 summaries. Expense and student counts now cover the same year. The Widespread weight of 0.1 is a judgment, so whole-to-Direct ($8,247) and co-founder-cost ($3,875) scenarios bracket it. Pass.
- **Dose:** About 70 hours (2024–25 annual report) against about 120 in the trials (40 minutes daily over ~180 days, from the paper's "one class period every day" and "40 minutes of tutoring"). Transfer lowered from 0.8 to 0.6. This is a judgment, because dose-response is unmeasured. Pass.
- **Causal share:** The quasi-experimental Chetty-Friedman-Rockoff result (1 SD of teacher value-added = 0.12 SD in math and 1.34% earnings) implies 11.2% per SD, or $860 a year for 0.22 SD at $35,000. That is 0.47 of the percentile mapping, which supports the 0.5 used. The Bailey/Watts/Hart meta-analysis (EdNext, 2026) supports treating the link as uncertain. Pass.
- **Graduation cross-check:** 1.9 points × a diploma premium under 5% is negligible, so the estimate relies on broader skill effects. This is disclosed.
- **Result:** central $1,015,788 per better life (about $102K per DALY), replacing $1,210,842 (about $121K). The first review is retained as the `previous-review-20261018` scenario. Saga still ranks first in Chicago.
