# Next homepage after four accepted whole-gift corrections

Read-only integration memo, September 9, 2026 UTC. Authority: `/Users/rhyslindmark/Documents/Codex/2026-08-29/okay-you-re-gonna-make-this/work/market-for-impact-next`, HEAD `fc822c9cc55ff0fdeb007756a6fd7b1ccdbe18e9` (parent-confirmed current published ranking; NEXT data integration underway). Paths below are exact relative paths under that absolute checkout. No website edits, changed estimates, network publication, count increase or write-producing Site tests.

## Mechanical result: replace only GLIDE, Breathe, OA and PVF

Imported the executable current 50-row SF ranking and the four accepted temporary calculators with Node24. Replaced only their SF donor central/range outputs and numerically sorted. Existing PHC/SFAF whole-gift replacements were already present. NEXT/HRT do not add a new SF-index row in this calculation.

| New SF rank | Organization | Central donor USD / 10 SF QALYs | Positive scenario range, USD | Current cost boundary |
|---|---|---:|---:|---|
| 1 | Project Homeless Connect | 798,863.340389 | 39,493.417230–616,196,559.025525 | Whole ordinary project gift, partial health |
| 2 | Clinic by the Bay | 933,333.333333 | 14,869.888476–80,000,000 | Selected completed dental extraction, not whole gift |
| 3 | North East Medical Services | 1,201,090.588888 | 41,393.940302–325,962,998.348239 | Selected recurring HBV registry support, not whole gift |
| 4 | Hearing and Speech Center of Northern California | 1,250,000 | 74,074.074074–160,000,000 | Selected supported hearing course; recipient unresolved |

Next outside the mechanical four: Compass Family Services $1,347,730.810521; Hamilton Families $1,388,888.888889. These are not automatically approved replacements for a withheld card.

All four new central prices exceed $100,000. A favorable scenario is not a confidence bound. Three leaders remain program-scope estimates, not evidence that four unrestricted organizations are now verified bargains.

### Exact existing source chain for the new leaders

- **PHC:** `data/san-francisco/phc-portfolio-model-v1.json`; `lib/phc-portfolio-model.mjs`; `data/san-francisco/phc-portfolio-report.json`; ranking adapter `lib/research-cost-ranking.mjs:89`; editorial index `lib/sf-research-index.ts:29`. Adapter uses `calculate(inputsFor(model,s)).donor_sf_per_10q`.
- **Clinic:** `data/san-francisco/clinic-dental-cea-v1.json:6` identifies one completed clinically indicated extraction for an SF resident; `lib/dental-access-model.mjs:6` computes relief and harm; ranking adapter `lib/research-cost-ranking.mjs:81`; report `app/charities/clinic-by-the-bay/page.tsx`; index `lib/sf-research-index.ts:21`.
- **NEMS:** `data/san-francisco/nems-hbv-cea-v1.json:8` states the closed diagnosed-HBV registry cohort and recurring support boundary; `lib/hbv-retention-model.mjs:20` charges recurring capacity and lines27–33 map already-discounted source health; ranking adapter `lib/research-cost-ranking.mjs:84`; report `app/charities/north-east-medical-services/page.tsx`; index `lib/sf-research-index.ts:24`.
- **Hearing:** `data/san-francisco/hearing-access-cea-v2.json:7` documents unresolved current charitable eligibility; `lib/hearing-access-model.mjs:10` computes finite exposure; ranking adapter `lib/research-cost-ranking.mjs:76`; report `app/charities/hearing-and-speech-center/page.tsx:15` says no direct gift recommended; index `lib/sf-research-index.ts:10`.

## Publication gates, separate from sorting

