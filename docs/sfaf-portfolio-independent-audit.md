# SFAF whole-portfolio independent acceptance

2026-09-08. ACCEPT as a conditional unrestricted-gift research revision. No remaining material correction. Not a validated next-tranche offer or net societal cost estimate. Replaces the existing organization's ordinary-gift estimate; does not increase organization/research count.

## Verified model boundary

The entire $100,000 gift remains in every donor denominator. Central quantified branches are 15% overdose protection and 20% PrEP access; the other 65% remains priced but has unquantified health. The explicit eight-component allocation totals 100%. Direct branch unit costs exclude separately retained central overhead, avoiding a second charge. Functional categories describe portfolio breadth rather than serving as claimed marginal gift allocation or causal output prices.

The old $56,327.57037345307/10Q selected-naloxone-program estimate is labeled historical conditional comparison only. It does not silently become an unrestricted-gift result, get retuned to preserve rank, or become a second research entry.

## Finite cohorts and overlap

Overdose protection compares whole-person survival curves. Nonfatal events return to the alive state; death is absorbing; the intervention changes the fatal hazard only during funded protection. Afterward both arms face baseline hazard, so later mortality erodes the survival advantage. The finite horizon prevents each reported reversal receiving a new independent lifetime. Other mortality excludes overdose mortality already modeled. Signed rescue increments can produce losses. The cohort is defined at service start; delay discounts its future health back to gift date, rather than claiming to model pre-enrollment mortality.

PrEP compares finite HIV-free-state trajectories under common mortality, with infection still possible after support. Its utility difference is versus treated HIV, not untreated AIDS or an assumed HIV-mortality advantage. The 86% trial effect and additional-coverage prior play different roles, and baseline local incidence is not copied from PROUD. No secondary transmission, medical savings or extra lifetime tail is added.

The PrEP disjoint fraction explicitly excludes people/person-time already credited under overdose survival. Costs and intervention harms remain for all offered care, including overlap-excluded recipients. HCV, MOUD and other portfolio health are not stacked onto the same survival stream. Actual deduplicated records and marginal uptake remain empirical gaps rather than verified evidence.

## Funding, resources and geography

Existing public contracts, assistance, 340B operations, other providers/donors and baseline clinical access remain counterfactuals. Separate branch financing additionality discounts donor replacement. The proposed May 2026 public bundle and partial June restoration are not represented as a verified current funding gap; room remains unknown. This agrees with the prior funding-room desk review.

Outside medicine/lab/other inputs are added once to all nominal offers in a gross associated-resource envelope. They are not insurance transfers or 340B revenue. The donor-pays scenario moves them inside branch cash cost and lowers affordable activity, without adding them outside again. This is not a measured net induced societal denominator: replacement and released alternative resources are not fully netted out. Preserve the visible gross-resource label.

US/Bay/SF are separately computed with independent branch future-residence shares, then harms subtracted; SF nests inside Bay. Do not add nested outcomes. Shared and independent harms are already gift-date PV, with no second discount. Independent harm remains when funded activity is zero. Nonpositive Q suppresses positive ratios while retaining signed health and the full gift.

## Source verification

The [FY2025 primary audit](https://res.cloudinary.com/dxca8bsxf/image/upload/v1764782541/San-Francisco-AIDS-Foundation-Jun25AR-Final_hi9fek.pdf) is explicitly in thousands. Its activities schedule independently confirms $44.262M functional expenses, $19.524M government grants and $10.251M 340B revenue. Event expenses and termination benefits are separately presented, not a second add-on to the model's unit costs. These historical amounts do not verify the allocation priors.

The [PROUD primary indexed abstract](https://pubmed.ncbi.nlm.nih.gov/26364263/) independently confirms 1.2 versus 9.0 acquisitions per 100 person-years and an 86% relative reduction. Direct ScienceDirect retrieval was 403; the primary PubMed record supplied verification. The [repeat-overdose primary indexed article](https://pmc.ncbi.nlm.nih.gov/articles/PMC10398609/) confirms 295 repeated overdoses per 1,000 person-years and 1,154 fatal overdoses per 100,000 person-years. The [all-cause mortality article](https://pmc.ncbi.nlm.nih.gov/articles/PMC6143082/) confirms 778.3 deaths per 10,000 person-years. These historical cohorts are context, not current SF fentanyl-era rates; local hazards, rescue/access increments, utility gaps and duration remain clearly labeled priors.

## Reproduction and result

Reran node --test /private/tmp/mfi-sfaf-portfolio-calculator.test.mjs: 23 tests pass, including all 16 exact scenario outputs, numerical integration of both finite trajectories, missing/type/boundary checks, deduplication, payer shift and signed/null behavior.

Additional independent audit: 180,470 assertions pass across complete required CharityReportContent schema, regional health/resource/ratio reconstruction, every displayed regional scenario price, and 10,000 randomized accepted input sets. Randomized outputs remain finite, supported overdose hazards nonnegative within numerical tolerance, and absolute per-person utility gains bounded by the finite horizon. This verifies implementation, not parameter truth or scalability.

Central SF health 0.4954111838561661 QALYs: donor $2,018,525.2828089814/10Q and gross resources $2,791,332.1053701346/10Q. Central Bay donor $1,926,859.6786479007 and US $1,905,229.528987705/10Q. Joint favorable SF donor $20,262.902301517126 and gross resources $40,873.168642488825/10Q; this is not a confidence bound or probability-weighted expected return.

Audited files: /private/tmp/mfi-sfaf-portfolio-model.json, /private/tmp/mfi-sfaf-portfolio-report-content.json, /private/tmp/mfi-sfaf-portfolio-review.md, /private/tmp/mfi-sfaf-portfolio-calculator.mjs, /private/tmp/mfi-sfaf-portfolio-calculator.test.mjs. No Site/repository changes or count increase.
