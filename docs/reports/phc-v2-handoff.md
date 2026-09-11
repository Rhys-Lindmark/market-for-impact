# Project Homeless Connect V2 — handoff and verification

Status: complete research packet, ready for independent audit. Conditional whole-project-gift / partial-health assessment; not a verified marginal funding recommendation. No Site files edited, Site tools used, outreach, installations, or nested agents.

## Timing and provenance

Focused PHC research, drafting and validation interval observed: September 11, 2026, 17:08:46–17:29:13 UTC (20 minutes 27 seconds). Final handoff writing followed immediately; it is not added to that research duration. The approximate 30-minute request was treated as a substantive effort target, not a reason to pad work or fabricate time. This is focused wall time, not instrumented active research or CPU time. Earlier HAC work and scheduling gaps are excluded.

Requested/dispatched model and effort: gpt-6-astra / low, from parent task provenance. No independent runtime identity claim. Space Saver and token-saver applied: existing checkout and runtimes reused; no dependencies or servers created. One sponsor financial-table PNG and one project budget PNG retained as small visual verification evidence. Free disk observed 62 GiB; no bulk evidence downloads retained.

## Deliverables

- `/private/tmp/mfi-v2-phc-report.md`: 6,151 words; 740-word labeled summary with More links; ten substantive sections.
- `/private/tmp/mfi-v2-phc-report.json`: canonical prior renderer shape, `longForm` array of ten `{id,title,markdown}` sections, and `fullMarkdown` exactly matching Markdown artifact.
- `/private/tmp/mfi-v2-phc-model.mjs`: accepted calculator byte-for-byte.
- `/private/tmp/mfi-v2-phc-inputs.json`: accepted inputs and 15 scenarios byte-for-byte.
- `/private/tmp/mfi-v2-phc-results.json`: accepted complete results byte-for-byte.
- `/private/tmp/mfi-v2-phc-model.test.mjs`: portable Node tests, no dependencies.
- `/private/tmp/mfi-v2-phc-financials.json`: sponsor three-year context, separate historical PHC city-contract budget/actuals, in-kind scope, current unknowns and funding transition.
- `/private/tmp/mfi-v2-phc-sources.json`: primary URLs, publication/fiscal dates and retrieval dates. Prior clinical sources not substantively reread retain September 8 retrieval; newly read sources September 11.
- `/private/tmp/mfi-v2-phc-prior-report.json` and `-historical-glasses.json`: preserved comparison artifacts.
- `/private/tmp/mfi-v2-phc-build.mjs`: emits an apply_patch packet to regenerate report/source/financial JSON from the report and source edits; does not write Site files.
- `/private/tmp/mfi-v2-phc-finance-table.png`, `-project-budget.png`: original financial layout verification.

## Material findings / integration requirements

1. **Public project funding existed.** May 2, 2024 HSH contract packet supplies a $1,460,295 FY2024–25 city-contract budget, 10.45 FTE, salaries $760,732, fringe $214,526, operating $294,564, indirect $190,473. It is not whole-project actual spending. Historical actual city expenditures are separate. Do not retain a blanket historical “all privately funded” claim.
2. **Post-cut operating baseline needs revalidation.** June 5, 2025 director presentation describes approximately $1.4m proposed cut; adopted minutes attribute a termination-notice claim to PHC's executive director. September 5, 2025 sponsor update independently confirms lost key funding and Bridge Campaign. Its current campaign link is general giving, with no verified outstanding clinical tranche. Keep proposed cut, attributed notice, confirmed funding loss, and unknown replacement distinct.
3. **Do not infer closure.** June 17, 2026 official Elections report documents a May PHC partnership. This supports continuing activity, not restored clinical capacity or old funding. Current clinical staff, partner appointments and whole project finances remain unknown.
4. **Sponsor totals are not PHC cost.** Three returns through FY2025 and corresponding audits reviewed. FY2025 audit expense $89,372,099 versus 990 $89,142,542 reconciles exactly. PHC in-kind $19,976 is not its budget. FY2024 named in-kind $64,730 and FY2023 $31,035 clothing/household category primarily used by PHC must retain differing boundaries.
5. **Completion and shared clinical attribution.** February 2025 optical notice targets eligible Medi-Cal members with prescriptions and excludes exams. Historical screenings are not fittings. Hearing partner HSC benefits cannot be independently added across charity reports for the same patient-year. The stand-alone model's attribution is a prior, not identified joint credit.
6. **Vision-source caveat.** 41/113 includes failure to obtain glasses, not pure outcome attrition. Preserved source-attrition scenario is a pessimistic transport diagnostic, not a clean correction or second completion discount. No coefficient changed.
7. **No scale-up promise.** Per-10-QALY price normalizes a $100k gift. Fixed scenario caps bind at $150k glasses/hearing and $160k dentures; cannot promise 10 QALYs for a gift equal to the displayed ratio.

## Exact numerical acceptance

Central donor Bay cost: $774,408.3401731638 per 10 QALYs. Gross associated-resource Bay cost: $1,084,171.6762424293. US/Bay/SF QALYs: 1.3176616396423815 / 1.2913084068495337 / 1.2517785576602622. Full gift $100,000; gross associated envelope $140,000. The resource envelope is not net induced societal expenditure. No probability weights introduced; central is not a mixture expectation.

`node /private/tmp/mfi-v2-phc-model.test.mjs`: **4,441 checks pass**, 15 full-result deep-equalities, 1,000 finite signed parameter tests, numerical-integration checks, null/harm behavior, cost/geography identities, malformed/missing inputs, schema, source fields, long-form anchors, cap behavior and finance reconciliation. All four preserved model/input/result/historical files separately byte-compared to the read-only checkout and matched.

SHA256:

- model: `c79de8369478558b5f36092b2ea85666d49aa086abd5f2f41a237cb39a49ed49`
- inputs: `27fecacdbb87b53247a51caca4dfb6c2e914bc8c131e15921289c95931629601`
- results: `c76e800a3b8159935c62b770885908674894e70501bd0ed7d9de2e7d47a9c0f7`
- historical glasses: `cc69c6242e3910f10a73b36a7e6832c31c35459fcf569e932d5286d948626283`

Independent audit should prioritize the funding-transition interpretation and correct city-contract versus whole-project boundaries. The numerical model is intentionally preserved, not validated as the current post-cut operating plan. Root alone integrates the Site.
