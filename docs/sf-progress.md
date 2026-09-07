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

- [ ] SF4 Resolve remaining EDC and Project Open Hand QALY endpoints.
- [ ] SF5 Model existing initial reviews: Harm Reduction Therapy Center, Homeless Youth Alliance, Huckleberry Youth Programs.
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
- [ ] SF13 Deepen the best candidate for under $100,000 per 10 QALYs ($10,000/QALY), starting with overdose prevention. Separate published economic ICERs from marginal donor prices and current SF coverage.

Expanded search may proceed alongside the 25 reviews. Synthesis must account for the expanded findings and must not claim 100× differences based only on correlated assumptions or unlike model perspectives.

## Recovery state

Current phase: 2, with expanded-search research allowed independently. Next: finish the remaining existing QALY endpoints and develop the naloxone local-cost model from the research note. Remaining: SF4–SF13. Shared housing coefficient creates correlated uncertainty; it is not three independent local measurements. GLIDE utility citation corrected in #124 to PubMed 34629422. Ten unconventional leads and ten mechanism-first bets are recorded in sf-research-bets.md; their evaluation is unfinished. See naloxone-research-checkpoint.md for new evidence and its limitations.

Active block started 2026-09-07T18:48:17Z; target 90 measured minutes without padding. SF13 implementation: new SFAF report and executable local-output model, central $56,328/10 QALYs, positive scenarios $5,016–$1.67M, and residual repeat-rescue sensitivity ($112,655 at 50% further lifetime credit). Phone/tablet report and model-API tests passed. Pending full checks, PR and deployment; not yet accepted as a completed SF13 deliverable. Remains research-only rather than displacing a homepage pick. SF4 audit corrected: Project Open Hand already has an existing $132.8M narrow acute-morbidity endpoint; EDC is the remaining missing endpoint.
