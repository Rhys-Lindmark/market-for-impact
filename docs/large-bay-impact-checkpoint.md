# Large Bay program effectiveness — issue 190

Current work block began 2026-09-08T04:36:05Z; do not reset that timestamp on continuation. This is unfinished implementation, not a published release.

## Implemented and checked

Latest checkpoint: all four new reports/APIs and the five-program effect-first Bay comparison are implemented. YMCA is in the SF list (38); three Bay-only programs are separate. All 273 tests, lint and final production build passed. Report/API phone/tablet checks: YMCA 2, Bay reports 6, comparison 2, combined YMCA/ranking 4. No deployment yet. Remaining release requirements: native workbook synchronization, final source/copy review, GitHub gates, exact-commit Sites deployment and canonical verification.

- SF–Marin Community Markets bridge v0.3 uses the observational food-insecure versus food-secure state contrast (.023), not the mixed-population contrast (.008). Explicit 50% funding additionality; central $59,627,329 per 10 QALYs. The report summary now prioritizes this denominator. Four focused tests and the 268-test full suite passed; lint and build passed before addition of the four new standalone calculators.
- `lib/large-bay-impact-model.mjs`: food access, benefit enrollment, food pharmacy and YMCA DPP calculators. Conditional donor health; signed harm and zero funding additionality never become positive-price bargains. Four additional focused tests passed. DPP integrates its annual retention curve once, and uses randomized-offer rather than completer effects.
- Alameda central effective health duration is .25 years (linear six-month onset), distinct from benefit-receipt duration. This doubles the earlier .5-year draft price to $248.45M/10Q.
- BACKLOG.md records the user’s expansion toward 100 and worker-refill rule; GitHub issue 191 preserves this priority remotely.

## Next acceptance work

YMCA integration checkpoint: dedicated `/charities/ymca-greater-sf` report, `/api/sf-ymca-model`, versioned JSON and central ranking entry implemented. Local research count is now 38; top four unchanged. Independent policy/child researcher accepted model/report; normalized the zero-funding signed-zero edge case. Five focused Bay model tests and ranking test passed; YMCA report and 38-row ranking passed all four phone/tablet checks. Lint/build passed before the final ranking integration; rerun final acceptance before publishing. Retained development server: port 3148, session 48965; do not start a duplicate if still live.

1. Finish remaining SF–Marin source-category wording and central-first report structure; synchronize the native workbook before release.
2. Integrate source-grounded input tables and dedicated reports for Second Harvest, Alameda, Contra Costa/Solano and YMCA, using the independent briefs in `/private/tmp/mfi-large-bay-impact/`. Their calculators are not yet connected to pages or APIs.
3. Replace the size-first Bay comparison with program-effectiveness comparisons. Keep Bay-only services outside SF-city recommendations; YMCA model is a conditional SF-resident tranche, not all YMCA gifts.
4. Preserve exact sources, costs and uncertainty. Do not label observational utility associations as causal service measurements. No current marginal funding offers verified for these five organizations.
5. Regenerate registry after final source changes; run full tests, lint/build, mobile/browser checks, native model checks and canonical route/API verification after exact-commit deployment. No deployment has occurred for this branch.

## Parallel research acceptance queue

Audits in `/private/tmp/mfi-unconventional-audits/`: lead/filtration, falls, medication, vision, hearing, dentures. Read each full artifact before integration. Outstanding material corrections include failed-course cost allocation, incremental duration versus wear, recurring maintenance, duplicate program reach and changing public-payer coverage. PAWS, Gubbio and hygiene are assigned next. The next-100 city/venture brainstorm is `/private/tmp/mfi-sf-next100-city-and-incubation.md`; it is discovery, not 20 completed nonprofit reviews.
