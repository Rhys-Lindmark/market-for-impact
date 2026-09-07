# San Francisco giving — active phase plan

Updated 2026-09-07. Manager: current task. Research implementer: sf_research_audit (read-only evidence audit); Site edits and deployment owned by manager. Stall interval: 25 minutes of active work without accepted evidence.

## Phase 1 — concise SF front door

- [x] SF1 Homepage and /san-francisco show exactly four current picks with source-derived $/10 QALYs, evidence, and report links.
- [x] SF2 Preserve detailed research at /research and cross-cause market at /archive; verify navigation and canonical paths.
- [x] SF3 Pass relevant tests, mobile checks, lint, production build; merge and deploy the validated commit.

Accepted 2026-09-07: PRs #124 and #125 merged. Exact source f6965366c99aea9093e53581f888105950e4c166 published as Sites v101. Earlier verification: 181 tests, lint, build, homepage phone/tablet tests, route/navigation suite and GitHub mobile checks passed. Canonical production root, /san-francisco, /archive and /research returned HTTP 200, correct headings and no 390px overflow; both front doors contain exactly four picks. Canonical coefficient-grants API returned 200. Domain, base path and public access unchanged.

Exit: all three accepted with published canonical routes. Four current picks are GLIDE, Compass, Hamilton, Five Keys, by positive central modeled price. They are not verified marginal funding offers. No claim that all 25 reviews are completed.

## Phase 2 — finish the 25-priority review cohort

Dependency: phase 1. Each remaining program gets a dedicated report, explicit best-guess $/10 QALYs model with formula and sensitivities, source/assumption separation, and local funding constraints. A blank or failed-gate audit alone does not count as a completed model.

- [x] SF4 Resolve remaining EDC and Project Open Hand QALY endpoints. EDC accepted in PR #129 / Sites v103; Project Open Hand's existing narrow acute-morbidity endpoint remains $132.8M/10 QALYs.
- [x] SF5 Model existing initial reviews: Harm Reduction Therapy Center, Homeless Youth Alliance, Huckleberry Youth Programs.
- [ ] SF6 Review and model JCYC, Larkin Street, Lyon-Martin, Mission Neighborhood Centers.
- [ ] SF7 Review and model New Door Ventures, Openhouse, Progress Foundation, Richmond Area Multi-Services.
- [ ] SF8 Review and model Self-Help for the Elderly, Tenderloin Housing Clinic, United Playaz.

Exit: 25 inspectable reviews/models, or exact unresolved variables documented after meaningful research; no invented evidence or claimed precision. Update shared workbook when a model changes and verify formulas.

## Phase 3 — urban policy organizations

- [ ] SF9 Add dedicated SPUR, GrowSF, Housing Action Coalition research pages; preserve entity and program boundaries, evaluate non-electoral public-benefit mechanisms, and label attribution assumptions.

Research in this phase may proceed independently of phase 2. Exit: inspectable program theories and quantitative scenarios where defensible; no election-result-to-health causal shortcut.

## Phase 4 — city cost-effectiveness theory

Dependency: completed phase 2 research. Compare cash-gap prevention, treatment, education/employment, and policy mechanisms by cost, severity, durable benefit, reach, attribution, and displacement. Test shared assumptions and excluded benefits before claiming a 100× advantage.

- [ ] SF10 Publish synthesis with ranked hypotheses, counterexamples, and the next candidate search priorities.

## Expanded search — user steering 7 September 2026

- [ ] SF11 Add and screen ten unconventional programs with source-confirmed SF delivery or an explicit missing local partner.
- [ ] SF12 Screen the ten mechanism-first research bets in [sf-research-bets.md](sf-research-bets.md): first hypothesize a cheap causal route to health gains, then find a local implementer, then test whether it holds. This label is a research priority, not an effectiveness endorsement. Discovery queue recorded; program models remain unfinished.
- [x] SF13 Deepen the best candidate for under $100,000 per 10 QALYs ($10,000/QALY), starting with overdose prevention. SFAF conditional model and report accepted in PR #128, Sites v102, canonical report and model API verified. This completes the investigation deliverable, not verification of an available funding offer; issue #127 tracks the missing incremental reach and repeat-recipient evidence.

