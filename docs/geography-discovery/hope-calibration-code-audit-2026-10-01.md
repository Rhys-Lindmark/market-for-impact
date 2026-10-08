# HOPE calibrated code: independent acceptance check

October1,2026. **Accept central/default and specified diagnostic arithmetic; hold API field-semantic acceptance until historical marginal fields are isolated or recomputed.** Inspected `lib/hope-calibrated-model.mjs`, `/api/hope-v2-model`, historical endpoint and page linkage against `hope-pacifica-calibration-challenge-2026-10-01.md`. No product edits.

## Passed arithmetic/boundaries

Independent direct evaluations match the addendum:

| Case | Bay health | Income-equivalent years | Price |
| --- | ---: | ---: | ---: |
| Marginal central,$1k | .018029077420304646 | 0 | $554,659.5517271358 |
| Purchaser.1/$19/$50k | .016226169678274182 | .00005639553552674729 | $614,153.8430028277 |
| Adverse$5/allholders | .018029077420304646 | −.00014844492236982878 | $559,264.3325763214 |
| Health/harmnull,purchaserpositive | 0 | .00005639553552674729 | $177,319,000.637155 |
| Jointadverse | −.0000475 | −.00014844492236982878 | Null positive price |
| Annual work,$40k assumedexpense | 1.4423261936243716 | 0 | $277,329.7758635679 |

Marginal central2.5risk-equivalents/3.125holder-equivalents; annual200risk/250holders. Annual removes extra-gift response while keeping one-year net mortality gain and subsequent ten-year survival. Scope correctly changes numerator to assumed annualexpense, not another donor gift. It is a conditional annual-work comparison, not measured annual output or expenditure.

Positive purchaser diagnostic removes10%health before adding cash, enforcing hypothetical purchaser/no-additional-health partition. No extra baseline survival earnings or donor-income subtraction. Adverse cash is independently negative and applied to all modeled holders, as specified. ZeroBay returns finite0total; funding0 yields no marginal holder/health/cash benefit even under positive-purchaser inputs, keeps$1,000spending and null positiveprice. Gift0 returns zeroexposure/cost/nullprice. Invalidscope and nonpositive post-loss baseline rejected. Central horizon10/funding.5 retained; no abandoned central haircut reintroduced.

## Concrete issues communicated to parent

1. **Mixed-scope historical fields in current API output.** Row `{...r}` retains historical marginal `additionalPeople`, `grossQ`, `harmQ`, `allQ` while replacing `bayQ` with current total health+income. Annual central therefore reports `additionalPeople=2.5,grossQ=.019027976232,harmQ=.00005,allQ=.018977976232` next to annualhealth1.442326193624, which requires200risk-equivalents. Purchaser row likewise retains unpartitioned historical gross/allhealth. Top `{...original}` retains historical marginal US totals/prices and favorable-tail diagnostics while Baytotal is current income-inclusive/scope-specific. Consumers can read mutually incompatible fields as one current ledger. Isolate all these values solely under existing `historicalHealthOnly`, or recompute/name each current field with its proper health-only/welfare/geography/scope meaning. New `healthYears/incomeYears/totalYears` fields are correct; default health-only coincidence does not cure annual/economic contradictions.
2. **Purchaser partition depends on cash sign rather than declared counterfactual.** `{purchaseShare:.1,netSavingsUSD:0,baselineUSD:50000}` retains full centralhealth, despite a declared cohort that already would purchase equivalent protection. Apply health partition to purchaseShare regardless savings sign, and keep adverse-exposure definitions separate. The provided zero-central/default adverse cases usepurchase0 and are correct, but the general input currently admits inconsistent purchaser semantics.
3. **Reproducibility metadata.** Current result does not expose the supplied `income` object. Include purchaseShare, signedcash amount/baseline and adverse exposure meaning with each evaluated case/API, rather than only a diagnosticname. This is not a default arithmetic defect, but makes returned economic cases auditable without reading implementation.

Accepted infinite-horizon and independent post-hazard sensitivities are not yet in code diagnostics, which currently lists horizons1/2/5/10/20. They may be displayed as explicitly separate analytic/report diagnostics, but do not claim current API includes them. Infinite limit$338,987.62 must remain a constant-hazard mathematical sensitivity, not local measured prognosis or an Infinity input bypass of historical validation.

Current page correctly uses current `/api/hope-v2-model`; old `/api/hope-pacifica-model` is explicitly historical. At inspection, page does not yet pass `calibrationDate`, so time/UI integration remains pending rather than accepted. It retains historical21minute/AstraV2 badge. Parent is still integrating report/time registry; no live render claimed.

Actual bounded inspection/calculation **2026-10-01 17:44:20–17:45:56UTC,1m36s,GPT-6.1Sol**; memo writing afterward excluded. Parent notified during the interval. Existing checkout/runtime reused under SpaceSaver/TokenSaver; no server/install/newworker/productedit or PHC product work. This audit is independent of previously passed historical tests and awaits targeted new assertions on API/current-field semantics.

## Follow-up acceptance after parent corrections

**ACCEPT corrected implementation and report parity.** Independent reinspection/evaluation **17:50:15–17:50:33UTC,18seconds,GPT-6.1Sol** confirms current-scope additionalPeople/gross/harm/allQ and top-level USprices/tail/mass fields are recomputed; historical marginal outputs remain separately available. Annualcentral now200risk-equivalents,gross1.522238098552,harm.004,all1.518238098552,Bay1.442326193624. Incomeparameter object returned. Purchaser.1withzerosavings now removes its clinicalcredit:2.25additionalrisk-equivalents,health.016226169678. Originaldefaultcentral and signed economic cases unchanged.

Analytic infinite-horizon diagnostic nowpresent with `notLocalPrognosis:true`,health.029499602152 andprice$338,987.622561; independentposthazarddiagnostics included. Existing bounded-input validation is not bypassed by accepting Infinity as a normal horizon. Calibrationdate passed to time/report component; updatedMarkdown and `data/san-francisco/hope-v2-report.json.longForm.markdown` exactly equal.

Fresh combinedrun of `scripts/hope-calibrated.test.mjs`, `scripts/hope-v2.test.mjs`, `scripts/hope-v2-narrative.test.mjs`: **369/369calibratedchecks,59/59frozenchecks,andnarrativeparitysuite pass**. All three initially reported code/metadata issues resolved. No remaining concrete defect identified in this bounded code/report audit; this is not live-render verification or empirical effectiveness/capacity acceptance. No product edits or other work.
