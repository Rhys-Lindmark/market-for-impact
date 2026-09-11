# All unified rows: central-statistic adapter map

Read-only audit of `work/market-for-impact-v2-fuf`, September 11, 2026. No Site/model edits, installs or coefficient changes. Reused Node to execute model outputs and inspect exact central identifiers. Scope is every input lane of `lib/unified-research-index.ts`: SF index, Bay index, selected seven and local rescue. National/expanded indexes are not inputs to this unified list.

Notation: `r` is the existing full model result, `c` the selected row below. `P(g,q) = q > 0 ? 10*g/q : null`; check the derived ratio is finite. Do not coalesce a central-null to weighted/favorable. Preserve full weighted outputs in reports/APIs. SF unknowns currently null should remain null unless an existing modeled SF allocation is explicitly provided.

## Bay index: required changes

All destinations below are `lib/bay-research-index.ts` bindings plus their `bayResearch` row fields. Exact selector case matters.

| Existing model binding | Exact central selection | Bay field / expression | SF field / expression if currently represented |
|---|---|---|---|
|faceToFaceModel()|`r.rows.find(x=>x.id==='central')`|`c.bayCostPer10`|keep null|
|oaklandEdcModel()|`r.rows.find(x=>x.id==='central')`|`c.bayCostPer10`|keep null|
|onSiteModel()|`r.rows.find(x=>x.id==='central')`|`c.bayCostPer10`|keep null|
|hifModel()|`r.rows.find(x=>x.id==='central')`|`c.bayCostPer10`|keep null|
|batsModel()|`r.rows.find(x=>x.id==='central')`|**`c.costPer10`**, not bayCostPer10|keep null|
|dowModel()|`r.rows.find(x=>x.id==='central')`|`c.bayCostPer10`|keep null|
|sosModel()|`r.rows.find(x=>x.id==='central')`|`c.bayCostPer10`|keep null|
|greenlightModel()|`r.rows.find(x=>x.id==='central')`|`c.bayCostPer10`|keep null|
|legalLinkModel() [runModel]|`r.rows.find(x=>x.name==='Central')`|`c.bayCostPer10`|`c.sfCostPer10`|
|bamruModel()|`r.rows.find(x=>x.name==='central')`|`c.bayDonorCostPer10Qaly`|`P(r.inputs.giftUsd,c.sfQaly)`; no precomputed SF price on row|
|baylegalModel()|`r.scenarios.find(x=>x.name==='central')`|`P(r.inputs.ordinaryGiftUsd,c.bayQaly)`|`P(r.inputs.ordinaryGiftUsd,c.sfQaly)`|
|lacasaModel()|`r.rows.find(x=>x.id==='central')`|`P(r.inputs.giftUsd,c.bayQaly)`|`P(r.inputs.giftUsd,c.sfQaly)`; row donorUsdPerTenQaly is total, not Bay|
|melpModel()|`r.rows.find(x=>x.name==='central')`|`c.bayDonorCostPer10Qaly`|`c.sfDonorCostPer10Qaly`|
|berkeleyFreeClinicModel()|`r.scenarios.find(x=>x.name==='central')`|`P(r.inputs.ordinaryGiftUsd,c.bayResidentQaly)`|`P(r.inputs.ordinaryGiftUsd,c.sfResidentQaly)`|
|youthAliveModel()|`r.scenarios.find(x=>x.name==='central')`|`P(r.inputs.gift,c.bayQaly)`|keep current null; do not relabel total donor price Bay without checking geography|
|safeSoundModel()|`r.scenarios.find(x=>x.name==='central')`|`P(r.inputs.gift,c.bayQaly)`|`P(r.inputs.gift,c.sfQaly)`|
|sonrisasModel()|`r.scenarios.find(x=>x.name==='central')`|`P(r.inputs.giftUsd,c.bayQaly)`|keep null|
|sisterwebModel()|`r.results.find(x=>x.name==='central')`|`P(r.ordinaryGift,c.giftBayQaly)`|`P(r.ordinaryGift,c.giftSfQaly)`|
|ceresModel()|`r.scenarios.find(x=>x.name==='central')`|`P(r.inputs.giftUsd,c.bayQaly)`|keep null|
|heppacModel()|`r.results.find(x=>x.name==='central').conditionalOrdinaryGift`|`c.bayDonorPer10Qaly`|`c.sfDonorPer10Qaly`; do NOT use annual whole-org spending ratio|
|marinTreatmentModel()|`r.scenarios.find(x=>x.name==='central')`|`P(r.inputs.gift,c.bayQaly)`|keep null|

