# MELP + shared device comparison integration checklist

Read-only integration review began 2026-09-11 02:37:28 UTC. Checked existing `work/market-for-impact-recares` implementation; destinations below are relative to that checkout (or its root-selected successor), not instructions to create a second checkout. No Site files edited. Parent-confirmed dispatch gpt-6-astra / low, UI name GPT-6 Astra Lite; identity is dispatch evidence, not self-introspection.

## Exact artifact-to-destination handoff

| Existing artifact | Repository destination / action |
|---|---|
| `/private/tmp/mfi-melp-report-final.json` | `data/bay/melp-report.json` — renderer-ready version; replace draft publication label only on actual publication |
| `/private/tmp/mfi-melp-model-v1.mjs` | `lib/melp-model.mjs` — preserve coefficients, weights and defaults |
| `/private/tmp/mfi-melp-source-ledger.json` | `data/bay/melp-source-ledger.json` |
| `/private/tmp/mfi-melp-results.json` | `data/bay/melp-model-results.json` — reproducibility fixture, not separately maintained forecast |
| `/private/tmp/mfi-device-clinical-comparison-helper.mjs` | `lib/device-clinical-comparison.mjs`; change only imports to `./melp-model.mjs` and `./recares-model.mjs` |
| `/private/tmp/mfi-device-clinical-comparison-report.md` | `docs/device-clinical-comparison.md` |
| `/private/tmp/mfi-melp-independent-audit.md` | `docs/melp-independent-audit.md` |
| `/private/tmp/mfi-melp-clinical-independent.md` | `docs/melp-clinical-independent.md` |
| `/private/tmp/mfi-melp-provenance.json` + finalization notes | `docs/melp-research-provenance.json` + `docs/melp-finalization-notes.md`; retain historical draft status as history, add integration status separately |

Create `app/charities/melp-ablecloset/page.tsx`, following the ReCARES wrapper: import `CharityResearchReport,{type CharityReportContent}` from `@/components/CharityResearchReport` and report from `@/data/bay/melp-report.json`; add real native `/api/melp-model` and `/api/device-clinical-comparison` anchors within `nutshell.body`. Keep exact organization **MELP/AbleCloset** for effort lookup. Metadata should say exploratory whole-organization lending model, not recommendation.

Create `app/api/melp-model/route.ts`: import `{calculate,inputs,scenarios,modelVersion}` from `@/lib/melp-model.mjs`, sources from the ledger, and `{compare}` from `@/lib/device-clinical-comparison.mjs`. Return the full inputs, all six raw scenario matrices, sources, `evaluated:calculate()`, `clinicalComparison:compare()`, explicit null verified marginal funding/resources, and analyst-prior interpretation. The model exports these names. Do not expose only scalar results.

Create `app/api/device-clinical-comparison/route.ts`: return `compare()`. Helper exports `compare`, `replacement`, `categoryPairs`, `positiveScenarioNames`; it is pure and has no file writes. All four diagnostics include exact replacement maps. Add the symmetric disclosure/API link to ReCARES report/page; preserve its base model. This comparison is not an additional charity/report count.

In `lib/bay-research-index.ts`, import `{calculate as melpModel}` from `./melp-model.mjs`; use `const melp=melpModel().weighted`. Add one record with organization `MELP/AbleCloset`, href `/charities/melp-ablecloset`, `bayUsdPerTenQalys:melp.bayDonorCostPer10Qaly`, `sfUsdPerTenQalys:melp.sfDonorCostPer10Qaly`. Do not duplicate AbleCloset in another index. Recheck current indexes/routes before insertion; earlier duplicate check is dated, not a guarantee against concurrent work. Do not promote to homepage top opportunity on the favorable-world price.

## Acceptance checks