Expanded search may proceed alongside the 25 reviews. Synthesis must account for the expanded findings and must not claim 100× differences based only on correlated assumptions or unlike model perspectives.

## Recovery state

Current phase: 2, with expanded-search research allowed independently. SF5 accepted: HRTC, HYA and Huckleberry are modeled. Current slice: Larkin Street cash-plus (#141), then Lyon-Martin. SF6 has JCYC modeled; three organizations remain. SF11 and SF12 each have one modeled candidate, not ten completed reviews. SF9 policy organizations and SF10 synthesis remain unfinished. Shared housing coefficient creates correlated uncertainty; it is not three independent local measurements.

Active block started 2026-09-07T20:30:30Z; target 90 measured minutes without padding. SF13 accepted: SFAF central $56,328/10 QALYs, positive scenarios $5,016–$1.67M, residual repeat-rescue sensitivity ($112,655 at 50% further lifetime credit). PR #128 merged as c78213dbf8a979550d02583dae3dc8349ed8f2b5 and published as Sites v102; 186 tests, full lint/build, phone/tablet checks and canonical report/API passed. Remains research-only rather than displacing a homepage pick.

SF4: EDC now has an explicit subjective adult-health bridge: $126M/10 QALYs, positive scenarios $2.1M–$25.2B and a zero-benefit boundary. The historical failed-gate audit is preserved as history, not the current estimate. July 2026 randomized evidence cautions against treating legal possession as stable housing. PR #129 and canonical report/API accepted in Sites v103.

## September 7 model release ledger

| Program | Central USD / 10 QALYs | PR | Initial release |
| --- | ---: | --- | --- |
| SFAF naloxone | 56,328 | #128 | v102 |
| EDC legal defense | 126,000,000 | #129 | v103 |
| PHC eyeglasses | 71,111 | #130 | v104 |
| JCYC summer jobs | 24,840,183 | #133 | v105 |
| HRTC proposed therapy slice | 5,548,442 | #135 | v106 |
| HYA medication access | 4,687,027 | #137 | v106 |
| Huckleberry anxiety counseling | 3,692,308 | #140 | v107 |

These are analyst scenarios, not measured local effects or verified marginal funding offers. Model perspectives differ: several omit non-health benefits, and mortality models share survival judgments. Do not interpret the table as an endorsement ranking. SFAF and PHC are under-$100K leads conditional on additionality; both have much worse pessimistic cases and null boundaries. The proposed 2026 SFAF agreement names HYA/GLIDE/HRTC subcontractors, so prime-only funding ledgers and pooled mortality benefits risk double-counting.

All seven central formulas are mirrored in the existing [research workbook, Sep 7 Research Models tab](https://docs.google.com/spreadsheets/d/10boGN2J7SHJhNtmzAkzbKnRy-jSnoUQROeUFTY6Jdcg/edit?gid=1202219418#gid=1202219418). Native recalculation matches the site model outputs; existing user and GiveWell template tabs were preserved. Each block links its full versioned model, scenario ranges and sources. Workbook central outputs are not substitutes for reading those uncertainty notes.

Latest accepted research source: f318943e2cbdfcd839b9edd4edee7c3aee872c56, shared between GitHub main and Sites source, published as v107. Full merged suite: 198 tests, lint and production build passed; GitHub mobile and security checks passed. Public access, domain and /donate base path unchanged. Canonical HRTC, HYA and SFAF reports/APIs returned 200 with matching central outputs and no 390px overflow. Acceptance is recorded with issues #134 and #136. Next ready issue: #141 (Larkin Street cash-plus).
