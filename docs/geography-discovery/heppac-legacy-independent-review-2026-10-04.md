# HEPPAC legacy recalibration: independent scientific challenge

Verdict: ACCEPT conditional after root's material adverse-health repair. The original immutable author packet requires that repair; the inspected repaired `lib/heppac-legacy-current.mjs` satisfies it. Preserve donor HOLD, unknown measured whole-gift expected value, unknown marginal capacity and incomplete public/donated-resource cost. Acceptance does not establish the priors or a priced funding offer. No favorable price or change to the historical baseline is required.

Reviewer `heppac-legacy-independent-review-20261004`, assigned/user-confirmed GPT-6.1 Sol; raw runtime identity unknown. Research-session.mjs recorded actual source-audit interval 2026-10-04T06:03:36.220Z to 06:09:12.889Z, 336.669 seconds (5.61115 minutes). The bounded audit reached its material finish line early; it was not padded to fifteen minutes. This includes retrieval, selected original-source reading, model inspection and independent reconstruction; it ended before serialization, QA or handoff. Registry alias should map to the exact published HEPPAC heading while preserving UUID/timestamps. Raw open and closed helper output are separately retained.

## Material repair found and independently checked

The preserved historical `heppac-model.mjs` multiplies signed sum(naloxone, MOUD, checking) by mortalityOverlapAdjustment. With rescueIncrement:-1 this conceals naloxone harms: central total -0.18468919313095622 rather than -2.1282242656588592; favorable -23.150846799359964 rather than -59.50376570184733. Downside remains positive but was inflated .15019480653118356 versus .1009675207882676. A prior overlap discount must not attenuate negative channel effects.

Root correctly repaired only the current overlay, leaving complete frozen historical engine/results intact. Exact accepted current expression, for each historical row h and multiplier M, overlap scale O and delay D:

```
qs = ['naloxone','moud','drugChecking'].map(k => h.pathwayQalyRaw[k] * M)
positive = sum(max(q,0)) * h.inputs.mortalityOverlapAdjustment * O
negative = sum(min(q,0))
annualHealth = (positive + negative
                + h.pathwayQalyRaw.syringe * M
                - h.independentHarmQaly) / 1.03**D
```

Independent custom evaluation of repaired rows agrees with direct manual expression. With adverse rescue and O0, annual Q is -.15238642871457997 / -4.853450241759676 / -76.48229725621842 (downside/central/favorable). Negative naloxone remains full; unaltered syringe benefit remains distinct. With M0 and harmPerPerson .01, annual Q is -.01 / -.09375 / -.58225. Independent harms survive removal of response. With M-1 and income disabled, originally positive clinical pathways all become full negative, annual Q -.6565788655931394 / -11.996630207617986 / -133.5798498468369. The resulting weighted Bay subtotal is -.18466069444893193 and price null. M is an explicit signed effect-amplitude sensitivity, not a probability or empirical donor success estimate; it changes modeled pathway effects and does not reverse or erase independent harm. Common delay applies to that scenario's health components, an explicit timing assumption.

Root should describe this current signed-channel correction in its integration record/report. The original author packet's claim that V2 health is entirely preserved applies to the untouched historical diagnostic; current adverse-channel outputs now differ. Default positive-only center is unchanged.

## Independent arithmetic reconstruction

I did not rely on author self-tests as independent evidence. I read the original health engine, uniqueCohort, historical event-linear baseline and shared income helper, and independently integrated supported/counterfactual survival on 200,000 midpoint slices per scenario. Active exposure is one year; afterwards the same postHazard applies to both trajectories. Discount enters each time slice. Native victims are opportunities/repeats: 20/3, 50/2 and137/1.5, with one finite trajectory per synthetic selected victim. Attribution and outcome additionality apply once after that trajectory. MOUD and syringe arithmetic was reconstructed directly from supplied native inputs; the inherited checking event sensitivity was retained separately, not claimed newly identified.