- MELP default weighted Bay health **0.033226287408123834 QALY / $10k**; cost/10 **3009665.171786541**. Central **1725533.9361939395**. Preserve signed null/harm worlds and 91.8% favorable-tail contribution; subjective 3% threshold mass is not calibrated probability. No linear $100k scale assertion.
- ReCARES default weighted Bay cost remains **185910.27585974694**. Shared swaps are diagnostics only: MELP central-only weighted **$2,117,236**, all matched worlds **$1,317,403**; reverse ReCARES **$250,711** and **$507,197**. Pediatric, null/harm, costs, geography, safe use, unmet access and weights unchanged.
- `node /private/tmp/mfi-melp-test.mjs` passes 18 checks; shared comparison test also exited 0 in this review. Adapt copies to repository test paths/imports; MELP local test writes a `/private/tmp` result, so do not ship that hardcoded path. Do not ship build/finalize scripts as API code: they read/write local artifacts.
- Add report route/index/API coverage to current `e2e/research-contract.ts` and relevant research index, effort, scope and donation-route tests. Derive expected counts from current branch, not stale 83/84 totals. Run current lint/typecheck/build and applicable browser contracts using existing dependencies. Verify canonical rewritten `/givebetter/api/...` links, not only local routes, after publication.
- Final JSON required arrays are nonempty; sensitivity is nine `{case,headline,detail}` rows; source URLs unique; no private paths. Wrapper ReactNode body is compatible. `eyebrow`/`inputColumnLabel` are accepted but not rendered, so substantive caveats must remain in rendered body. Update effort and progress/count records only for actual canonical publication.

## Remaining correction / source limits

1. Replace “standard six-month horizon” with **“AbleCloset's usual six-month pediatric loan limit; extensions can be requested.”** Add direct official source `https://ablecloset.com/how-it-works/` to report sources and ledger at integration. Independently reviewed in `mfi-melp-clinical-independent.md`: some recreational items allow only two weeks–two months. The favorable .75-year value remains an analyst extension/continued incremental-use assumption, not measured use. Adult MELP has no established universal six-month limit. This is the only substantive source-precision correction identified; it does not change numbers.
2. Effective years already means incremental useful time before alternative access, need resolution, discontinuation or failure. Do not reinterpret as physical device life or add a second identical access-delay haircut. Lower MELP utility/duration is not established organization-specific evidence; comparison now states this.
3. Planned 960 district clients / .28 share is a **forecast-derived client-equivalent denominator**, not measured unique borrowers; retain dedup. Use whole planned expense $169,269, not cheaper historical expense or a restricted program denominator. Public awards/reserves establish funded baseline concerns, not verified incremental gift absorption. $46k request is not a proven current gap; the $43,154 recommendation is not proof of payment. Complete donated-equipment/labor/fitting/transport resource costs remain unknown.
4. Functional trial effects are not QALYs. Retain null 0–100 health-rating result and nontransfer caveats; never divide it by 100 to invent utility. BATH-OUT installed showers cannot supply a portable-chair coefficient. No pediatric developmental/lifetime benefit established.
5. Some source labels retain cosmetic joined words (e.g. Form990-EZ, ScheduleO); prose cleanup is safe without altering claims. No remaining renderer schema mismatch found.

## Supported timing, without backfill

All intervals on 2026-09-11 UTC. Register actual intervals with worker identity and phase; do not count overlapping same-worker time twice or charge shared work fully to both reports.

| Phase | Start–end | Seconds | Evidence |
|---|---|---:|---|
| MELP preceding discovery | 00:56:18–00:59:00 | 162 | `mfi-device-vision-next-shot.md`; separate from full research |
| Full MELP research/model | 01:00:29–01:18:00 | 1051 | `mfi-melp-provenance.json` |
| Independent clinical assessment, other worker | 01:11:35–01:13:05 | 90 | `mfi-melp-clinical-independent.md` |
| Shared clinical comparison, other worker | 01:20:15–01:21:50 | 95 | `mfi-device-clinical-comparison-report.md`; shared phase, attribute once |
| MELP finalization | 01:23:02–01:24:36 | 94 | `mfi-melp-finalization-notes.md` |

The independent full-audit artifact records a 01:17:09 start but no completion timestamp found; do not invent an end. Root may possess an actual completion message. Full research + finalization alone is 1145 seconds (~19 min); including preceding discovery is 1307 seconds (~22 min). Other-worker evidence time is additive only under the product's explicitly declared effort convention. Preserve partial coverage and exact intervals rather than claiming these represent every prior minute. ReCARES integration audit 01:19:37–01:21:33 belongs to ReCARES, not MELP. This checklist's separate timer is recorded below.

Space Saver: reused existing 73 MB checkout and Node runtime; 65 GiB free at check. No dependencies, servers, generated directory copies or new checkout. No cleanup needed; evidence preserved.

Checklist completed 2026-09-11 02:41:40 UTC; elapsed 252 seconds (4m12s). This is integration-review time, not retroactive primary research.