1. **Recipient eligibility:** HSC's existing report records historical EIN94-1322198 automatic revocation and no verified subsequent reinstatement/successor. This memo does not re-research current legal status. The published research itself says not to recommend a direct gift. Automatic promotion under “Our Top Charities” plus the homepage instruction to donate conflicts with that warning. Resolve the editorial policy explicitly: either present the mechanical ranking as research, with a prominent recipient-status hold, or authorize a documented eligibility-aware shortlist separate from numeric ranking. Do not silently delete HSC or promote Compass while continuing to claim the homepage equals the four lowest prices.
2. **Shared outcome:** PHC's whole-gift estimate now includes hearing. HSC and PHC use the shared hearing access pathway; their hearing QALYs cannot be added as independent/diversified portfolio outcomes. HSC report `app/charities/hearing-and-speech-center/page.tsx:19` still describes PHC as a separately reviewed glasses pathway. That sentence is stale after PHC replacement and needs correction before jointly promoting both. Preserve both model estimates; update the boundary copy, not assumptions.
3. **Program versus whole gift:** Clinic and NEMS are still conditional program models. Do not recast their modeled $350 extraction or long-term HBV support as ordinary unrestricted-gift return just because they become low-priced rows.

## Ranking integration: raw numbers already work; new adapters are required

Current central/range helper `lib/research-cost-ranking.mjs:51–57` selects `/central/i`, evaluates scenarios, and filters finite positive prices for the descriptive range. Sorting at line90 uses raw numeric central values, not formatted strings. `lib/sf-research-index.ts:55–61` obtains that rank/price; `lib/unified-research-index.ts:11–15` preserves numeric SF values and sorts them. No price-string parser requires adjustment for the new four.

The four replacement adapters must evaluate **all79 accepted scenarios**, retaining signed/null outputs in reports/API while excluding them only from positive-price range aggregation:

| Replacement | Accepted file / output | Cases | New SF central | Positive SF range |
|---|---|---:|---:|---:|
| GLIDE | `/private/tmp/mfi-glide-portfolio-model.json`, calculator `calculate({...central_inputs,...s.overrides}).sf.donor_per_10q` | 18 | 3,031,781.916129 | 30,691.898901–940,211,628.670028 |
| Breathe | `/private/tmp/mfi-breathe-portfolio-model.json`, same merge, `.sf.donor_per_10q` | 20 | 171,667,161.935520 | 1,172,858.955338–73,248,476,022.18 |
| OA | `/private/tmp/mfi-oa-portfolio-model.json`, same merge, `.donor_sf_per_10q` | 23 | 195,115,266.408167 | 13,127,188.306811–3,362,840,940.686393 |
| PVF | `/private/tmp/mfi-pvf-portfolio-model.json`, `calculate({...central,...override}).prices.sf.donor`; scenarios are an object | 18 | 17,857,142.857143 | 496,031.746032–2,666,666,666.666667 |

Map scenario IDs to the helper's `name` consistently; select `central` explicitly rather than relying on JSON order. Keep gross/net resource outputs out of donor-cost ranking. OA/PVF current adapters are lines70–71 and Breathe line82. GLIDE currently enters through `...registry.rows.filter(...)` at line74: exclude legacy `glide` when adding its new adapter or it will become a duplicate row. Retain historical registry/model files, and retain existing `new-door-ventures` exclusion.

The helper has a general empty-positive-set edge: `Math.min(...[])`/`max` yield infinities. It does not trigger for these accepted packets; every one has positive scenarios. Null/harm central handling is likewise not newly triggered here. No research retuning or general parser rewrite is needed for this transition.

## Homepage copy and image work

`app/page.tsx:37–41` automatically slices the numeric ranking but throws if a summary is absent. **PHC, Clinic and HSC are absent from `picksBySlug`**; NEMS already exists. A ranking-only merge therefore fails before the image fallback can help.

Add source-grounded entries (with `model:null` so central/range come from the authoritative adapter):

