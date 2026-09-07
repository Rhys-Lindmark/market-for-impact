# San Francisco giving — active phase plan

Updated 2026-09-07. Manager: current task. Research implementer: sf_research_audit (read-only evidence audit); Site edits and deployment owned by manager. Stall interval: 25 minutes of active work without accepted evidence.

## Phase 1 — concise SF front door

- [x] SF1 Homepage and /san-francisco show exactly four current picks with source-derived $/10 QALYs, evidence, and report links.
- [x] SF2 Preserve detailed research at /research and cross-cause market at /archive; verify navigation and canonical paths.
- [x] SF3 Pass relevant tests, mobile checks, lint, production build; merge and deploy the validated commit.

Accepted 2026-09-07: PRs #124 and #125 merged. Exact source f6965366c99aea9093e53581f888105950e4c166 published as Sites v101. Earlier verification: 181 tests, lint, build, homepage phone/tablet tests, route/navigation suite and GitHub mobile checks passed. Canonical production root, /san-francisco, /archive and /research returned HTTP 200, correct headings and no 390px overflow; both front doors contain exactly four picks. Canonical coefficient-grants API returned 200. Domain, base path and public access unchanged.

Exit: all three accepted with published canonical routes. That initial shortlist was later superseded by PR #166: SFAF, PHC, GLIDE, Compass. All25 original models are now complete; the estimates remain exploratory, with no verified marginal funding offers.

## Phase 2 — finish the 25-priority review cohort

Dependency: phase 1. Each remaining program gets a dedicated report, explicit best-guess $/10 QALYs model with formula and sensitivities, source/assumption separation, and local funding constraints. A blank or failed-gate audit alone does not count as a completed model.

- [x] SF4 Resolve remaining EDC and Project Open Hand QALY endpoints. EDC accepted in PR #129 / Sites v103; Project Open Hand's existing narrow acute-morbidity endpoint remains $132.8M/10 QALYs.
- [x] SF5 Model existing initial reviews: Harm Reduction Therapy Center, Homeless Youth Alliance, Huckleberry Youth Programs.
- [x] SF6 Review and model JCYC, Larkin Street, Lyon-Martin, Mission Neighborhood Centers.
- [x] SF7 Review and model New Door Ventures, Openhouse, Progress Foundation, Richmond Area Multi-Services.
- [x] SF8 Review and model Self-Help for the Elderly, Tenderloin Housing Clinic, United Playaz. Accepted PRs #160–#162 / Sites v116–v118; original25 coverage verified.

Exit: 25 inspectable reviews/models, or exact unresolved variables documented after meaningful research; no invented evidence or claimed precision. Update shared workbook when a model changes and verify formulas.

## Phase 3 — city cost-effectiveness theory

Dependency: completed phase 2 research. Compare cash-gap prevention, treatment, education/employment, and policy mechanisms by cost, severity, durable benefit, reach, attribution, and displacement. Test shared assumptions and excluded benefits before claiming a 100× advantage.

- [x] SF10 Publish synthesis with ranked hypotheses, counterexamples, and the next candidate search priorities. PR #164 merged; 233 tests, independent audit, phone/tablet and GitHub gates passed. Released with the subsequent ranking update.

## Phase 4 — ten mechanism-first research bets

Dependency: SF10. Hypothesize the mechanism before selecting the charity; use the synthesis to guide the search, then update beliefs from evidence.

- [ ] SF12 Screen the ten mechanism-first research bets in [sf-research-bets.md](sf-research-bets.md): first hypothesize a cheap causal route to health gains, then find a local implementer, then test whether it holds. This label is a research priority, not an effectiveness endorsement. Discovery queue recorded; program models remain unfinished.

## Phase 5 — ten unconventional programs

Dependency: SF12.

- [ ] SF11 Add and research ten unconventional programs with source-confirmed SF delivery or an explicit missing local partner. Keep this cohort distinct from the mechanism-first ten; do not double-count organizations to inflate coverage.

## Phase 6 — urban policy organizations

Dependency: SF11.

- [ ] SF9 Add dedicated SPUR, GrowSF, Housing Action Coalition research pages; preserve entity and program boundaries, evaluate non-electoral public-benefit mechanisms, and label attribution assumptions.

