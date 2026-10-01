# Existing in-depth recalibration inventory

Current acceptance checkpoint: **10/40 published-cohort reviews recalibrated, 30 remaining**: the three September 30 USA corrections plus ReCARES, [HOPE](hope-calibration-acceptance-2026-10-01.md), [Project Homeless Connect](phc-calibration-acceptance-2026-10-01.md), [Hearing and Speech Center](hsc-calibration-acceptance-2026-10-01.md), [Compass Family Services](compass-calibration-acceptance-2026-10-01.md), [Hamilton Families](hamilton-calibration-acceptance-2026-10-01.md) and [Friends of the Urban Forest](fuf-calibration-acceptance-2026-10-01.md). **0/11 older reviews recalibrated**; those are tracked separately. FUF is accepted and published in Sites version325, source `60a50270f24a3138e513641e7e4f3bfb751ee851`. Counts below preserve the inventory-at-start snapshot.

The screenshot's publication cohort is 10 SF + 10 California + 13 USA + 3 NYC + 3 LA + 1 Chicago = **40**. The former **48** denominator meant the pending queue at restart: 40 − 3 previously corrected + 11 older models. It was not the number of published-cohort reviews. For historical reconciliation, 7/48 of that original pending queue are now published, leaving 41; current tracking uses **10/40 plus 0/11**, not one mixed denominator.

October 1, 2026. Inventory-only reconciliation at `6a858c4965c0e86b18ec0713c8ae242ee97ca208`, branch `priority/recalibrate-in-depth-health-income`. The user explicitly resumed the goal October 1; this inventory itself implies no model acceptance, price change or geographic expansion. Scope is the September 30 backlog plus demonstrably accepted legacy re-reviews; initial exploratory models and uncertain legacy coverage remain visible separately.

## Reconciled counts

| Set | Existing model/report identities | Already health-and-income recalibrated | Pending |
| --- | ---: | ---: | ---: |
| Current geography registry, `stage: beta` | 30 | 3 | 27 |
| SF top-ten summary registry | 10 | 0 | 10 |
| Accepted legacy re-reviews outside those cohorts | 11 | 0 | 11 |
| Confirmed combined inventory | **51** | **3** | **48** |

The original **37 pending** snapshot is correct for its named publication cohorts, but incomplete for legacy coverage. The reconciled **48 pending model identities represent 47 distinct organizations**: Operation Access has a California beta model and a separate legacy US/Bay/SF portfolio model. Together with the three already recalibrated organizations there are **50 distinct organizations** in the confirmed inventory. Multiple regional outputs within one shared legacy model are retained, but do not become extra accepted reviews merely because the calculator returns three ratios. This is a confirmed minimum; ambiguity below must be resolved before claiming every possible legacy deep review is covered.

The three completed USA identities are `usa/institute-for-progress`, `usa/1day-sooner`, and `usa/foundation-for-american-innovation`. Their registry acceptance points to [the September 30 income calibration](usa-three-income-calibration-2026-09-30.md). They are **not pending**. “Accepted beta” and “accepted prior re-review” do not mean accepted under the new health-and-income recalibration requirements.

## Current geography beta registry: all 30 rows

Artifact: `data/geography-reports.json`, selector `reports.filter(r => r.stage === 'beta')`; each row's `edition` + `slug` is its reproducible identity. The embedded `model`, `acceptance`, `sources` and `independentAudit` where available are the corresponding packet references. All 30 rows currently say acceptance status `accepted`; some reference prose or temporary/untracked paths rather than durable independent-audit files, so acceptance provenance is not uniformly recoverable from one path.