**Additional hidden weighted base: Bayview Hunters Point Foundation.** Current `calculateResidenceSensitivity().residenceSensitivity.find(s=>s.id==='subjective-central')` selects central *geography*, but wrapper uses `base.weighted.netQaly`. Import existing `calculate` from `bvhpf-model.mjs`; select `base.scenarios.find(s=>s.name==='central')` (verify original result array name when implementing), and use `P(base.inputs.giftUsd,c.netQaly*0.90)` Bay / `P(base.inputs.giftUsd,c.netQaly*0.65)` SF, retaining the existing subjective-residence label. Prefer obtain 0.90/0.65 from exported `residenceScenarios` rather than duplicate literals. Do not alter the original residence sensitivity model or pass a fabricated weighted object into it. If policy excludes residence priors from ranking, set both prices null instead; no measured residence is available. Current wrapper's own recommendation cautions about primary ranking, so this is a statistic repair, not new evidence approval.

The 21 listed bindings plus BVHPF currently select a weighted aggregate or a result containing one. All have an identified central world; **none requires inventing a new central scenario**.

## Bay index: already central, preserve

- ReCARES: `recaresModel().rows.find(row=>row.name==='central')`; Bay/SF row prices.
- Pacific Hearing Connection: `pacificHearingModel().rows.find(row=>row.id==='central')`; Bay row price.
- FUF now fixed: `fufModel().scenarios.find(s=>s.name==='central')` from `fuf-v2-model.mjs`; current shares both1. Preferred central $1,652,627.0127335358, not weighted $941,689.
- RotaCare: `rotacareModel(data.scenarios.find(s=>s.id==='central').inputs)`.
- Roots: `rootsModel(rootsData.scenarios.find(s=>s.id==='central').inputs)`.
- Healthier Kids: `hkfModel(hkfData.central_inputs)`.
- Via Heart: `viaModel(viaData.central)`.

## Other unified lanes

**`lib/research-cost-ranking.mjs`:** Clinic by the Bay is the remaining explicit weighted override: remove `centralUsdPerTenQalys:clinicExpected(...).donor_sf_per_10q` and corresponding Bay override from its scenarioRow construction; supply both `donor_sf_per_10q` and `donor_bay_per_10q` from `clinicModel(clinicInputs(clinic,s))` inside the existing scenario callback. Keep expected-value function/report untouched. NEMS central-null/Bay-null is correct and must remain. All other executable scenarioRow entries select a named central case (or explicit central input) rather than expectation. Registry rows use stored central transfer estimates, not scenario mixtures; GLIDE/New Door registry copies are excluded in favor of their executable adapters. This statistic audit does not re-approve old program-only cost scopes.

**`lib/selected-seven-research.ts`:** all seven already use `(r.rows??r.results).find(x=>x.id==='central').bayCostPer10`: Alameda Health Consortium, Rainbow, Easy Does It, Acknowledge, MCBC, SVBC, Oakland LGBTQ. No statistic change.

**`lib/local-rescue-research.ts`:** Micah `.rows[id=central]`, NEED `.results[id=central]`, HOPE `.centralScenario` already correct. No statistic change.

**`lib/unified-research-index.ts` / `local-research-estimate.mjs`:** preserve own-property null and sorting null last. Do not implement a fallback to weighted when central is null. The display's “central” promise needs adapter equality, not merely a field named central.

## Verification targets

- Exact model-row equality for every changed adapter, including derived Bay/SF ratios; assert exactly one matching central identifier.
- Preserve weighted snapshots and all coefficients; no results regeneration needed for a selection-only change.
- BATS key trap `costPer10`; Legal Link capitalized `Central`; BAMRU lacks row SF price; HEPPAC nested ordinaryGift versus annual ratio; BVHPF central geography is not central health.
- Re-sort then verify every selected homepage slug has a card/fallback. Rankings can change in either direction; do not retain weighted values to protect earlier order.
- Null outcomes show “not estimated/no positive central estimate” as appropriate, never a favorable replacement.
