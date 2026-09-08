# Toward 100: discovery evidence, not published recommendations

This internal research queue supports issue #191. The target remains 100 unique researched organizations; the CSV is **100 EIN metadata screens, not 100 completed cost-effectiveness models**. Ten records have initial primary-source service checks. Entity independence and program delivery require further verification.

## Evidence map

- [Other-city interventions and ten hypothetical SF ventures](mfi-sf-next100-city-and-incubation.md): ten approaches with transferable evidence, plus ten separate incubation concepts. Not twenty established SF organizations.
- [EA-informed discovery](mfi-next100-ea-lens.md): ten mechanism hypotheses, not automatic local recommendations.
- [New-to-coverage organizations](mfi-next100-new-nonprofit-lens.md): ten candidates; distinguish newly discovered from newly founded.
- [Universe triage design](mfi-next100-universe-triage-design.md), [first 100 screens](mfi-universe-sample100.csv), [identity audit](mfi-sample100-identity-audit.md), and [reproducibility audit](mfi-sample100-reproducibility-audit.md).
- [Top-25 funding correction queue](mfi-funding-correction-queue.md), supported by the six `mfi-top25-funding-*` briefs: public-source diligence completed, but no verified priced marginal offers. Corrections still require integration into individual reports and models.

These are dated research-worker briefs, preserved for review, not acceptance of every provisional inference. Public report counts and rankings do not change when a brief is added here. Follow the audit corrections over earlier draft wording. Do not contact organizations without authorization.

## Provisional model packets: not ready for promotion

SisterWeb, La Casa, Charlotte Maxwell, FCA and NICOS packets are working estimates. The corresponding `model-audit` files take precedence where they correct a draft. In particular: SisterWeb's trial population/protocol and expenditure perspective require qualification; La Casa's proposed CTI-like course is not verified current delivery and its utility trajectory is judgmental; Charlotte Maxwell's payer section must reflect that California's final July2026 budget retained adult acupuncture. None is added to the public ranking by this evidence checkpoint. GLIDE and IOA/FiveKeys correction packets target existing report provenance and cost perspectives, not automatic numerical recalibration.

Read `mfi-universe-sample100.md` for sampling limitations and source dates. This is a purposive IRS-frame sample enriched by contract-name matches, not a representative survey or a screen of every contractor. Thirty records deliberately come from unknown classifications.

`mfi-universe-sample100.selection.json` freezes the selected identifiers, exclusion log and raw-input hashes. Run `node docs/research-queue/next100/mfi-universe-sample100.mjs [checkout]` to reproduce selection against the original snapshots and review state (GitHub commit 83fcb3bd65ed89bc267ab6d4ef0b65f003e30ae2). Its generated rows are pre-editorial metadata; the CSV contains subsequent individual screening notes and ten primary checks. As the review registry grows, exclusions and therefore selection may change. Do not silently overwrite the frozen sample.

Independent audit found that the selector excludes identities from all non-universe JSON, including known SFF grantees that have not received completed reviews. The 78 exclusions therefore mean previously known identities/aliases, not 78 evaluated organizations. Preserve this sample as version 1; a later corrected full-universe screen must distinguish completed reviews from discovery-only records and reconsider excluded grantees. The pinned Git commit is required because exclusion inputs and charity slugs are not separately hashed.

Next: finish the independent identity and reproducibility audits, then select narrow additional programs for full source-backed models. Contractor-only entities and a lower-signal random reserve need separate coverage. No row is an available grant offer and no metadata routing score is an effectiveness score.
