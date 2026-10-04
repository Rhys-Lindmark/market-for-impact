# HOPE Pacifica: acceptance challenge and superseding recommendation

October 1, 2026. **Withdraw the earlier recommendation to change central horizon10→5 and funding response .5→.25. Retain the existing ten-year, .5-response health central, add explicit zero net-income central and independently signed economic/prognosis sensitivities.** The resulting central price remains **$554,659.55 per better life** for $1,000, not $1,881,542.41. A recalibration need not produce a worse point estimate. This addendum supersedes those two numerical choices in `hope-pacifica-calibration-decision-2026-10-01.md`; preserve that earlier memo as an actual proposal/research record, not accepted product parameters.

## Survival challenge: age, hazard and truncation are different

The existing model reduces first-year hazard .070→.068, then carries the year-one survival gap under common .07 hazard. This continuation is a real consequence of being alive, not a claim that HOPE keeps causing a new rescue each year. Missing local longitudinal observation makes the prognosis uncertain; it does not make the surviving cohort disappear at year five.

Freshly checked primary longitudinal evidence:

| Primary study | Observation | Implication and transfer limit |
| --- | --- | --- |
| [Oslo twenty-year prospective cohort](https://pmc.ncbi.nlm.nih.gov/articles/PMC2277385/) | 185 hospital-treated opioid-dependent people in 1980/81, median age24 (16–41); 70 died over20years (37.8%), five emigrated and110 confirmed alive. Elevated mortality persisted across five-year periods. | Substantial survival beyond five/ten years exists despite high mortality. Historical European cohort, not modern Bay fentanyl or HOPE beneficiaries; it cannot set HOPE's hazard or age. Median age34 **among those who died** is not the cohort's life expectancy. |
| [ATOS18–20year follow-up, original research](https://pmc.ncbi.nlm.nih.gov/articles/PMC9847452/) | 615 Australians with heroin dependence recruited2001/02, mean baseline age29.3(SD7.8); 109 known deceased18–20years (17.7%), versus72 at11years. 401 reinterviewed at18–20years; most originally entering treatment. | Sustained life and recovery beyond10years are plausible. Australian treatment-heavy cohort and incomplete reinterview, not untreated Bay survival or guaranteed82.3%confirmed-alive proportion. Does not identify HOPE's age/mix. |
| [Estonian community PWID mortality study, European Journal of Public Health2024](https://academic.oup.com/eurpub/article/34/2/329/7457889) | 1,399 participants, median entry age34, median actual prospective follow-up3.5years; all-cause rate28.9/1,000person-years. Reported survival73%at10years and56%at20years is measured **since first injection**, not since enrollment or rescue. | Fentanyl/HIV context supplies additional evidence of heterogeneous mortality, but the retrospective injection-time survival scale and survivor selection prohibit importing its23.5year median as post-rescue life expectancy. Explicitly do not treat this as20years of prospective follow-up per person. |

The earlier [Larochelle](https://pubmed.ncbi.nlm.nih.gov/29913516/) 4.7/100person-years and [Olfson](https://pubmed.ncbi.nlm.nih.gov/29926090/)7.783/100person-years observations concern selected first-year nonfatal-overdose survivors, not lifetime hazards. This new scrutiny does not fit a local survival curve; it establishes that an arbitrary five-year cutoff is not supported by prognosis evidence. It also does not justify lowering the .07 post-support hazard to improve the price. Retain .07 as an explicit strong prior and vary it separately.

- **Age** determines competing mortality and changes over time. No HOPE beneficiary age distribution was located; an organization founder's bereavement story cannot supply it.
- **Mortality hazard** determines each year's survival probability. Constant .07 implies an undiscounted exponential mean14.29years conditional on year-one survival, without representing literal age-specific life expectancy. Real hazards vary with age, treatment, recovery and drug supply.
- **Horizon** is an analytic truncation. Five years deletes all later person-time from otherwise living people; it is neither a .20 mortality hazard nor a measured five-year prognosis. Under .07 common hazard, about75.6%of the year-one survivors remain at year5 and53.3%at year10. Cutting off at5 therefore excludes substantial modeled living time, not merely a negligible tail.

**Acceptance choice:** retaining10 is a defensible finite continuity judgment, not an empirically optimal horizon. Neither the external evidence nor absent local measurements identifies exactly10. Retain1/2/5 as restricted-horizon stress tests, add20 and an analytic infinite-horizon diagnostic, and keep the .07 hazard/utility prominently uncertain. Longer-term benefits may be real; short horizons must not be described as inherently more accurate. Better future age/prognosis information could support an age-dependent survival integration rather than a shortened cutoff.

## Independently calculated prognosis sensitivities

Hold all original central parameters including funding .5. Let `d=ln(1.03)`, active integral `A=I(.068+d,1)−I(.070+d,1)`, year-one survival gap `G=exp(−.068)−exp(−.070)`, and `T=G×exp(−d)×I(postHazard+d,horizon−1)`. Bay health `2.5×[.65×(A+T)−.00002]×.95`. For the analytic infinite horizon, `I(h,∞)=1/h`; this is a mathematical sensitivity under constant positive mortality/discount, not immortality, local prognosis or a newly supported UI input.

| Horizon | Bay health/$1,000 | Price/better life |
| --- | ---: | ---: |
| 1 | .001398469078 | $7,150,676.52 |
| 2 | .004061424666 | $2,462,190.20 |
| 5 | .010629577053 | $940,771.20 |
| **10 retained central** | **.018029077420** | **$554,659.55** |
| 20 | .025261173262 | $395,864.43 |
| Analytic infinite horizon | .029499602152 | $338,987.62 |

Ten-year health captures about61.1%of the constant-hazard infinite sensitivity; five years about36.0%. These are model arithmetic, not recovered health fractions. Keep the original92.0%post-year-one gross survival share visible; a large tail need not be spurious, but it makes prognosis consequential.

Independent post-support hazard at ten years: .02→$460,574.20; .047→$510,340.85; .07→$554,659.55; .10→$614,860.23; .20→$830,438.11. These vary the actual survival curve while retaining time for survivors. None is an inferred current HOPE hazard; .047 is first-year historical scale, not a newly validated long-run coefficient.

## Funding challenge: additional money is not pharmacology or available stock

Freshly reopened [county free-box FAQ](https://www.smchealth.org/sites/main/files/file-attachments/help_expand_access_to_naloxone_in_san_mateo_county_faq.pdf?1759531506=) and [DHCS free-drug/CalRx FAQ](https://www.dhcs.ca.gov/individuals/naloxone-distribution-project/ndp-frequently-asked-questions/) confirm public alternatives. County hosts still need permissions, stocking and reporting; approval/availability is conditional. These facts were **already in accepted V2**. The first decision memo's lower .25 response was a stricter preference, not an externally anchored quantitative update.

Define funding response `theta` narrowly: additional **functional ready-network coverage caused by extra spend** divided by the coverage implied by proportional whole-organization cash/output. It concerns reserves, donor substitution, deployment capacity and the particular activities bought by money. It is not the probability naloxone works, a second recipient access-alternative fraction, or the percentage of medication bought privately.

Define `.002` hazard gain separately: conditional net first-year mortality benefit of the added functional coverage, after timely existing naloxone, emergency responders, actual use, risk and other recipient alternatives. Public supply may enable cash leverage and also provide an alternative. Apply its effect in the relevant ledger, not reflexively in both theta and hazard.

If the gift proposes redundant hardware available free, theta for that specific tranche may be near0. If it funds host recruitment/stocking that otherwise would not occur, public drug supply may make theta high. The available accounts and deployment plan do not distinguish those cases. No source estimates .25 versus .5; absence of accounts also does not identify either. **Retain .5 as the continuity judgment**, expose0/.1/.25/.5/1 independently, and retain original funding-null scenario weight. This does not certify .5 as measured or automatically combine the null weight with the central response as two empirically estimated crowd-out probabilities.

At horizon10, theta .25 produces$1,109,319.10; theta0 preserves spending and has no added health/income. The combined theta.25/horizon5 price$1,881,542.41 is a legitimate two-axis downside case, **not the revised preferred point**. Whole annual expense remains an unobserved$40kcentral prior and$20k/$100kstresses; no new finances or annual throughput were discovered. Annual-work health omits extra-gift theta; do not apply a money-response penalty to annual output or call that a fresh donation result.

## Income: retain an explicit channel, not survival earnings

Recommend **net-income central0** because the household net sign is unidentified, not because saving lives lacks economic value. Do not add ordinary baseline earnings for added survival years. Distinct conditional-alive employment, caregiver or medical-cost changes remain unmeasured; no arbitrary beneficiary multiplier or state-drug retail-value income is added.

The DHCS current **$19 per two-device CalRx pack, plus tax/shipping**, is an externally anchored purchase price. Avoided payment requires the household actually would buy an equivalent pack without HOPE; taking another free pack or foregoing purchase creates no avoided expenditure. Purchase probability, transaction costs and$50kreference income are judgments, not HOPE observations. Purchaser savings are not identical to societal savings or state procurement costs.

For a positive cash diagnostic, `M=1000/40000×1500×.5/3×.5=3.125` ready-holder-equivalents, purchaser share.10, one$19avoidedpayment, $50kreference andBay.95. `.5×M×.95×.10×log1p(19/50000)=.000056395536`income-equivalentyears. **.10 is an explicit stress prior, not evidence-based incidence.** The original .8risk/network conversion is not an observed unmet share, and holders are not automatically distinct high-risk people. Do not interpret its residual.2 as purchasers.

To enforce clinical/cash disjointness in a combined stress, allocate10%of modeled coverage to counterfactual purchasers with **zero added health** and reapply the existing risk/network conversion to the remaining90%. This is an explicit hypothetical partition, not a discovered cohort. Health then .016226169678 and totalprice **$614,153.84**. This is preferable to silently layering cash onto people credited for clinical protection they would already purchase. If independent evidence instead identified purchasers outside the health cohort, unchanged health plus cash would imply$552,929.97, but that disjoint additional population is not established here and should not be the default joint case.

Required independent cases:

- Null health/harm plus positive purchaser income: .000056395536 income-equivalentyears, **$177,319,000.64**per betterlife.
- Positive central health, no purchase saving, allM incur incremental$5acquisitionburden once: income−.000148444922, **$559,264.33**. $5is a stress amount, not a measured fare or recipient cost; count only burden incremental to the comparison purchase.
- Health/purchase complete null:0total, no positive price, keep$1,000spent. Fundingnull means no additional holder cohort, so it cannot retain purchaser saving.
- Adverse health and/or adverse cash: retain signed negative components and null positive-price output when total≤0. Positive health need not entail positive income; nullhealth does not force zeroincome.

Source/parameter claims and proposed causal definitions are ready for manager acceptance; no new empirical giving guarantee is established. Preserve the first memo's native financial/unit uncertainty and root's independent ranking convention. Implementing explicit income and independent sensitivity disclosure is meaningful recalibration even when the retained central health price does not change.

Actual clocked source scrutiny/calculation **2026-10-01 17:18:28–17:20:57UTC, 2m29s, GPT-6.1Sol**; memo writing afterward not reconstructed or padded toward10minutes. Space Saver/Token Saver applied; existing checkout/runtime reused, no new workers, product changes, installs, servers or downloads to disk. Own only this addendum.