| Edition | Slug / organization | Recalibration state |
| --- | --- | --- |
| California | `youth-alive` — Youth ALIVE! | Pending |
| California | `vision-to-learn` — Vision To Learn | Pending |
| California | `walk-san-francisco` — Walk San Francisco | Pending |
| California | `center-for-independent-living` — Center for Independent Living | Pending |
| California | `coalition-for-clean-air` — Coalition for Clean Air | Pending; rankable central withdrawn, retain diagnostic |
| California | `western-center-on-law-and-poverty` — Western Center on Law & Poverty | Pending |
| California | `harm-reduction-services` — Harm Reduction Services | Pending |
| California | `operation-access` — Operation Access | Pending; retain separate legacy regional identity |
| California | `champions-for-health` — Champions for Health | Pending |
| California | `california-school-based-health-alliance` — California School-Based Health Alliance | Pending |
| USA | `institute-for-safer-trucking` — Institute for Safer Trucking | Pending |
| USA | `center-for-science-in-the-public-interest` — Center for Science in the Public Interest | Pending |
| USA | `kids-and-car-safety` — Kids and Car Safety | Pending; central withdrawn |
| USA | `help-america-hear` — Help America Hear | Pending |
| USA | `cribs-for-kids` — Cribs for Kids | Pending |
| USA | `end-overdose` — End Overdose | Pending |
| USA | `surgery-on-sunday` — Surgery on Sunday | Pending |
| USA | `dental-lifeline-network` — Dental Lifeline Network | Pending |
| USA | `remote-area-medical` — Remote Area Medical | Pending; central withdrawn |
| USA | `american-nonsmokers-rights-foundation` — American Nonsmokers’ Rights Foundation | Pending |
| USA | `institute-for-progress` — Institute for Progress | Completed September 30 income recalibration |
| USA | `1day-sooner` — 1Day Sooner | Completed September 30 income recalibration |
| USA | `foundation-for-american-innovation` — Foundation for American Innovation | Completed September 30 income recalibration |
| New York City | `bergen-volunteer-medical-initiative` — Bergen Volunteer Medical Initiative | Pending |
| New York City | `new-jersey-harm-reduction-coalition` — New Jersey Harm Reduction Coalition | Pending; central withdrawn |
| New York City | `parker-family-health-center` — Parker Family Health Center | Pending |
| Los Angeles | `lestonnac-free-clinic` — Lestonnac Free Clinic | Pending |
| Los Angeles | `urban-peace-institute` — Urban Peace Institute | Pending |
| Los Angeles | `hunger-action-los-angeles` — Hunger Action Los Angeles | Pending |
| Chicago | `chicago-recovery-alliance` — Chicago Recovery Alliance | Pending |

Counts by edition: California 10; USA 13 (10 pending, 3 completed); NYC 3; LA 3; Chicago 1. Other geography editions have zero beta rows in this snapshot. `docs/geography-progress.json` corroborates publication counts; it is not proof of new recalibration completion.

## SF top-ten registry: all 10 entries

Artifact: `data/top-ten-summaries.json`, its ten object keys. “SF top ten” is a registry cohort label: several actual denominators are Bay Area rather than SF-only. Preserve those actual denominators. All ten remain pending under the new requirements.

| Key / organization | Current report/model artifact references |
| --- | --- |
| `recares` — The ReCARES Network | `data/bay/recares-report.json`; `data/bay/recares-v2-model-data.json`; `lib/recares-v2-model.mjs`; `docs/reports/recares-v2.md` and independent audit |
| `hope-pacifica` — HOPE Pacifica | `data/san-francisco/hope-v2-report.json`; `lib/hope-v2-model.mjs`; `docs/reports/hope-v2.md` and independent audit |
| `project-homeless-connect` — Project Homeless Connect | `data/san-francisco/phc-v2-report.json`; `data/san-francisco/phc-portfolio-model-v1.json`; `lib/phc-portfolio-model.mjs`; `docs/reports/phc-v2.md` and independent audit |
| `hearing-and-speech-center` — Hearing and Speech Center of Northern California | `data/san-francisco/hearing-access-cea-v2.json`; `lib/hearing-access-model.mjs`; `docs/hearing-access-acceptance.md` |
| `compass-family-services` — Compass Family Services | `data/san-francisco/compass-family-services-review-v1.json`; `compass-c-rent-cea-v1.json`; `compass-c-rent-qaly-bridge-audit-v1.json` |
| `hamilton-families` — Hamilton Families | `data/san-francisco/hamilton-families-review-v1.json`; `hamilton-prevention-cea-v1.json`; `hamilton-prevention-qaly-bridge-audit-v1.json` |
| `friends-of-the-urban-forest` — Friends of the Urban Forest | `data/sf/fuf-v2-report.json`; `data/sf/fuf-v2-model-data.json`; `lib/fuf-v2-model.mjs`; `docs/reports/fuf-v2.md` and independent audit |
| `melp-ablecloset` — MELP / AbleCloset | `data/bay/melp-report.json`; `data/bay/melp-source-ledger.json`; `lib/melp-model.mjs`; `docs/melp-independent-audit.md` |
| `code-tenderloin` — Code Tenderloin | `data/san-francisco/code-tenderloin-report.json`; `code-tenderloin-model-v1.json`; `lib/code-tenderloin-model.mjs` |
| `san-francisco-aids-foundation` — San Francisco AIDS Foundation | `data/san-francisco/sfaf-portfolio-report.json`; `sfaf-portfolio-model-v1.json`; `lib/sfaf-portfolio-model.mjs`; `docs/sfaf-portfolio-independent-audit.md` |

