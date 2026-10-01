# Recalibrate existing in-depth reviews

Priority: **P0 — highest research priority.** Requested by Rhys on September 30, 2026 and explicitly resumed October 1. Recalibrate all remaining existing in-depth reviews before new geographic expansion or additional deep-review targets. The immediate Institute for Progress, 1Day Sooner and Foundation for American Innovation corrections are separate from this pending backlog.

## Resumed manager checkpoint — October 1

- Current phase: ReCARES evidence/calibration decision. Inventory reconciled and independently spot-checked; `recalibration_inventory` also delivered the separate ReCARES challenge. Manager owns acceptance and integration.
- Next action: resolve the ReCARES clinical/economic judgment and ranking-statistic gates listed in [the independent challenge](recares-recalibration-challenge-2026-10-01.md), then synchronize its report/list/shortlist/API only after acceptance. Continue HOPE, PHC and HSC next; no expansion ahead of this queue.
- Exit criteria: accepted complete inventory, then tested and synchronized health/income models per batch. Recalibration counts are separate from publication counts.
- Current allowance: 47% remaining at restart. Minimum reserve is **20%**, superseding previous thresholds. No new batch at or below 25% remaining; check before dispatch and every 15 active minutes. Never use reset credits.
- Continuity: existing hourly heartbeat resumed with PR #384 first, latest usage guard, no overlapping runs. Active expansion goal is retained, not replaced.
- Resource baseline: reused checkout 90 MB; filesystem 28 GiB free. No dependency installation, copied checkout or server started. Stall review after 20 active minutes without an evidence milestone.

## Why this takes priority

These model revisions exposed inconsistent impact coverage and cost boundaries:

| Organization | Initial | Subsequent health-only | Latest health + income |
| --- | ---: | ---: | ---: |
| Institute for Progress | $3.6M | $88.3M | $325K |
| 1Day Sooner | $3.2M | $63.8M | $9.0M |
| Foundation for American Innovation | $49.6M | $1.93B | $52.6M |

All figures are dollars per better life under the respective model version. These sequences are not confidence intervals, measured changes in effectiveness, or proof that the latest assumptions are correct. The latest denominator includes income-welfare equivalents, not only health QALYs. The next pass must audit coverage and consistency rather than aim for favorable rankings.

## Execution and acceptance order

- [x] Reconcile the 37-report snapshot against current beta, SF top-ten and explicitly accepted legacy re-reviews. [Inventory](recalibration-inventory-2026-10-01.md): 51 confirmed model identities, three already recalibrated, **48 pending** across 47 organizations. Legacy depth/provenance ambiguities remain listed and must be resolved before final coverage certification; distinct geographic models are preserved.
- [ ] Audit current top-four recommendations first, then ranking-sensitive and policy/systemic reports, then every other existing deep review. This queue takes precedence over new report production when work is authorized to resume.
- [ ] Establish a coherent annual-work or marginal-gift cost boundary for each report. Do not charge a full annual budget while arbitrarily discounting its benefits for an unspecified extra donation. Keep funding capacity as a separately evidenced question.
- [ ] For every report, show a ledger of health effects, income/consumption effects, overlaps, net costs, harms and unquantified channels. Include income in the headline when modeled; an explicit justified zero-income case is different from silently omitting economic benefits. Missing evidence must be labeled, not replaced by a claimed measured effect.
- [ ] Challenge scenario scale and stacked probabilities independently. Use empirical/base-rate anchors where available; distinguish a central judgment scenario from an empirically identified expected value. Do not force estimates to change or improve.
- [ ] Explain each old-to-new change by input, source, scope or arithmetic correction. Test adverse and zero cases, welfare weights, income baselines, cost duration, implementation failure and overlapping discounts; do not present joint stress cases as confidence intervals.
- [ ] Accept a batch only after independent evidence/arithmetic review and synchronized report/list/shortlist prices. Report recalibrated/remaining counts separately from existing publication counts.

Finish line: every reconciled existing in-depth review has a reviewed health-and-income model, clear historical comparison, reproducible tests and synchronized published prices. This PR queues the work; it does not certify those reviews as already recalibrated.

## Definition of done for each review

