# ReCARES production integration checklist

Actual start 2026-09-11 01:00:44 UTC; inspection completed 01:01:34 UTC. Root-confirmed dispatch gpt-6-astra / low (Astra Lite). Read-only checkout and handoff inspection; no Site edits, downloads or outreach.

## Verdict

**Schema-complete draft, but do not publish unchanged.** Unlike the earlier BFC omission, ReCARES already has a valid nonempty `evidence` array. Required production work is model accessibility, new controlled-evidence content, publication metadata and verification—not recalculation of health assumptions.

Actual renderer is `work/market-for-impact-berkeley-free-clinic/components/CharityResearchReport.tsx`, type `CharityReportContent` at line 26, not a file called CharityReportContents. BFC reference is `data/bay/berkeley-free-clinic-report.json` and its page wrapper.

## Required shape: PASS on draft

- Required scalars: organization, eyebrow, program, published, modelVersion. Optional donationUrl is provided.
- `nutshell`: headline, body, whyItMayWork, whyWeAreCautious, recommendationBlocker all present.
- `summary`: 5 valid label/value/detail rows.
- `programSection`: body, steps[{title,detail}], boundary present.
- `model`: headline, body, equation{label,expression,result}, 12 inputs with key/label/confidence/best/range/basis, giftHeading, 6 sensitivity rows, fundingBoundary present; optional uncertaintyBoundary present.
- `evidence`: 3 rows, each with key/design/population/result/transfer. Renderer line 132 calls `.map` unconditionally, so maintain a runtime assertion for this field; a type cast is not protection against missing JSON.
- `reservations` 7, `excludedBenefits` 5, `sources` 10; all required arrays present. No duplicate source URLs detected. Renderer line 171 uses URL as React key, so newly added sources must remain unique.
- Optional comparisonBridge/comparisonAudit absent legally. `eyebrow` and `inputColumnLabel` are accepted by the type but not rendered in this component. Do not rely on eyebrow alone to communicate “exploratory.” Current summary does communicate it.

## Must do before integration acceptance

1. **Add a real model link.** JSON currently has only modelVersion text, no inspectable model URL. Follow BFC `app/charities/berkeley-free-clinic/page.tsx:4`: wrap `nutshell.body` in JSX and append a native anchor to the eventual ReCARES model API. Create/test the route before linking it. API should expose original inputs, all five scenario matrices, signed weighted outputs and diagnostics—not merely central result. No hardcoded `/private/tmp` path can remain in production. Do not put Markdown or HTML tags into JSON body expecting them to render as links; plain strings are rendered literally.
2. **Incorporate the new utility-evidence check in the actual report JSON, not only notes.** The currently inspected JSON has generic WHO/reviews evidence only. Add concise primary walking-aid/rollator evidence and the bathing-adaptation boundary from `/private/tmp/mfi-recares-utility-evidence-check.md`, with matching unique sources. State functional benefit can coexist with null between-group quality-of-life evidence; the 0–100 health rating is not QALY utility. Do not convert it or import an installed-shower coefficient into portable aids. These newly known reservations are material to a tail-driven low estimate.
3. **Replace publication placeholder only on real publication.** Current value is `Draft for independent audit — not published`; renderer line 106 prefixes “Published:”. Use actual publication date and preserve exploratory status in visible summary/metadata. No stale draft-as-published text.
4. **Bay-primary numerical binding.** Bind ranking to `calculate().weighted.bayDonorCostPer10Qaly` = **185910.27585974694**, not central 128892, total 180971, SF 486998 or favorable 13417. Whole gift remains $10,000, all expense $111,205; no $100k linear offer. Render cents/decimals only where useful.
5. **Preserve important cautions in rendered content.** 69.3% favorable-tail contribution; no-tail $574,975; unvalidated utilities; null/harm mass; unknown complete resources and current funding room; resident shares unmeasured. No reliance on an unrendered field or external artifact to carry these.
6. **Provenance.** Model/report says weights were specified before outputs; qualify as author-reported unless a timestamped pre-evaluation record is available. Record only actual phase durations under exact organization key “The ReCARES Network,” because renderer looks up research effort by `content.organization`. Do not backfill unknown earlier work.

## Donation and numerical consistency

Official `https://www.recares.org/financial-donations/` was independently verified during prior audit and is the correct whole-organization giving route. Check option is real; zero check-processing fee is an explicit modeling assumption, not a verified electronic fee schedule. Renderer has a general Donate button even for exploratory reports; keep “not yet recommended/unverified offer” prominent so link presence is not mistaken for endorsement.

Recomputed current model weighted outputs and compared saved result object: exact parity. Current JSON/Markdown headline numbers agree. No stray v1 price or unrelated charity number found. `$100,000 / Q` in the central equation is **10 × $10,000 gift** for the 10-QALY price, not a $100k gift; optionally spell out `10 × $10,000 / Q` to avoid confusion. `$11` rounded input is not wrong but `$11.38` would communicate the actual $111205/9770 ratio better. No coefficient changes required.

Core model is portable ESM and has no filesystem dependence. Build/test scripts contain `/private/tmp` and test-output writes: adapt these intentionally rather than shipping them blindly. Model `publicationStatus` remains draft and should be reconciled with publication metadata if returned by API. Its max gift check uses caller-supplied `maxModeledGiftUsd`; if accepting arbitrary API inputs, keep the $10k cap immutable and reject nonfinite costs. Fixed current outputs are valid.

## Smoke tests before calling it published

- Parse JSON; validate all mandatory nested fields/arrays and unique keys/URLs without casts. Assert evidence is nonempty and contains new controlled-evidence limits.
- Import model and compare every published headline against unchanged calculated outputs; assert zero gift/null/harm, full-cost denominator, nested geography and >$10k rejection.
- GET page and model API in preview/production: HTTP 200, no undefined/.map exceptions, complete source list and scenario matrices available.
- Check actual rendered Summary, Monitoring, Funding and Sources sections—not merely grep JSON. Verify inspect-model link stays inside the canonical base path and donation opens official external page.
- Check unified index has one ReCARES row, correct Bay number/label, ascending order and expected single count increment only upon publication.
- Check metadata/title and research-effort attribution. No claim that a successful build verifies donation capacity.

## Photo recommendation

No photo field exists in this shared renderer, so an image is not required and should not prompt a shared-component redesign for this integration. Official giving page links an image captioned as volunteers helping locals find equipment at:

`https://www.recares.org/wp-content/uploads/2022/10/cropped-kevin-1024x616.jpg`

The URL was obtained directly from the official page; image fetch via web returned cache miss. I did not download or visually verify it. It is a **candidate source, not verified reusable/licensed imagery**. Public availability does not establish reuse permission. Prefer no image until licensing and visual suitability are checked. Avoid Ukraine-aid packing photos as a generic Bay-beneficiary illustration, since that would obscure the geographic caveat.