## Accepted legacy re-reviews: 11 additional pending identities

The first six belong to the accepted frozen ten, but do not appear in the current SF top-ten keys or geography beta cohort. The other four frozen-ten organizations (ReCARES, HOPE, PHC, FUF) are already in the table above and add **zero** here. `docs/110-research-plan.md`, `docs/final-selection-audit.md`, and `docs/final-canonical-audit.md` supersede older checkpoint statements that FUF was not yet integrated. No claim is made that every historical memo audited final production rendering.

| Organization / retained model identity | Durable report/model | Accepted review evidence |
| --- | --- | --- |
| GLIDE Foundation — ordinary Foundation gift; SF/Bay partial-health | `data/san-francisco/glide-v2-report.json`; `lib/glide-v2-model.mjs` | `docs/reports/glide-v2.md`; `docs/reports/glide-v2-independent-audit.md` |
| Breathe California — Bay Area operator; whole gift, partial-health | `data/san-francisco/breathe-coverage-report.json`; `lib/breathe-v2-model.mjs` | `docs/reports/breathe-v2.md`; `docs/reports/breathe-v2-independent-audit.md` |
| Pacific Hearing Connection — Bay hearing-care model | `data/bay/pacific-hearing-v2-report.json`; `lib/pacific-hearing-v2-model.mjs` | `docs/reports/pacific-hearing-v2.md`; corresponding independent audit |
| North East Medical Services — separate donation Foundation; conditional HBV regional model | `data/san-francisco/nems-v2-report.json`; `lib/nems-v2-model.mjs` | `docs/reports/nems-v2.md`; corresponding independent audit; ordinary unrestricted Bay impact remains unestimated |
| SPUR — whole-organization policy portfolio; SF/Bay | `data/san-francisco/spur-portfolio-report.json`; `spur-portfolio-cea-v3.json`; `lib/spur-v2-model.mjs` | `docs/reports/spur-v2.md`; corresponding independent audit |
| Housing Action Coalition — c3 gift; SF/Bay policy portfolio | `data/san-francisco/hac-v2-report.json`; `lib/hac-v2-model.mjs` | `docs/reports/hac-v2.md`; corresponding independent audit |
| Operation Access — legacy whole-gift named-specialty portfolio; US/Bay/SF | `data/san-francisco/oa-portfolio-report.json`; `oa-portfolio-model-v2.json`; `lib/oa-portfolio-model.mjs` | `docs/oa-portfolio-v2-review.md`; `docs/oa-portfolio-v2-independent-audit.md` |
| Clinic by the Bay — expected ordinary gift, named-service portfolio; SF/Bay | `data/san-francisco/clinic-portfolio-report.json`; `clinic-portfolio-model-v2.json`; `lib/clinic-portfolio-model.mjs` | `docs/clinic-portfolio-review.md`; `docs/clinic-portfolio-independent-audit.md` |
| Pacific Vision Foundation — ordinary-gift portfolio; US/Bay/SF | `data/san-francisco/pvf-portfolio-report.json`; `pvf-portfolio-model-v1.json`; `lib/pvf-portfolio-model.mjs` | `docs/pvf-portfolio-review.md`; `docs/pvf-portfolio-independent-audit.md` |
| HEPPAC — unique-person naloxone correction alongside other pathways; Bay | `data/bay/heppac-report.json`; `heppac-cohort-v2-results.json`; `lib/heppac-model.mjs`; `lib/heppac-unique-cohort.mjs` | `docs/heppac-cohort-v2-prior-lock.md`; `docs/heppac-cohort-v2-audit.md` |
| Changent / Nurse-Family Partnership — NFP plus Child First whole-organization portfolio; USA | `data/us/nfp-report.json`; `nfp-portfolio-results-v4.json`; `lib/nfp-portfolio-model.mjs` | `docs/nfp-portfolio-audit-v4.md` explicitly accepts exploratory unfavorable portfolio extension, holds giving |