Exit: inspectable program theories and quantitative scenarios where defensible; no election-result-to-health causal shortcut.

## Phase 7 — final top-four selection and visual rebuild

Dependency: completed original 25, theory, ten mechanism-first bets, ten unconventional programs, and SPUR/GrowSF/HAC. This is roughly 50 organizations (48 if all are distinct), not an inflated exact count.

- [ ] SF14 After expanded research, reassess the strongest four using modeled cost-effectiveness, evidence and marginal-funding criteria. Later user direction explicitly enables updating the current numeric top four now.
- [ ] SF15 Rebuild the concise homepage and /san-francisco in the visual and content structure of https://www.givewell.org/charities/top-charities: four clear program cards, suitable sourced/licensed photos, prominent USD per 10 QALYs, compact caveats and research links. Put all remaining research behind a clear bottom link. Verify phone/tablet layout, accessibility, sources and canonical routes.

## Existing expanded-search evidence

- [x] SF13 Deepen the best candidate for under $100,000 per 10 QALYs ($10,000/QALY), starting with overdose prevention. SFAF conditional model and report accepted in PR #128, Sites v102, canonical report and model API verified. This completes the investigation deliverable, not verification of an available funding offer; issue #127 tracks the missing incremental reach and repeat-recipient evidence.

Latest user ordering supersedes parallel expansion: finish 25 → theory → mechanism-first ten → unconventional ten → policy three → final four and visual rebuild. Preserve already completed exploratory evidence, but do not jump to redesign. Synthesis must not claim 100× differences based only on correlated assumptions or unlike model perspectives.

## Recovery state

Current phase: 4 — ten mechanism-first bets. All25 original models are released through PR #162; city theory PR #164 is merged and independently accepted. No verified marginal funding offers. Current ranking #165 joins the two additional comparator models and synchronizes the 27-review list and homepage four. Next: mechanism-first ten, unconventional ten, policy three, then final visual rebuild. Later user direction enables an immediate central-estimate research sort and matching homepage four; full visual rebuild remains later.

Active block started 2026-09-07T23:20:33Z; target90 measured minutes without padding. Mechanism-first research is the current block. DOPE #168 models an additional site-year, with explicit usual-care and SFAF-overlap boundaries. Earlier SFAF/PHC work remains additional comparator evidence, not extra original-cohort rows.

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
| Larkin cash-plus housing | 40,400,000 | #142 | v108 |
| Lyon-Martin earlier adult care | 4,571,429 | #144 | v109 |
| MNC proposed dental prevention | 39,256,978 | #147 | v110 |
| New Door health-only employment | 160,000,000 | #149 | v111 |
| Openhouse companionship | 5,333,333 | #150 | v112 |
| Progress crisis residence | 391,071,429 | #152 | v113 |
| RAMS depression counseling | 4,210,526 | #158 | v115 |
| Self-Help proposed therapeutic tai chi | 2,400,000 | #160 | v116 |
| THC room-turnover acceleration | 46,794,872 | #161 | v117 |
| United Playaz mentorship | 26,666,667 | #162 | v118 |

These are analyst scenarios, not measured local effects or verified marginal funding offers. Model perspectives differ: several omit non-health benefits, and mortality models share survival judgments. Do not interpret the table as an endorsement ranking. SFAF and PHC are under-$100K leads conditional on additionality; both have much worse pessimistic cases and null boundaries. The proposed 2026 SFAF agreement names HYA/GLIDE/HRTC subcontractors, so prime-only funding ledgers and pooled mortality benefits risk double-counting.

All17 September7 research-model central formulas are mirrored in the existing [research workbook, Sep7 Research Models tab](https://docs.google.com/spreadsheets/d/10boGN2J7SHJhNtmzAkzbKnRy-jSnoUQROeUFTY6Jdcg/edit?gid=1202219418#gid=1202219418). Native outputs and visual layout match; user and GiveWell tabs preserved. These central outputs do not replace full uncertainty notes.

Latest accepted research source: c93f4fab50deba8f4e0263a0a318647d9a2fb801, shared by GitHub main and Sites source, published v118. 227 tests, lint/build, independent audits, phone/tablet and GitHub mobile/security passed. All25 canonical report URLs returned200 with shared denominator; new report/API numbers and workbook formulas matched. Public access/domain/base unchanged.