| Quantity | Independent reconstruction | Candidate |
|---|---:|---:|
| Annual naloxone Q, downside | .24613642871523905 | .24613642871457997 |
| Annual naloxone Q, central | 6.478450241796615 | 6.478450241759676 |
| Annual naloxone Q, favorable | 90.88229725732694 | 90.88229725621842 |
| Weighted gift health Q overall | .1255735512726837 | .1255735513 (author rounded) |
| Weighted gift income equivalent overall | .002250407242198817 | .002250407242198817 |
| Weighted gift combined Bay equivalent | .12517339802886038 | .1251733980 (author rounded) |
| Conditional Bay donor price/10 | $7,988,917.899068593 | $7,988,917.899119561 |

The <$.000051 price difference is midpoint quadrature error, not a scientific difference. Central annual health8.88514114533 plus annual income .04610092460 receives $100k/$4,953,186 ×.45×.85 exposure, then Bay.95; the conditional central price remains about $15.26M. Weights .24/.48/.08 and .20 zero-credit remain uncalibrated priors, not identified probabilities. Favorable weighted Bay contribution .09343114537 of .12517339803 is roughly three quarters of the displayed conditional subtotal. Do not reinterpret that weighted illustration as measured EV or renormalize positive worlds.

Cash was independently reconstructed before log. Positives are saved take-home pay + patient out-of-pocket savings + transfer consumption after displaced alternative share. Positive independent credit applies to those resource rows; full fees/travel/care are subtracted afterward. The resulting annual changes are -$180, +$45 and +$483.75, on pre-payment consumption baselines $6k/$12k/$18k. Formula .5×people×log(1+net/baseline)×causalShare/sqrt(1.03) gives -.03751543615545539 / .04610092460378413 /1.9598354391192936. One-year cash is not survivor earnings or lifetime output. Positive credit0 retains -$180/-$90/-$45 costs; adding $100 fee retains -$280/-$190/-$145 before log. `incomeScale:0` intentionally disables the entire economic diagnostic including costs; retain that explicit name and never use it as the zero-positive-credit guard. Finite scales/domain validation protect against nonpositive post-payment resources. CausalShare and gift realization are distinct disclosed exposure judgments, not independently estimated local effects.

## Original finance and sponsor evidence