- [ ] Reconstruct the original price from its actual cost boundary and health denominator; identify which original assumptions remain unsupported.
- [ ] Update costs from the latest three available comparable returns and current workstream evidence. Keep operating expenses, program allocations, restricted cash and marginal funding room distinct.
- [ ] Rebuild native outcomes → additional causal outcomes → discounted health years, with explicit geography, uptake, duration, displacement, organization contribution and donor additionality. Check for multiplying the same uncertainty twice.
- [ ] Always estimate income/growth benefits alongside health using an explicit, sourced outcome bridge with judgment inputs labeled. Include these welfare-equivalent years in the headline and retain separate components. Check realization delay, transfers, incidence, displacement, non-overlap and zero/adverse scenarios; do not multiply trial savings by drug-approval probability. Unquantified value is not zero value.
- [ ] Compare original and revised central/low/high results and explain each material change. Unchanged values are allowed only with a documented reason after re-examination; a deeper-review label or longer prose is not recalibration. Numerical change alone is not evidence of improvement.
- [ ] Add reproducible arithmetic and scenario tests; verify the current estimate reaches report, list and top-four selection consistently. Preserve the initial estimate as a diagnostic, not an override of a revised finite central value.
- [ ] Record actual per-organization time and per-model identity. Have a separate reviewer challenge assumptions, sources, tail scenarios and funding capacity before accepting the correction.

Prioritize ranking-sensitive reviews, policy/systemic models and broad portfolios first; do not fill a target count by changing prose or inventing a measured impact. Work in small reviewed batches, preserve the user's latest 20% remaining allowance floor, and report reviewed/remaining counts. Resumption was explicitly authorized October 1; later user pauses take precedence.

## Original publication-cohort snapshot: 37 other reviews pending

The October 1 reconciliation adds 11 accepted legacy identities: minimum **48 pending** in the complete queue. The tables below preserve the original cohort, not the complete denominator. Inventory acceptance checks confirmed 30 beta rows, ten SF summary keys and explicit legacy acceptance memos. First [ReCARES diagnostic packet](recares-recalibration-2026-10-01.md) passed independent arithmetic challenge; **0/48 newly accepted recalibrations** so far. Public prices remain unchanged: financial comparability, clinical judgment, income incidence and ranking-statistic decisions remain required. Latest tests add independent income-versus-health and adverse cases; arithmetic acceptance is not publication acceptance.

### San Francisco: 0/10 recalibration passes

- [ ] The ReCARES Network
- [ ] HOPE Pacifica
- [ ] Project Homeless Connect
- [ ] Hearing and Speech Center of Northern California
- [ ] Compass Family Services
- [ ] Hamilton Families
- [ ] Friends of the Urban Forest
- [ ] MELP / AbleCloset
- [ ] Code Tenderloin
- [ ] San Francisco AIDS Foundation

### California: 0/10

- [ ] Youth ALIVE!
- [ ] Vision To Learn
- [ ] Walk San Francisco
- [ ] Center for Independent Living
- [ ] Coalition for Clean Air
- [ ] Western Center on Law & Poverty
- [ ] Harm Reduction Services
- [ ] Operation Access
- [ ] Champions for Health
- [ ] California School-Based Health Alliance

### USA: 0/10 other reviews

- [ ] Institute for Safer Trucking
- [ ] Center for Science in the Public Interest
- [ ] Kids and Car Safety
- [ ] Help America Hear
- [ ] Cribs for Kids
- [ ] End Overdose
- [ ] Surgery on Sunday
- [ ] Dental Lifeline Network
- [ ] Remote Area Medical
- [ ] American Nonsmokers’ Rights Foundation

### New York City: 0/3

- [ ] Bergen Volunteer Medical Initiative
- [ ] New Jersey Harm Reduction Coalition
- [ ] Parker Family Health Center

### Los Angeles: 0/3

- [ ] Lestonnac Free Clinic
- [ ] Urban Peace Institute
- [ ] Hunger Action Los Angeles

### Chicago: 0/1

- [ ] Chicago Recovery Alliance

### Inventory gate

- [ ] Before execution, reconcile this snapshot against every current `stage: beta` report, the SF top-ten summary registry, and legacy in-depth report/model files. Include legacy in-depth work outside those headline cohorts rather than silently dropping it; deduplicate reused organization research across geography while retaining distinct geographic denominators. Refresh the total and maintain artifact links as each recalibration is accepted.

Evidence inventory: `data/geography-reports.json`, `data/top-ten-summaries.json`, `docs/geography-progress.json`. This file records pending work, not completed re-audits or publication claims.
