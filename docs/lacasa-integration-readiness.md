# La Casa de las Madres: integration readiness

Verdict: accepted exploratory model remains acceptable; **raw handoff JSON is NOT directly render-ready**. Giving remains HOLD. No model retuning requested. This audit did not modify the model, reports, Site, dependencies, or previews.

Actual UTC start 2026-09-11 03:13:52; final evidence clock 03:58:32. These are observed wall-clock endpoints (44m40s), not a claim of uninterrupted active research. Dispatch identity gpt-6-astra / low per parent metadata. Space Saver: reused existing pure Node and files, no installs/download artifacts or cleanup needed.

## Required integration corrections

1. `/private/tmp/mfi-lacasa-report-content-v1.json` is a bespoke research packet, **not** `CharityReportContent`. `components/CharityResearchReport.tsx` requires `nutshell`, summary array, `programSection`, model object with inputs/sensitivity/equation/fundingBoundary, evidence array, reservations/excludedBenefits arrays, published/modelVersion/program. Current `summary` is a string; `evidence` is an object. Direct use will fail at `content.nutshell.headline` and `.map` calls. Adapt content to the shared type, preserving all substantive reservations; use BFC JSON as shape only, not content.
2. Sources currently have title/url/accessed only. Map to publisher/title/url/published/retrieved/sourceType, preserving actual retrieved dates. Eight existing URLs are distinct. Include the new public-funding sources below. No fictitious publication date for undated pages.
3. Add `donationUrl: https://www.lacasa.org/donate` (official page opened successfully). Existing source-list inclusion does not populate the renderer's donation button. General gift is not a restricted advocacy offer. Add the actual generated model download/API link in the page wrapper, after its route exists; do not fabricate a live endpoint now.
4. Unified Bay headline/index must use **$22,695,319.534887027 per 10 Bay QALYs**, not global $22,460,767 or SF $23,926,703. The bespoke packet's summary currently leads with global $22.46M. Label global/gross diagnostics separately; gross $26.73M is all-beneficiary and an assumed resource multiplier, not verified complete resource accounting.
5. Integrate existing effort sessions, not an invented replacement duration. Five closed sessions total **1,248.481 seconds = 20m48.481s**: research241.505s; modeling245.443s; first audit393.027s; correction278.828s; re-audit89.678s. They contain original IDs, timestamps and GPT-5.6 Sol provenance—do not relabel these Astra. Open/closed versions of audit sessions must not be double-counted. Current Astra review is an additional separately recorded session; do not equate its elapsed wall clock with active effort. Renderer reads shared research-effort data, not these /tmp files automatically.

## New public-funding evidence to add without changing coefficients

[HSH's October 31, 2025 quarterly executed-agreement report](https://media.api.sf.gov/documents/Ch_21B_FY_2025-26_Q1_Report_1HVXzm9.pdf), PDF pp8–9, identifies Verona Hotel Support Services, contract1000028790, La Casa, July1,2023–June30,2027, total NTE **$1,332,681**, supporting formerly homeless adults in65 permanent-supportive-housing units. This is documented continuation funding, not an annual gift-funded expansion price. Do not divide NTE by65 to price incremental advocacy or treat all65 as new recipients.

[Draft FY2026–27 ESG recommendations](https://media.api.sf.gov/documents/Draft_2026-2027_Action_Plan_Funding_Recommendations_Excerpt_KULWnVn.pdf), PDF p5, lists **$165,000** for La Casa emergency shelter/case management. This source is explicitly proposed/recommended, not proof of a final executed award. The adjacent $167,000 belongs to Larkin Street, not La Casa. Final award status remains unverified. These records strengthen the current public-funding-overlap caveat and do not establish that all needs are funded.

Suggested funding paragraph: “La Casa receives public funding as well as private gifts. A city executed-agreement report lists a $1.33M total Verona Hotel support-services agreement through June2027; a draft FY2026–27 plan separately recommends $165k for shelter/case management. These are baseline funding records, not quoted additional capacity. No verified marginal gift offer was found.”

## Model/source fidelity checks

- Existing exact snapshot/zero-gift/all-additionality-zero/scaling/geography/gross/validation test passes under Node. Accepted v2 numbers synchronize. No arithmetic defect found.
- [Official2025 annual report](https://www.lacasa.org/s/2025-Annual-Report.pdf) independently confirms broad1,384 Bay survivors and885 community-office subset; co-locations815 are not additive. It documents mixed residential/community/teen services, so adult/full-dose discounts are necessary judgments, not observed recipient characteristics. Statewide hotline receives no direct modeled benefit. Bay90–99% and nested SF70–95% are proxies, not a measured residence survey.
- Full IRS expense charged; known FY2025 in-kind reconciliation remains unknown. Do not claim $95,586 included or mechanically add it to IRS expenses. Gross multipliers are explicit assumptions. Whole-org scope means all costs retained while non-advocacy health effects remain unquantified—not evidence those effects are zero.
- Finite bridge remains transparently speculative: NNT8 × .22 utility gap ×2years=.055, rounded to.05. A24-month abuse endpoint does **not** establish continuous two-year remission; cross-study utility states are not observed La Casa QALYs. Preserve this duration/timing reservation. No mortality credit. Favorable.15 is a wide5%-weight prior and contributes86.9% of global weighted benefit. Do not present tail as clinical measurement.
- The report's weak-urgency wording should remain conditional: large assets/surplus do not establish unrestricted liquid funds available today or that no additional spending is worthwhile. No measured marginal capacity was found.

## Acceptance gate

Before integration acceptance: schema conversion; Bay-primary labeling; public funding paragraph/sources; effort ingestion with deduplication; model link; required evidence array and explicit finite-duration caveat. Then run focused JSON/type/route checks using existing tooling. No new research coefficient guesses or full rebuild needed merely to adapt the packet.
