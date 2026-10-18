# Concrete-unit cost lines for all Top 4 pages

Scope: 32 featured cards across SF and seven active geographic editions. Add a concrete service/output cost alongside, not instead of, existing DALY comparisons. Reuse accepted published inputs; do not change scientific models, recommendations, report counts or restart blocked research. No new recurring work.

Manager/integrator: root. Implementer: native_unit_catalog (read-only extraction of 28 existing edition records); root handles SF and independently accepts arithmetic and scope. Root alone edits/publishes. Stall threshold: 20 active minutes without an accepted evidence or implementation milestone; checkpoint rather than expand research.

## Acceptance checklist

- [x] 1. Scope and evidence: 32/32 card entries reviewed. 29 have reproducible numerator, denominator, boundary and report/source reference. Human explicitly chose existing DALY-only for the three unsupported native outputs (Cultivando, Air Alliance Houston, LA CCA); no invented native denominator.
- [x] 2. Implementation: shared backend calculation/formatting and reusable cost-line component on both homepage renderers; original DALY values remain intact. Separate observed delivery averages from modeled service/event equivalents.
- [ ] 3. Verification: selection coverage, exact arithmetic, invalid/missing/zero controls, unchanged scientific inputs, all eight routes, mobile/tablet layout and production build.
- [ ] 4. Release: published version, live 8/8 route verification, GitHub/local main integration preserving concurrent work; owned server/worktree/archive cleaned.

Current phase: 3. Verification. No new organization research or model calibration.

## Evidence and progress

- 2026-10-18: Verified GiveWell reference uses a concrete native service cost followed by an aggregate impact cost. SF currently features ReCARES, Self-Help, HOPE Pacifica and PHC; other seven editions have four accepted entries each.
- Disk baseline: approximately 21 GiB free before isolated release; compatible existing dependencies reused by symlink, no installation. One isolated release worktree. Preview port will be checked before launch and its session tracked here.

- Root independently accepted all existing scalar selectors and source IDs. The two policy event extractions reproduce current probability chains: CA CCA counts five undiscounted projected event-years; CSPI counts only its lasting-policy nonfatal case component, never timing-only acceleration. Neither is observed impact or a verified donation offer. Native unit expressions introduce no new scientific parameter.
- Numeric acceptance: five focused test groups pass, including 25 edition scalar checks plus four SF checks, all 32 coverage entries, three deliberate DALY-only fallbacks, unchanged registry data and invalid/stale controls. Backend configuration: data/featured-unit-costs.json; expressions evaluated by lib/featured-unit-costs.mjs. Data/current analytical model files unchanged.
- Native monetary formatting does not use the DALY /10 conversion. Dollar amounts below $10K remain full dollars for useful unit-cost precision; K zero decimals and M one decimal above that. Calculation disclosure retains fractional modeled event counts, never rounding a nonzero count to zero.

- 2026-10-18T16:48:10Z verification milestone: 13 focused Node checks and 18 phone/tablet browser checks passed. Includes all eight pages, all 29 numeric native lines, the three absent native placeholders, expanded scope/calculation content, no zero-rounded fractional event count, retained DALY comparisons, unchanged SF ranking, no captions and no horizontal overflow. Desktop USA and phone SF screenshots visually inspected at /private/tmp/givebetter-native-unit-desktop-20261018.png and /private/tmp/givebetter-native-unit-phone-20261018.png. An initial assertion falsely matched `0.00...` as zero because Playwright trims expected text; replaced it with numeric parsing. All current browser checks pass.
- Preview: isolated release, port3107, retained execution session78032, `npm run dev -- --port3107`; graceful shutdown via session interrupt before release cleanup. Disk phase check:122MB task worktree, about21GiB free, shared dependencies unchanged.
- Final console review caught one duplicate CA CCA source link/key, removed before packaging and covered by a source-ID uniqueness assertion. The first build was interrupted before commit/publication to apply that correction; the final build must use corrected source.

Remaining: production build, publication/live verification and teardown. Original report research provenance/counts/prices remain unchanged; this feature's extraction/testing is not represented as recovered or additional research time in reports.
