# Micah's Hugs independent audit

**Final ACCEPT for exploratory publication / HOLD giving.** Author corrected summary schema after initial review; independent rerun now34/34passes, including new summary field regression and exact default parity. No numerical coefficient change requested. Artifact reviewed2026-09-11; start15:22:49UTC, numerical/source verification15:23:54UTC (1m05s), followed by memo writing and final correction recheck. Space Saver: existing files/runtime only, primary HTML in memory, no Site edits/install/outreach/nested agents.

## Mandatory correction

`/private/tmp/mfi-110-micah-report.json` currently has **summary:string[]**. Actual `components/CharityResearchReport.tsx` requires **Array<{label:string,value:string,detail:string}>** and reads `item.label.toLowerCase()`. This is a runtime rendering failure, not cosmetic. Convert four summaries without changing claims/numbers and add tests for all three string fields. Author notified directly. Existing33checks pass but do not test this shape.

## Arithmetic / scope accepted

- Ran author tests:33/33 pass, exact complete saved-default/sensitivity parity. Independently reconstructed all six cohort counts and survival formulas; trajectory differences below4e−16. Central131.25 people and favorable1340.625 are arithmetic outputs, explicitly not observed people.
- Whole2025expense61,176 plus netted event4,900 =66,076 independently confirmed in original IRS990-EZ HTML. Annual15,000+distribution confirmed. No recovery/scholarship subtraction or815supplies-only denominator. Public stock/volunteers unpriced; complete-resource output correctlynull.
- Signed average BayQ .24341586015886482 per10k gives410,819.5741014379/10. Central4,751,636.03088788, favorable41,525-ish, favorable10%mass contributes98.9325%, without favorable34.636M. All prominently disclosed. Headline is weighted expectation, not central/current observed return. Current-capacity offer explicitly unverified.
- Model has distinct dose/refill carrier count, station/general relevance and cross-network dedup. No dose becomes rescue or life, no repeat survival restart. Net hazardgain already includes use/alternatives; cashresponse separately addresses incremental funded coverage. No extra public-revenue discount. Negative fatalhazard and separate morbidity harms are conceptually distinct, not duplicate mortality.
- Historical survivor mortality is correctly only rough scale;15year favorable horizon/.04hazard/.75utility are unsupported favorable extrapolations, not trial estimates. Matching central/F2F survival diagnostics expose fragility.

## Do favorable priors justify the displayed estimate?

They justify **an explicitly subjective exploratory calculation**, not a reliable competitive-price claim or giving recommendation. The favorable world combines~10.2×central network,3×hazard reduction,2×cashresponse and more favorable survival/utility. Its10%weight is a judgment with no empirical frequency basis. Almost99%of signed expected health coming from it means the apparent low price is effectively a bet on that bundle. The report says so plainly and preserves a strongly unfavorable central. Do not tune probability downward or upward merely to alter ranking, but root must retain tail/partial-health caveats wherever the weighted price is shown. It must not be relabeled “central estimate” by index/homepage integration.

## Primary-source spot checks

Fresh original return: https://projects.propublica.org/nonprofits/full_text/202621969349200007/IRS990EZ and ScheduleO. Native fetch decoded gzip in memory; finance/annualdose and815supplies confirmed. Fresh official https://micahshugs.org/education/ confirms1,167participants and October17,2025 event. Fresh https://micahshugs.org/narcan-boxes/help-narcan-box/ describes host/adopt roles and no-cost supplies; sponsorship does not establish a priced additional outcome. Fresh https://micahshugs.org/donate/ shows exactEIN87-1150505 and giving link, so linking this official generalgiving page is appropriate with renderer's general-gift limitation. No processor transaction verified or sent.

Clinical source claims matched same-day independently checked primary BMJ346:f174, NEJMoa2401177 and PubMed29913516/29926090; no re-retrieval needed. Positive observational and randomized-null contrasts retained. Primary education/date facts do not demonstrate all annualdistribution school-based; mixture remains a prior.

## Nonblocking integration improvements

Normalize joined words in rendered copy (per10BayQALYs, favorable10%world, annualSonoma, etc.) without changing meaning. Sensitivity details currently say only “named parameter family”; show exact alternate hazard/horizon/coverage settings in rendered text or link the public complete matrix so the reader can reproduce comparisons. These are transparency/readability improvements, not reasons to change coefficients.

Summary correction and regression now pass: final ACCEPT. Ready for next assigned GiveWell staff-giving source screen; no additional selected organization self-assigned.
