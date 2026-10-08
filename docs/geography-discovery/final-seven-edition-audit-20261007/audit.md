# Independent bounded completion audit — 2026-10-07

Audit snapshot: `bd55465753a88b1516be676d0495452a74445996`, branch `priority/recalibrate-in-depth-health-income`, clean checkout. Read-only audit; no charity research, research-time assignment, publication, or new discovery. Root separately audits seven-edition manifests and live parity. **Overall completion is not certified.**

## Proven within the original recalibration boundary

The inventory's denominators reconcile: original published cohort **40 = 30 geography beta reports + 10 SF top-ten reports**; confirmed legacy **11** gives 51 existing reviews. Three USA reports (IFP, 1Day Sooner, FAI) were already recalibrated September 30, so the original remaining queue was **48 = 51 − 3**. These are overlapping completion measures, not 99 distinct reviews.

- `docs/geography-discovery/recalibration-inventory-2026-10-01.md`, lines 105–190, defines identities and original source/model/report boundaries.
- All 30 original geography identities were independently matched to current `data/geography-reports.json`: each exists, remains beta, and contains structured signed income in serialized scenarios. This includes all 10 CA, 13 USA, three NYC, three LA and one Chicago identities—not merely a total-count comparison.
- Ten SF top-ten calibration families have existing original models/reports and dedicated finite calibration tests: ReCARES, Hope, PHC, Hearing/Speech, Compass, Hamilton, FUF, MELP, Code Tenderloin and SFAF. Their acceptance/checkpoint artifacts are retained under `docs/geography-discovery/*calibration-acceptance-2026-10-01.md` and associated source/model artifacts.
- Eleven confirmed legacy families retain current/historical model tests: GLIDE, Breathe, Pacific Hearing, NEMS, SPUR, HAC, Operation Access, Clinic by the Bay, PVF, HEPPAC and Changent/NFP. Individual `*-legacy-publication-2026-10-02/03/04.json` receipts exist, including `operation-access-legacy-publication-2026-10-03.json`.
- `changent-legacy-publication-2026-10-04.json` records successful Site 393 publication and **40/40, 11/11, 48/48**. It explicitly kept the overall goal active and separate coverage work pending. This is consistent with, not stronger than, the underlying inventory and current arithmetic coverage.

This audit rechecked identity/artifact coverage and finite arithmetic/historical preservation; it did **not** freshly reread all 51 organizations' original external sources. Their existing independent acceptance evidence remains the source-review basis.

## PR 385 integration proven; PR 384 closure incomplete

- GitHub PR 385 is MERGED, `2026-10-05T04:03:49Z`, merge commit `211b096f9b116af575e5a1648bc47e3842410325`. `git merge-base --is-ancestor` succeeds against this HEAD. `lib/better-paying-jobs.mjs`, the holistic protocol and focused jobs/income tests are present and pass. The four-lane jobs/abundance discovery synthesis is integrated; this does not certify empirical wages or additional organization reviews.
- GitHub PR 384 is still **OPEN**, mergedAt/mergeCommit null. Its remote head equals this local HEAD; base is `research/nyc-next-six-resumed`. Scientific/publication progress must not be described as PR 384 merged or Git closure complete. Root must determine the appropriate authorized merge/branch closure separately.

## Material blocker: 69 active initial reviews still lack signed economic assessment

The holistic protocol, heading **Every initial and deep review**, requires health AND signed disposable-income/consumption assessment, clinical-null/financial-only/adverse uncertainty, and the shared income bridge counted once. This is not limited to the ten selected deep reviews.

Scanning every current active alpha report's **serialized model scenarios** (not just top-level keys) finds 69 with neither `incomePathways` nor `incomeBridge`: California 15, USA 15, NYC 15, LA 15, Chicago 7, Houston 2, Denver 0. Structured fields alone are not an absolute requirement for a properly evidenced explicit unknown assessment, but their absence requires an evidence audit—not a waiver. At least the inspected examples do not satisfy the substantive requirement:

- Houston TOMAGWA: current report calls itself a historical **partial-health illustration**, lists missing clinical/resource reconciliation, and prices hypothetical surgery relief only. No signed household income/consumption, access costs or payer pathway exists in any scenario. Its `outputs/houston-tomagwa-audit/audit.md` acceptance reference is absent from this checkout.
- Chicago Children's Research Triangle: current report and `docs/geography-discovery/chicago-crt-alpha-acceptance.md` require future full net-resource/portfolio effects; model combines gift capacity response with whole annual costs and has only health scenarios. Existing acceptance explicitly does not waive remaining gates.