Acceptance here is prior conditional research acceptance, not a verified funding offer. HEPPAC's memo accepted a production candidate conditional on integration disclosures; current report/model artifacts exist, but a fresh production rendering audit was not done in this inventory. Retain that qualification during recalibration. Original portfolio versions of PHC/SFAF/SPUR are lineage, not extra organizations or independent pending copies when superseded.

## Legacy coverage ambiguities and initial-model exclusions

A filename suffix records a model revision, not a research stage or automatic acceptance. Conversely, an accepted deep review may keep a `v1` model filename (PHC and PVF). The confirmed total above uses explicit review and acceptance records rather than filename matching.

| Candidate / artifact | Classification and required treatment |
| --- | --- |
| Vision To Learn, `data/us/vision-to-learn-v2.json`, `data/us/vision-to-learn-report.json` | Independently audited conditional US/Bay/SF whole-gift model according to artifact metadata. California beta is confirmed separately. Located evidence does not establish a separate additional deep-review research pass outside the beta cohort; **coverage ambiguity**, not omitted or folded into the California denominator. Resolve provenance before adding a pending identity. |
| RotaCare, `data/bay/rotacare-cea-v2.json`; `docs/rotacare-release-plan.md`; `docs/research-queue/next100/september8/rotacare-review.md` and audit | Initial report revised during acceptance to clarify later-event catch-up; plan says count once as a new organization. **Accepted initial conditional report**, not evidence of a second deep-review pass merely because model is v2. |
| Walk San Francisco, `data/san-francisco/walk-sf-report.json`; `walk-sf-cea-v1.json`; `docs/research-queue/next100/september8/walk-sf-independent-audit.md` | Accepted **initial** whole-gift SF/Bay model, distinct from California beta. Preserve geographic alias/model coverage; no extra accepted deep re-review established by its initial acceptance. |
| Eviction Defense Collaborative, `data/san-francisco/edc-qaly-decision-v2.json` | Status is `exploratory-judgmental-health-bridge`, confidence `very-low`; **v2 alone does not qualify**. Distinct from Oakland Eviction Defense Center. |
| YMCA of Greater San Francisco, `data/san-francisco/ymca-portfolio-report.json`; `lib/ymca-portfolio-model.mjs`; `docs/rotacare-release-plan.md` | Legacy whole-organization revision explicitly replaces the narrower diabetes-prevention model. A separate durable independent acceptance memo was not located. **Depth/provenance ambiguity**; retain for gate resolution rather than infer an additional accepted beta pass. |
| New Door Ventures, `data/san-francisco/newdoor-portfolio-report.json`; `newdoor-portfolio-v1.json`; `lib/newdoor-portfolio-model.mjs` | Model metadata explicitly says independently accepted existing-organization revision. Separate independent acceptance artifact and additional-depth record were not located. **Depth/provenance ambiguity**, stronger than a mere portfolio filename but weaker than the linked accepted packets above. |
| Face to Face; Oakland Eviction Defense Center | `docs/face-to-face-independent-audit.md`, `docs/oakland-edc-independent-audit.md` and corresponding `data/bay/face-to-face-report.json`, `oakland-edc-report.json`: accepted conditional initial models/finite-health corrections. No separate accepted deep-review pass identified. |
| International harmonization, `data/international/harmonized-calibration-v2.json` | Cross-model calibration artifact, not a distinct organization deep review. Initial international reports and audits are outside confirmed deep-review count; no inferred extra beta stage. |
| Bike East Bay / Sogorea Te; Causa Justa; Cityside / KQED | `docs/110-v2-frozen-review-set.md`, `docs/110-research-plan.md`, `docs/reports/bike-east-bay-alpha-independent-audit.md`, `sogorea-te-alpha-independent-audit.md`: two additional **alpha** reports, one closure disposition, two unestimated skeletons. No extra accepted deeper review or numerical publication inferred. |