- **PHC program:** “Help people access glasses, hearing and dental care.” Overview: “Project Homeless Connect coordinates health and other services. This estimate retains an ordinary project gift while quantifying disjoint glasses, hearing and denture pathways.” Evidence/caution: “External clinical evidence informs finite benefits; allocation, full-service costs and additionality are judgments, and55% of portfolio health is unquantified. Hearing overlaps the separately reviewed HSC pathway.” Do not restore the old $100 glasses-only or $71K headline.
- **Clinic program:** “Help patients receive dental pain relief sooner.” Overview: “The selected pathway is a clinically indicated simple extraction for an SF resident.” Opinion/evidence: “A conditional program estimate, not a whole-clinic gift forecast; health utility, ordinary-care delay and financing additionality are judgments.” Reservation: “The $350 completed-episode budget is constructed; no marginal tranche is verified.”
- **NEMS:** Existing `app/page.tsx:32` entry already preserves recurring20-year costs, external lifetime-model adaptation, existing ReLink funding and unverified marginal effect. It is suitable with a clear program-scope label; no new clinical claims needed.
- **HSC:** Only as a research/held card under an explicitly chosen editorial policy: “Supported hearing access—recipient clarification required.” Explain the conditional supported-course estimate and shared PHC pathway. Prominently retain “No direct gift recommended until recipient status is resolved.” Do not claim closure, misconduct or ongoing revocation beyond the existing evidence cutoff.

Images: `public/images` contains only sfaf.jpg, phc.jpg, glide.jpg, breathe.png and givebetter-principles.png. PHC can use its existing historical image with caption explicitly limited to glasses services, not all modeled components. No existing Clinic/NEMS/HSC factual assets were found. Do not repurpose another organization's image.

Current fallback `app/page.tsx:59` is safe for missing photos once the summary exists. Its program-specific wording fits Clinic/NEMS; HSC needs an explicit recipient-status hold and shared-pathway caveat rather than generic program text. If those three use text fallbacks, the expected fallback count becomes **3**, versus2 today. PHC can keep its existing photo. A future whole-gift card lacking a photo must not inherit the hardcoded “not unrestricted organization-wide” statement. Prefer scope/status-driven fallback copy. No image download, permission or license is claimed by this memo.

Dormant GLIDE/Breathe/OA/PVF summary entries should be updated or removed: they currently describe the superseded program-only model. GLIDE also has a `pick.model` pointing to historical bridge range; if it later re-enters, `pick.model?.positiveEffectRangeUsd ?? rank...` at line41 would override the new authoritative range. Set replacement models to null or explicitly use the ranking range.

## Formatter and test consequences

Homepage `app/page.tsx:17` uses `Intl.NumberFormat` compact notation; research table `app/research/page.tsx:6` and index `lib/sf-research-index.ts:2` also format raw numbers. They support thousand/million/billion values without parsing. `e2e/sf-research-ranking.spec.ts:8` reads numeric data attributes, not rounded text, and can already verify the new numeric order. Large Breathe scenario prices remain finite; no K/M/B parsing change is needed.

Required expectation/copy updates:

- `scripts/research-cost-ranking.test.mjs:26`: top-four slug array; add all four adapters' central/range parity and exact unique50 invariant, especially GLIDE registry exclusion.
- `e2e/remedy-alliance.spec.ts:22`, `e2e/rotacare.spec.ts:18`: old four-slug arrays.
- `e2e/whole-gift-revisions.spec.ts:19–21`: old two OA/PVF fallbacks become three new fallbacks if selected; assert correct scope/status wording rather than only the word unrestricted.
- `e2e/givebetter-design.spec.ts:26`: first research report becomes PHC, not GLIDE. First-card image check remains feasible with PHC's existing photo; test all other cards' deliberate fallback rather than assuming all have images.
- `e2e/sf-research-ranking.spec.ts`: generic order test works only if homepage remains mechanical top4. An eligibility-aware editorial shortlist requires intentionally changing its contract; do not accidentally break it by silently skipping HSC.
- Add new report/API tests for all79 signed/null cases and preserve historical program endpoints and tests. This memo did not run browser/build tests or mutate test output.

This is publication preparation, not authorization to resolve the HSC policy decision, change recipient routing, rewrite research assumptions or alter counts.
