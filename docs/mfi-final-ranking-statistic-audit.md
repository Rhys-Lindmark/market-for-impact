# Final ranking statistic audit

Read-only checkout: `work/market-for-impact-v2-nems`, September 11, 2026. Space Saver reread; reused installed Node and in-memory TypeScript loader, no Site files/generated assets/dependencies changed. Evaluated actual unified index and inspected adapters/models. This is a bounded statistic audit, not a new evidence or whole-scope review.

## Mandatory minimal corrections

1. **`lib/bay-research-index.ts:38–39` / FUF row at64:** still imports historical `fuf-model.mjs` and takes `.weighted` ($1,053,266.60). Pending accepted V2 integration should take its `scenarios.find(s=>s.name==='central')`, giving **$1,652,627.0127335358** with FY2025 sources. Do not use V2 weighted $941,689 as “central.” Preserve both model outputs/report distinctions.
2. **Same file, Face to Face binding lines1–2 and row64:** `faceToFaceModel().bayCostPer10` is weighted **$1,328,756.94**, not central. For a central-only directory use `.rows.find(r=>r.id==='central').bayCostPer10` = **$3,598,461.2566038547**. This non-frozen row is a concrete remaining mismatch; no coefficients change.
3. **Same file, DOW binding lines11–12 and row64:** `dowModel().bayCostPer10` is weighted **$1,584,847.70**. Central row is **$2,559,313.589179587**. Switch adapter selection, not report preferred expectation or coefficients.
4. **`app/page.tsx:29–51`:** after FUF central correction, the four lowest entries are ReCARES, HOPE, Project Homeless Connect, **Hearing and Speech Center ($1,250,000)**. No `hearing-and-speech-center` entry exists in `picksBySlug`; line49 throws “Missing homepage summary.” Add an evidence-matched card/fallback before shipping the corrected rank. Do not keep a weighted FUF price merely to preserve the existing fourth card.
5. **`lib/research-cost-ranking.mjs:84`:** Clinic by the Bay explicitly overrides central with `clinicExpected(...).donor_*` (currently $2,002,577.50 Bay), labeled subjective signed expectation in metadata. Not currently top ten, but it makes an all-central directory claim false and can influence future ordering. Either central-only ranking must select `clinicModel(clinicInputs(clinic, centralScenario))` while preserving expected output in report, or the directory must explicitly label a mixed statistic. Do not rename a weighted expectation “central.”

## Evaluated current first ten

| Current order | Slug | Current Bay/local price | Statistic assessment |
|---|---|---:|---|
|1|recares|74,720.34|Correct central row selected by name|
|2|hope-pacifica|554,659.55|Correct centralScenario selected|
|3|project-homeless-connect|774,408.34|Correct central scenario / Bay output|
|4|friends-of-the-urban-forest|1,053,266.60|Wrong statistic: historical weighted; V2 central pending|
|5|hearing-and-speech-center|1,250,000|Central scenario selected by scenarioRow; not a weighted mean|
|6|face-to-face|1,328,756.94|Wrong statistic: weighted; central3,598,461.26|
|7|compass-family-services|1,347,730.81|Registry central transfer model; 50% transfer judgment, not scenario-weighted mean|
|8|hamilton-families|1,388,888.89|Registry central transfer model; 50% transfer judgment, not scenario-weighted mean|
|9|dentists-on-wheels|1,584,847.70|Wrong statistic: weighted; central2,559,313.59|
|10|code-tenderloin|1,808,409.48|Correct central scenario selected|

Hearing/Speech, Compass and Hamilton retain their existing program/resource-scope limitations; this audit does not silently validate those as complete ordinary-gift models. Their numeric statistic is central rather than weighted.

After the three top-ten adapter corrections, expected first ten using otherwise unchanged current rows: ReCARES, HOPE, Project Homeless Connect, Hearing/Speech, Compass, Hamilton, FUF, Code Tenderloin, SF AIDS Foundation, San Francisco Free Clinic. FUF source-only V2 central is assumed in that ordering.

## Other observations, not coefficient fixes

- NEMS is correctly explicit central-null and Bay-null in the latest ranking; conditional HBV is no longer promoted. Keep null propagation.
- Pacific Hearing Connection already selects central ($2.199M), not its weighted $937,721. It is therefore not among these ten.
- Several lower `bay-research-index.ts` bindings visibly remain weighted (MELP, BAMRU, La Casa, Youth ALIVE!, Sonrisas, SisterWeb, HEPPAC, Ceres, Marin Treatment). They do not appear in the evaluated first fifteen, but “every directory row is central” would require a full adapter sweep or statistic labels, not only repairing the homepage.
- Separate factual homepage copy still says HOPE has five sites (accepted V2 says nine) and ReCARES has “cash costs” (accepted V2 accrual accounting expense). These are small copy fixes, not reasons to change ranking arithmetic.

Acceptance: exact central adapter equality; selected homepage slugs all have renderable copy; weighted report results remain intact and named; unknown ordinary-gift values stay null, never zero or diagnostic fallback. No recommendation follows simply from central rank.