`data/san-francisco/research-funnel-v1.json` has exactly **25** `deepDiveRows`, all with `costEffectivenessStatus: exploratory-model`: Compass Family Services; Curry Senior Center; Eviction Defense Collaborative; Farming Hope; Five Keys Schools and Programs; GLIDE Foundation; Hamilton Families; Harm Reduction Therapy Center; Homeless Youth Alliance; Huckleberry Youth Programs; Institute on Aging; Japanese Community Youth Council; Larkin Street Youth Services; Lyon-Martin Community Health Services; Mission Neighborhood Centers; New Door Ventures; Openhouse; Progress Foundation; Project Open Hand; Richmond Area Multi-Services; San Francisco–Marin Food Bank; Self-Help for the Elderly; SF LGBT Center; Tenderloin Housing Clinic; United Playaz. This is a separate screening/funnel taxonomy, not 25 accepted extra beta re-reviews. Compass, Hamilton and GLIDE already appear in confirmed cohorts; the remaining **22** require provenance classification if “every existing in-depth” is intended to include this exploratory taxonomy. Preserve the full rows and their artifact references in that JSON; do not silently declare them recalibrated or delete them from scope.

## Priority batches and ranking acceptance

1. **Current homepage top four first:** ReCARES → HOPE Pacifica → Project Homeless Connect → Hearing and Speech Center of Northern California. Executing `lib/unified-research-index.ts` gives respectively **$74,720.3436746678; $554,659.5517271358; $774,408.3401731638; $1,250,000** per ten modeled QALYs. These are mechanically selected research recommendations, with donor holds and recipient uncertainty retained. PHC uses Bay-adjusted health despite its source row's SF scope label. This ordering is distinct from the historical frozen-ten selection.
2. **Ranking-sensitive and policy/systemic:** FUF, SPUR, HAC; then remaining housing/employment/environmental portfolios and California/USA policy reports (including CSPI, IST, WCLP, CCA, Walk SF, CSBHA, ANRF). Review withdrawn-central reports as missing-evidence cases; do not manufacture a finite favorable headline to restore ranking.
3. **Broad/partial portfolios and survival:** SFAF, GLIDE, Breathe, NEMS, legacy OA and Clinic/PVF, HEPPAC and Changent; coordinate evidence with geography aliases before checking remaining clinical and local reports.
4. **All remaining confirmed identities**, while resolving the legacy ambiguities before certifying the final denominator. This list is the resumed work order, not a claim that recalibration has been completed.

Aggregation is a material audit issue: older acceptance packets sometimes specify a signed weighted expectation, while current ranking adapters select a central scenario. ReCARES' prior audit requested a weighted Bay price, but the current index selects its central row; Clinic's ranking uses its signed expectation. Recalibration must explicitly choose and justify the headline statistic, retain central/null/adverse components, and synchronize report, list, shortlist and API. Do not call a central scenario an empirically identified expected value, or equate favorable-tail weighted averages with typical outcomes.

Geo aliases that must survive evidence deduplication include California versus legacy US/Bay/SF Operation Access; California versus legacy SF/Bay Walk SF; California versus legacy US/Bay/SF Vision To Learn; California versus initial Bay Youth ALIVE!; USA versus older report engines for End Overdose. The last two aliases establish lineage/initial geographic models rather than extra accepted deep-review passes. PHC/HSC share the `phc-hsc-adult-hearing-aid-access` outcome ledger: distinct organizations are retained, overlapping clinical benefits must not be summed.

## Reproduction and resource evidence

Run from this checkout; no install, build, server or generated directory is needed:

```sh
git rev-parse HEAD
node -e 'const g=require("./data/geography-reports.json"); const b=g.reports.filter(r=>r.stage==="beta"); console.log(b.length); for(const r of b) console.log(r.edition+"/"+r.slug+" | "+r.acceptance.status); console.log(Object.keys(require("./data/top-ten-summaries.json"))); const f=require("./data/san-francisco/research-funnel-v1.json"); console.log(f.deepDiveRows.length); for(const r of f.deepDiveRows) console.log(r.displayName+" | "+r.costEffectivenessStatus)'
rg --files data lib docs | rg '(portfolio|v2|v3|v4|cohort|independent-audit|acceptance)'
```

The homepage four were evaluated from actual TypeScript index modules using existing Node 24.18.0 and `node:module.stripTypeScriptTypes`, resolving relative/`@/` imports in memory and preserving JSON import attributes. No manually reconstructed prices or new dependency installation. Inspect `lib/unified-research-index.ts`, its four imported indexes, and `lib/local-research-estimate.mjs` to reproduce selection and actual denominator scope.

Space Saver baseline and final: checkout **90 MB**; filesystem available increased from **28 to 29 GiB** during parallel work, with no cleanup by this lane and no causal reclaimed-space claim. No dependency copies, installations, processes, exports or scratch files were created. Only this inventory document is owned by this lane; product data and other plans remain untouched.