Web access to original return renderings failed, so I retrieved their actual HTML directly with native Node fetch and inspected selected Part I, III, IX and X passages in memory. No summary API was substituted for financial source values. The original [FY2025](https://projects.propublica.org/nonprofits/full_text/202600909349300545/IRS990), [FY2024](https://projects.propublica.org/nonprofits/full_text/202511339349300501/IRS990), [FY2023](https://projects.propublica.org/nonprofits/full_text/202441369349316239/IRS990) show tax periods July–June, EIN94-3205535 and:

| June FY | Revenue | Expenses | Revenue-expenses | Assets-liabilities/net assets | Program/management/fundraising |
|---|---:|---:|---:|---:|---|
|2025|5162417|4953186|209231|3205937-842623=2363314|3551686/1071359/330141|
|2024|3819407|3219570|599837|2342149-188066=2154083|2557339/478237/183994|
|2023|2935280|2400530|534750|1680645-126399=1554246|2024844/288788/86898|

All three functional category sums equal full expenses. Current original public index lists the FY2025 filing as filed March31,2026, consistent with the author metadata. The legacy public summary API is stale through FY2023 and cannot establish that newer original returns are unavailable. Source completeness is bounded public-index evidence, not proof no later private accounts exist.

PWL program description is identical in FY2024/25: >10,000 served, ≥10,000 naloxone doses, >800 community-reported reversals. That confirms sponsored activity is publicly reported. It does not identify a fresh annual window, deduplicated HEPPAC victims, unique incremental persons or deaths averted. Never sum these descriptions or use800 as the modeled death denominator. [FY2025 Schedule O](https://projects.propublica.org/nonprofits/full_text/202600909349300545/IRS990ScheduleO) reports $12,025 donated services omitted from contribution lines and placed in Schedule D reconciliation; these are not automatically additive gross expense. Legal-entity costs and direct HEPPAC gift remain unmatched by a verified sponsor/marginal allocation.

## Current official and clinical source checks

Fresh [donation page](https://heppac.org/donate/) inspection confirms distinct HEPPAC/PWL/Fresno J&MP routes and legal EIN. Direct route is in scope; all sponsor effects cannot be assigned to it. Native fetch of [NSB](https://heppac.org/nsb/) confirms brief5–10-minute training and unlimited refills, reinforcing doses/refills/recipients/rescuers/victims distinction. [Current OPEND](https://heppac.org/opend/) routes to NSB and EBDC.

Fresh [EBDC index](https://heppac.org/east-bay-drug-checking-ebdc/) includes August2026 and links July. I independently fetched and extracted the original [August PDF](https://heppac.org/wp-content/uploads/2026/09/August-infographic-template.pdf) in memory with curl and existing bundled pypdf:103 drug samples,93 RaDAR results;2 paraphernalia tested,1 result. These are sample/result units, not people or behavioral/health outcomes. July's original image link exists, but web returned no inspectable pixels and no browser was available; I do not claim independent visual confirmation of50/42/10. Those remain author-inspected selected infographic values. This limitation does not alter model inputs.

Fresh [county original staff proposal](https://www.alamedacountyca.gov/board/bos_calendar/documents/DocsAgendaReg_12_16_25/HEALTH%20CARE%20SERVICES/Regular%20Calendar/HCSA_397004.pdf) selected pages verify the proposed $700k increase to $1,679,768 and extension through August31,2026 to retain staffing, with3 checking sites/50+ samples. Proposal is neither executed successor contract nor new private funding gap. Fresh [DHCS](https://www.dhcs.ca.gov/individuals/naloxone-distribution-project/) supports free state supply and all58-county reach, without identifying actual no-gift availability to every selected recipient.

Fresh [local SUN original abstract](https://pubmed.ncbi.nlm.nih.gov/36402631/) verifies five-month three-ED implementation cohort1328/119,30-day engagement50.4%/15.9%, observational adjustment. It cannot identify current annual HEPPAC starts, retained MOUD-years or causal mortality. Fresh [2026 NYC original RCT](https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2844716) abstract/Table3 verifies247 analyzed,12-month adverse-event RR1.02(CI.72–1.45),24 deaths and imprecise mortality/MOUD initiation estimates. Neither a positive local coefficient nor empirical zero follows. This supports cautious prior-only MOUD credit.

Original systematic-review indexed passages for [drug checking](https://pmc.ncbi.nlm.nih.gov/articles/PMC9299873/) report mostly cross-sectional drug-market/behavior evidence, not a causal deaths-per-sample conversion. Direct manuscript access challenged. The [MOUD mortality review](https://pmc.ncbi.nlm.nih.gov/articles/PMC5421454/) direct page also challenged; only indexed original review passages were freshly available. I do not claim new complete review appraisal or direct naloxone/syringe primary-trial verification. The current supported hazards.10/.07/.04,20-year favorable tail, selected mortality probabilities and composite MOUD Q are judgmental; they remain subject to severe-old-mortality, short-horizon, high-repeat and null/adverse sensitivities. Rescue current-care hazards and infection follow-up are not identified by organizational activity.

Fresh [Coefficient Giving](https://coefficientgiving.org/research/cost-effectiveness/) supports $50k logarithmic income reference/$CG100k healthy-year comparison. That is a normative conversion, not measured clinical utility or local consumption response.

## Acceptance guards and handoff

Keep current conditional $7.99M weighted and ~$15.26M central prices visible with their distinct statistic definitions. Keep historical $11.11M event-linear/$8.13M V2 and severe-mortality route distinct, complete and immutable. Do not claim recurrence deduplication caused the favorable prognosis change. Keep unknown recipient residence (including non-Bay sponsors), owner/public/donated incidence, displacement, current retained courses, money panel and marginal capacity visibly unknown; no true-zero absence proof.

Existing Long Horizon/Token Saver/Space Saver instructions were applied from prior bounded review; no nested worker. Existing checkout, Node24 and bundled Python reused; no install/server/build/Git/Sites/outreach or repository edits. No successful browser tab was opened. Source payloads/PDF extraction stayed in memory. Only authorized isolated text/JSON packet files retained. Root alone integrates and verifies UI/publication; author self-tests are not this review's scientific evidence.
