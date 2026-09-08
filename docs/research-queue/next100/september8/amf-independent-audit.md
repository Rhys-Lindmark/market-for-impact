# AMF independent audit

September 8, 2026. Research-only. Audited `https://ai.rhyslindmark.com/givebetter/api/amf-model` schema 1.0.0 and then the completed `./amf-review.md` and `./amf-source-audit.md`. Coordinated with the author so the paused checkpoint was not mistaken for the final report. **Final model and narrative accepted with the qualifications below; no release-blocking correction identified.**

## Model acceptance

**Accept the numerical model as a conditional ordinary-public-gift estimate, not a calibrated AMF lifetime CEA or unrestricted all-expense estimate. No central retuning recommended.** Forty independent output checks on the original eight scenarios passed. After the author's update, all nine scenarios passed a separate expanded calendar-year × post-event-survival calculation, including zero funding plus independent donor harm.

| Scenario | Global QALYs / 1,000 nets | Donor $/10 QALYs | Gross associated-resource $/10 QALYs |
|---|---:|---:|---:|
| Central | 3.08636025 | 9,720.19 | 19,440.37 |
| Favorable joint sensitivity | 55.34487705 | 361.37 | 813.08 |
| Pessimistic positive | .00865280 | 5,778,475.22 | 11,556,950.44 |
| Three-year survival-postponement stress | .53981186 | 55,574.92 | 111,149.84 |

Null funding and null clinical effect give zero; clinical null with shared harm gives −.00478315 QALY per 1,000 nets. Independent donor harm produces −6.91363975 centrally and −10 with zero funding additionality. Nonpositive QALYs correctly yield null ratios, not cheap positive health prices.

## Primary sources independently verified

1. **Survival persistence, not lifetime utility calibration.** [Fink et al., NEJM, February 2, 2022](https://www.nejm.org/doi/full/10.1056/NEJMoa2112524) followed a Tanzanian birth cohort for 22 years. Of 6,706 participants, vital status was verified for 5,983 (89%). Greater early-life net use was associated with lower mortality, HR .57 (.45–.72); the age-five-to-adult comparison was .93 (.58–1.49). Observational exposure, missing early deaths and residual confounding limit causal interpretation. The primary result supports persistence without a detected later mortality reversal; it does not measure .85 utility, .99 annual survival, .8 persistent fraction or a 40-year survival-difference curve. Those remain explicit judgments. The model does not add this cohort association to the Ghana trial effect.
2. **Ghana follow-up direction.** [Binka et al., November–December 2002](https://pubmed.ncbi.nlm.nih.gov/12625130/) reports the original 17% reduction in all-cause mortality at ages 6–59 months and no indication of increased mortality in any age group through the end of 2000 after the trial. This supports the rejection of automatic early-death postponement only, but is not proof of lifetime persistence in every modern campaign.
3. **Ordinary public gift boundary.** [AMF non-net-cost policy](https://www.againstmalaria.com/NonNetCosts.aspx), independently read September 8, says public gifts buy nets; specified other donors fund non-net costs, and co-funders generally finance distribution. This is a reasonable source basis for representing AMF's ordinary public giving route with its core intervention. It is not the same as assuming every unrestricted institutional grant has this allocation, or that delivery and monitoring are free social resources.
4. **Actual dated funding snapshot and price examples.** [AMF funding-gap page](https://www.againstmalaria.com/AMFFundingGap.aspx), independently retrieved through direct HTML on September 8 after web timeout, displayed immediate gap **$70.67m**, available/uncommitted **$128.38m**, and approved potential use **$199.06m**. The page contains the **$2 commodity / $4.50 distributed-net illustrations**, 1.80 people per net and a note that $2 is a common forecast price, with actual net costs typically $1.50–$2.50. These are provider planning examples, not a verified marginal 2026 quote or a complete resource ledger. The model's $3+$3 central is a judgment, not those quoted figures. Rounding means displayed totals differ by $10,000; no invented exact reconciliation is needed.

## Material boundaries to preserve in final narrative

- **Costs:** the added $3/net is a gross associated-package allowance/stress. Do not relabel `resourceUsdPer10Qaly` as net incremental societal CEA: public/partner counterfactual resource use, replacement, timing and other impacts are not reconstructed. Its positive gross numerator can remain when health additionality is zero only under this explicit gross interpretation.
- **Representativeness:** a public net-purchase gift across AMF-selected campaigns is the modeled route. The next campaign's geography, child share, baseline risk, net type and replacement schedule are not empirically weighted. This is a representative *planning prior*, not a measured campaign-mix average. In particular .015 is an annual all-cause risk among ages 6–59 months, not the probability of death before age five per live birth.
- **Survival:** the discounted survival sum is finite and utility-weighted once, conditional on each early-death difference. Calendar discounting before the event and survival discounting after it are correctly separate. The three-year stress is diagnostic, not a primary evidence-based cap. Utility/horizon shrinkage must not be portrayed as measured or proven conservative.
- **Coverage and attribution:** coverage is a trial-equivalent functional-protection schedule, not an independently measured current-use fraction layered onto a supposedly perfect-efficacy trial estimate. Combined additionality handles already functional nets and other donors once. These are linear marginal planning assumptions, not a transmission model; community effects must not be added again.
- **Funding:** the displayed funding gap is real provider evidence, but not a guaranteed counterfactual additionality of one or an earmarked offer for the reader. The already announced DRC grant belongs to baseline; its outputs are not the next public gift's outputs.
- **Geography:** overseas direct health is global, not Bay health. Bay direct zero and unmeasured indirect zero credited are correct; the Bay ratio remains null. A California donor or US legal recipient is not a Bay beneficiary. Global health should not be discounted merely because it is outside the Bay.
- **Uncertainty:** favorable, central and pessimistic are joint judgment scenarios, not a confidence interval. The favorable sub-$1,000 result is not the ranked estimate or independently validated opportunity price. The central sub-$100k result does not require threshold tuning; the assumptions and downside sensitivities must remain inspectable.

Final narrative preserves the source-versus-judgment, ordinary-public-gift, gross-resource, finite-survival, funding-baseline and Bay-geography qualifications. Its additionality threshold statements are consistent with linear scaling: approximately .04860 donor and .09720 gross-resource additionality at $100k/10 QALYs, holding other central inputs fixed. These thresholds are sensitivities, not estimated additionality.

No Site files changed. This audit does not certify tax status, the entire 2025 accounts or every source beyond the independently verified set above. Integration, display labels and duplicate-roster checks remain coordinator responsibilities.