Therefore these two alone block a truthful all-initial holistic-completion claim. The other 67 must be triaged for actual signed assessments in durable source/model records. Do not assume all are missing merely from fields; equally, do not label unsupported effects zero or force a positive estimate. Remediation should use bounded source-grounded assessments, preserve initial diagnostics, distinguish annual work from marginal gifts, and add coherent signed/unknown/adverse resource scenarios where defensible. Existing accepted deep counts and original 48-queue completion remain true but insufficient for this newer requirement.

## Material evidence portability failures

Extracting literal `docs/`, `outputs/` and `work/` Markdown/JSON references from `acceptance.evidence` avoids false alarms from explanatory text and anchors. These active references genuinely do not exist in the checkout:

| Report | Missing acceptance artifact |
| --- | --- |
| Chicago Tri-City Health Partnership | `work/geography-handoff-20260913/resumed-20260929/chicago-seven-nine-source-audit.json` |
| Chicago Will-Grundy Medical Clinic | same path |
| Houston Healthcare for the Homeless Houston | `outputs/houston-hhh-followon/independent-acceptance.json` |
| Chicago Children's Advocacy Center | `outputs/chicago-cac-alpha/independent-audit.md` |
| Houston TOMAGWA | `outputs/houston-tomagwa-audit/audit.md` |

Deferred Seattle also references absent `outputs/seattle-phra-repair/independent-acceptance.json`; it is outside active completion. These are broken reproducibility links, **not proof the original review never occurred**. Root should locate preserved originals, copy only compact unique evidence into durable tracked paths and update references; if originals cannot be located, mark missing acceptance evidence and re-review the affected bounded artifact. Do not manufacture replacements from accepted status alone. EOC/Doctors Care acceptance `.json` paths now exist; earlier `.md` issues are corrected.

## Separate nonblocking SF maintenance remains incomplete

`docs/geography-execution-budget.json` is the later authoritative scope: seven active editions, Seattle/Boston/Atlanta/Detroit deferred, SF preserved. The additional route/exploratory coverage lane has **5/24 accepted, 19 remaining** (VTL, YMCA, New Door, Self-Help, Huckleberry accepted). `exploratory-coverage-topology-2026-10-04.json` freezes 21 original exploratory identities and consumers; its passing topology test checks identity/hash/existence, **not scientific acceptance**. None of the 19 is certified here.

The older backlog/inventory append-only checkpoints still say further SF coverage must precede expansion, whereas the later execution budget makes it separate nonblocking maintenance. Add a concise supersession banner/link while preserving historical snapshots and unchecked original rows. Do not silently reinterpret those old rows as current unfinished original-queue reviews, or use a seven-edition finish to claim all SF models recalibrated.

## Verification performed

Existing Node 24.18.0, no installation/build/server/copy. Commands ran read-only at the snapshot:

1. `node --test scripts/income-health-equivalence.test.mjs scripts/better-paying-jobs.test.mjs scripts/geography-reports.test.mjs scripts/research-effort.test.mjs scripts/exploratory-coverage-topology.test.mjs`: **29 passed, 0 failed**.
2. All 66 existing files whose names match `(calibrated|legacy-current|legacy-historical|pacific-hearing-recalibration).*test.mjs`: **301 passed, 0 failed**. Includes original 27 new recalibrations, SF top-ten and legacy/current/historical preservation, plus additional covered maintenance families. Passing these does not close missing alpha signed-income coverage or missing evidence links.
3. Registry identity/signed-scenario reconciliation for original 30 geography reports: **30/30** exists/beta/signed.
4. Literal acceptance-path existence scan: six absent paths by report, five active and one deferred; shared Chicago path represents two reports.
5. Git/PR state and PR385 ancestor check described above. Local HEAD unchanged and Git status clean during audit.

Space Saver: existing runtime/checkout reused; no generated dependencies, downloads or server created. Filesystem 29 GiB available at audit; retain only this compact evidence note. Zero organization research minutes assigned.

## Exact next fixes / acceptance gate

1. Persist a 69-report remediation/triage inventory and address the proven TOMAGWA/CRT missing signed assessment first, without reopening completed geography discovery or inflating publication counts.
2. Restore five active reports' missing acceptance evidence references from real originals, or explicitly mark/review missing evidence.
3. Add historical-document scope supersession linking the current execution budget; retain the 19 SF maintenance boundaries separately.
4. Complete root's all-seven manifest/live-price/top-four parity audit, then reassess overall completion against the every-initial/deep holistic requirement—not counts alone.
5. Resolve PR384's open Git closure under appropriate authority; PR385 implementation is already merged.

No recommendation to stall for exhaustive new geographic expansion; no completion certification until the material signed-assessment/evidence gates are resolved or the human explicitly narrows the requirement.
