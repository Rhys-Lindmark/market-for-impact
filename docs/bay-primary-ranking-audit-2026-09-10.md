# Independent Bay-primary patch review

Actual review: 2026-09-11 00:56:09–00:57:11 UTC. Worker dispatch provenance: gpt-6-astra / low, parent verified (Astra Lite). Read-only review of `work/market-for-impact-bay-primary-ranking`; no Site or repository edits. Three requested files and new `lib/local-research-estimate.mjs` inspected after updates appeared.

## Verdict

**Accept math and selection semantics. No material bug found in the reviewed patch.** This is not a claim of completed browser/build validation; root is writing integration tests separately.

The twelve new Bay expressions match actual model exports and retain the same inputs and whole-gift numerator. No secondary Bay multiplier, dollar scaling, favorable-scenario substitution or additional benefit term was introduced. Clinic correctly selects its weighted signed-health expectation, not the unweighted central case.

| Adapter | Verified existing output | Runtime Bay $/10 QALYs |
|---|---|---:|
| Homeless Prenatal Program | `.bay.donor_per_10q` | 26,767,425.840881076 |
| Felton | `.donor_bay_per_10q` | 31,293,135.147821333 |
| SF Public Health Foundation | `.bay.donor_per_10q` | 17,749,313.41954412 |
| Code Tenderloin | `.donor_bay_per_10q` | 1,808,409.4829115197 |
| Walk SF | `.bayUsdPer10Qaly` | 4,578,020.240776207 |
| SPUR | `.bayUsdPer10Qaly` | 2,191,060.473269062 |
| Operation Access | `.regions.bay.donor_per_10q` | 3,244,602.5734338886 |
| New Door | `.bayUsdPer10Qaly` | 228,571,428.57142854 |
| YMCA | `.bayUsdPer10Qaly` | 6,177,370.283316733 |
| Clinic by the Bay | `expectedValue(clinic).donor_bay_per_10q` | 2,002,577.5026953523 |
| SFAF | `.bay.donor_per_10q` | 1,926,859.6786479007 |
| Project Homeless Connect | `.donor_bay_per_10q` | 774,408.3401731638 |

Verification was model-export source inspection plus execution of current ranking adapters, not twelve separately authored oracle tests. The detailed acceptance plan still recommends those independent tests.

## SF preservation: independently executed

Loaded baseline `HEAD:lib/research-cost-ranking.mjs` into an in-memory data module with relative imports resolved against the same checkout; compared it to current ranking after removing only new `bayUsdPerTenQalys` fields. `assert.deepEqual` passed across all 50 row objects: all old SF values, positive ranges, organization metadata and row ordering unchanged. No temporary module files were created.

Executed bundled Node tests:

`node --test scripts/research-cost-ranking.test.mjs scripts/clinic-portfolio-ranking.test.mjs`

Result: 3 tests passed, 0 failed. PHC retains SF 798863.3403891586; Clinic retains its SF expectation.

SF TS map conditionally propagates the new field with `Object.hasOwn`, while retaining its original SF price formatting and rank. Thus legacy SF fields do not silently become Bay fields.

## Null and selection matrix: independently executed

Called the actual exported `localResearchEstimate` helper and asserted exact output price and geography for six fixtures:

- SF100 / Bay absent → 100, San Francisco.
- SF100 / explicit Bay null → null, Bay Area.
- SF100 / Bay80 → 80, Bay Area.
- SF100 / Bay200 → 200, Bay Area (not cheapest geography).
- SF null / Bay absent → null, San Francisco.
- SF null / explicit Bay null → null, Bay Area.

All six passed. `Object.hasOwn` is preserved at both adapter and SF mapping boundaries; the final helper does not use null coalescing. The unified index spreads the helper result and sorts the selected raw price with null last. Existing Bay-index rows and their special BVHPF caveat remain untouched; `scope:'SF'` does not override Bay geography.

## Remaining validation / nonblocking observations

- Root should execute actual unified TS/runtime and DOM tests, including final sort and label propagation. This review inspected those expressions but did not render the app.
- Availability is represented by own-property presence, not a flag; this is a valid contract. Present-but-undefined, NaN, negative or infinite values are not guarded by the helper. Current twelve model outputs are valid positive numbers or model-generated null, so no current material bug found; optional defensive validation should reject/normalize malformed explicit output without SF fallback.
- Adapter lambdas compute the same deterministic model twice for SF/Bay. This is redundant work, not a correctness defect; no refactor needed to accept this scoped patch.
- SF positive ranges remain SF and are not relabeled Bay. No Bay range is introduced, avoiding accidental cross-geography range reporting.
- No evidence that the original clinical models or gift numerators were changed by the reviewed three-file/helper patch.
