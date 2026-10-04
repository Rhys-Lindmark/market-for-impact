# Independent SFAF calibration acceptance audit — 2026-10-01

**Accept the model/report calibration within its stated conditional scope. No material correction identified.** This accepts implementation fidelity and the evidence/assumption boundary, not measured local cost-effectiveness, verified marginal funding capacity, or final public integration.

Reviewed `lib/sfaf-calibrated-model.mjs`, `lib/sfaf-calibrated-report.mjs`, `lib/sfaf-portfolio-model.mjs`, frozen scenario defaults, and `docs/geography-discovery/sfaf-calibration-decision-2026-10-01.md`. Read current AGENTS and research-effort requirements; applied previously fully read Space Saver. No checkout edits, nested workers, dependency installs, servers, or integration actions.

## Material checks

- Frozen clinical engine and JSON hashes exactly match the calibration decision: `30b54918bfdfe5e084452cb3c5fd2e2dac7fc48b17ded5791d47f3a3b6632bdb` and `80e2ca0cccbdaa855e1bfb0b860aa43f6db46ee4ab219a99b2b69ca3ab7e0f4f`. Executed central gives Bay 0.5189791509372967 combined years and $1,926,859.6786479007 per ten, unchanged from clinical central. Positive/adverse resources, full positive overlap, short tails and outside-input diagnostics reproduce decision values.
- Money exposure uses financially additional PrEP offers before clinical-only .90 deduplication. Setting clinical dedup to zero and OD rescue increment to zero leaves positive resource benefit intact and health zero. No health utility/adherence multiplier incorrectly scales money. Funding response and unique-resource fraction each apply once.
- Resource discount uses one midpoint at calendar .75; applicant costs use .25. No survival-horizon earnings tail or second clinical discount is added. Independently adjustable timing is explicit in the input schema.
- Signed resource losses remain negative. Failed additional-care scenarios retain genuinely additional applicant costs; literal no-change returns zero/null. Applicant exposure deliberately has no funding/completion multiplier. Narrative expressly requires disjointness from costs already included in the resource ledger.
- Portfolio assignment uniformly scales regional health, income, applicant burden, overlap and final total once; it does not scale donor cost. Checked numerically at assignment .4 with both negative resources and independent clinical harm.
- Regional shares nest separately for each stream. A diagnostic with Bay-only harm correctly permits signed SF benefit to exceed signed Bay benefit. No final-total geographic monotonicity clamp erases harm.
- Overlap subtracts the regional minimum of positive resource and positive PrEP net-health components only. Negative income receives no overlap relief; verified numerically. Default zero overlap is identified as a diagnostic judgment, not measured beneficiary separation.
- Fee adds to donor numerator without shrinking service offers; a 3% fee leaves welfare unchanged and makes donor cost $103,000. Exploratory gift above $100,000 is rejected. Unknown keys, string numerics, impossible allocations, nonnested resource shares, resource losses at/below minus baseline and burden at/above baseline reject as declared. This is a bounded domain check, not exhaustive fuzzing.
- Report consistently labels clinical parameters and geographic shares as judgments and the central as conditional. Its zero net-resource component is an identification choice, not evidence that SFAF has no economic benefit. Housing, benefits-navigation and other unquantified portfolio effects remain explicitly inside the priced organizational gift. Income-equivalent years are distinguished from clinical QALYs. No forced price change is warranted.
- Original-report spread preserves only organization identity, eyebrow, donation URL and historical publication date; no stale original clinical/free-service narrative leaks through that spread. Root should retain the existing update/calibration-date display convention during integration.

## Independent source spot-check

Read [official insurance billing FAQ](https://www.sfaf.org/health-services/insurance-billing-faqs/) and [current official PrEP page](https://www.sfaf.org/health-services/prep-pep/). The FAQ describes fall-2026 insurance billing, possible patient charges, sliding scales and assistance; the PrEP page says billing has begun and lists enrollment/follow-up visits. These support the report's current payer/cost caveats and do not identify net incremental participant resources. No universal-free-care claim remains in the new report.

The author inspected all three original audits. This bounded audit checked the stated reconciliation arithmetic and report/decision consistency, but **did not independently reopen those three audits** or re-audit every inherited clinical citation. Gross expense arithmetic is $46.733M, $46.259M, $47.219M; mean $46.737M. Their source authenticity/page-level classification remains author-source evidence, not newly duplicated independent evidence.

## Boundary and handoff

Root owns provenance integration and report/API/list/mobile checks. This worker did not run those release checks or claim public acceptance. The remaining scientific uncertainties are accurately disclosed rather than repaired through invented effects: marginal capacity, rescue and coverage increments, recipient costs, causal housing/benefits effects and shared-provider attribution.

Closed source-audit record: `/private/tmp/sfaf-independent-audit-closed-20261001.json`. Actual dedicated interval 21:32:18.950–21:33:53.667 UTC, **94.717 seconds (1.579 minutes)**. Preliminary file retrieval before the successful timer start is unmeasured; coverage remains partial. Runtime model/effort was not verified in this worker's metadata, so the record uses null rather than inferring from historical user attribution. No idle waiting, build, deployment or integration time is included.

Space Saver baseline: existing checkout 100 MB; filesystem 27 GiB available. Only small temporary audit/timing artifacts created; no bulk assets or cleanup needed.

Root provenance clarification: the user explicitly confirmed current research models as GPT-6.1 Sol. This reused worker inherited the parent model without an override; the owner records its actual interval with that user-confirmed attribution, not as independently measured runtime metadata.
