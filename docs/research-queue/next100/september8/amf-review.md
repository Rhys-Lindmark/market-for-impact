# Against Malaria Foundation — general public net-giving proposal

September 8, 2026. Completed research proposal, not yet integrated/published or independently accepted. [Model JSON](https://ai.rhyslindmark.com/givebetter/api/amf-model) · [Primary-source audit](./amf-source-audit.md).

## Outcome and exact giving scope

**Central analyst estimate: $9,720 per 10 global incremental QALYs** for AMF's ordinary public net-purchase route. A gross associated-package resource sensitivity is **$19,440/10 QALYs**. The selected overseas program has **zero direct Bay health share; indirect Bay health is unmeasured and zero credited**, with no finite positive Bay cost/QALY ratio.

This is a promising new organization for the global comparison, not proof of a precise return or a recommendation specific to an unverified country allocation. No AMF slug appeared among48 unique available local-worktree charity pages checked before the pause; the coordinator must check the current canonical roster before integration. Nothing is counted until published.

AMF is an unusually focused organization, but the boundary still matters: [its public-gift policy](https://www.againstmalaria.com/NonNetCosts.aspx) directs ordinary public donations to nets while separate funders support monitoring and other costs. Thus this is a **representative core-organizational giving estimate**, not an unrestricted all-expense grant or a GiveWell pooled-fund estimate. AMF chooses the eligible campaign. No bespoke country restriction is assumed. An explicit non-net-cost grant could have a different marginal effect and would require another allocation analysis, not a second organization count.

## Dated funding room and counterfactual

[AMF's live funding page](https://www.againstmalaria.com/AMFFundingGap.aspx), direct HTML retrieved September8,2026, displayed **$70.67m immediate gap**: $488.55m funds in hand able to commit, $360.16m committed, $128.38m available, and $199.06m approved programs seeking funds. Displayed rounded figures differ by about$10k when subtracted; do not claim penny precision. This is a real approved pipeline, not a guaranteed causal return on every dollar.

The [August24,2026 $276m GiveWell/Coefficient DRC grant](https://blog.givewell.org/2026/08/24/announcing-our-largest-grant-to-date/) is already funded baseline. Its92million-net program is not assigned to a fresh donor. The [funder's research account](https://blog.givewell.org/2026/08/27/the-research-behind-our-276-million-grant-for-malaria-nets-in-drc/) explicitly estimates only about46million of those nets would otherwise be absent. Its death estimate is not our QALY estimate and is not reused here. Future country mix and replacement by other donors remain uncertain; central **.5 combined additionality** accounts for financing and net-output displacement beyond existing functional nets. This is judgment, not derived from that grant's50% ratio.

## Primary causal evidence and limits

[Binka et al.,1996 Ghana cluster RCT](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1365-3156.1996.tb00020.x) found all-cause mortality RR.83 (95%CI.69–1.00) among children6–59months. It was a high-transmission1993–95 setting with regularly re-impregnated nets and little prior use. We use the17% central relative reduction as an anchor, not an AMF-specific effect. Benefit was concentrated in younger children; all-cause risk includes competing causes, so **do not multiply again by a malaria-death fraction**.

[The2002 follow-up](https://doi.org/10.1016/S0035-9203(02)90321-4), primary indexed abstract independently retrieved, found no indication of increased mortality after the randomized intervention through2000. A [Tanzania22-year cohort](https://www.nejm.org/doi/full/10.1056/NEJMoa2112524) associates early net use with survival to adulthood; it is observational, not a randomized40-year survival guarantee. These inform plausibility of persistence, not utility values.

[Modern Tanzania net-type RCT](https://pmc.ncbi.nlm.nih.gov/articles/PMC8971961/) supports the importance of insecticide choice under resistance: chlorfenapyr nets outperformed standard pyrethroid nets on malaria outcomes, while other tested net types did not clearly do so overtwo years. Those are infection outcomes, not direct modern mortality/QALYs. Our .5 effect-transfer factor is a conservative planning judgment for context/net mix, not a fitted resistance parameter. No extra community spillover multiplier is added to the community-trial anchor.

## Inspectable model and central assumptions

One cohort comprises **1000 purchased net-equivalents allocated within community campaigns**. This is not a claim1000 isolated nets reproduce a cluster trial.

| Input | Central | Status |
|---|---:|---|
| Donor cash/net | $3 | Analyst price, not current quote |
| Other associated resources/net | $3 | Gross allowance, not net societal cost |
| People per net-equivalent | 1.8 | AMF planning convention, not verified marginal occupancy |
| Eligible6–59month share | .14 | Analyst demographic prior |
| Counterfactual annual all-cause mortality | .015 | Analyst child-year rate, not under-five probability per birth |
| Relative mortality reduction | .17 | Historical trial anchor |
| Effect retained in new context | .5 | Analyst transport prior |
| Trial-equivalent functional protection, years1–3 | .8/.5/.2 | Use/durability prior; year3 extrapolated |
| Campaign delay | 1year | Analyst planning prior |
| Combined package additionality | .5 | Funding/output replacement prior |
| Subsequent survival | .99/year, truncated40years | Analyst survival-difference schedule |
| Utility and persistent fraction | .85 and.8 | Analyst assumptions, not measured utilities |

Eligible population is tracked through person-years, with aging and new entrants; the model does not keep one child under five forever. Mortality risk is annual among children6–59months under usual care without the extra package—not neonatal-inclusive under-five mortality per livebirth. The .015 and .14 priors are **not measured AMF marginal averages**; this is the largest geographic calibration limitation.

Let E=sum of protection fractions discounted at campaign-delay plus yearly midpoint; L=sum of post-event annual survival × utility × persistent fraction, discounted at each subsequent midpoint. Then:

- E=.8/1.03^1.5 + .5/1.03^2.5 + .2/1.03^3.5 = **1.410031**.
- L=.8×.85×sum(k=1..40)[.99^(k−.5)/1.03^(k−.5)] = **13.646137 QALYs per early death at its event date**.
- Discount-weighted early deaths/1000 nets =1000×1.8×.14×.015×.17×.5×.5×E = **.226522**.
- Net Q/1000 =.226522×L −1000×.5×.00001/1.03^1.5 = **3.086360**.
- Donor ratio=10×$3000/3.086360 = **$9,720/10Q**.

Event-time and subsequent-survival discount cover different intervals. No doubled discount, extra lifetime multiplier, morbidity credit or income/education credit. The.8 fraction gives zero long-term credit to20% of the early-death reduction; that shrinkage is not an observed catch-up probability. The40-year endpoint is finite and excludes later life, but remains an extrapolation. Linear small-risk person-year accounting is an approximation, not an age-specific dynamic transmission model.

## Range, null and harm

Joint favorable/pessimistic settings are scenario analyses, **not confidence intervals or weighted probabilities**. The favorable .25 relative reduction is an analyst setting, not Binka's point estimate. No scenario was selected to hit the target.

| Scenario | Global net Q/1000 nets | Donor $/10Q | Gross package-resource $/10Q |
|---|---:|---:|---:|
| central | 3.08636 | $9,720 | $19,440 |
| favorable | 55.3449 | $361 | $813 |
| pessimisticPositive | 0.00865280 | $5,778,475 | $11,556,950 |
| nullFundingReplacement | 0.00000 | No positive ratio | No positive ratio |
| nullClinicalEffect | 0.00000 | No positive ratio | No positive ratio |
| clinicalNullWithHarm | -0.00478315 | No positive ratio | No positive ratio |
| shortSurvivalPostponement | 0.539812 | $55,575 | $111,150 |
| independentDonorHarm | -6.91364 | No positive ratio | No positive ratio |
| nullFundingWithIndependentHarm | -10.0000 | No positive ratio | No positive ratio |

A three-year-only survival difference preserves near-term benefit but removes all later credit. Shared net toxicity/resistance/implementation harm is scaled by package additionality; donor-specific harm sits outside it and can remain under complete replacement. Harm amounts are diagnostic priors, not measured bounds. Zero/negative outcomes never receive a positive ratio. Human toxicology, vector adaptation, diversion and ecological harms remain incompletely quantified.

## Costs, scope and donor takeaway

[AMF's funding-page narrative](https://www.againstmalaria.com/AMFFundingGap.aspx) uses$2commodity and$4.50delivered planning illustrations in a2024–26 discussion. They are context, **not a2026 procurement quote**. Our$3+$3 central allows more cost. The non-net page includes shipping, logistics, household registration, distribution and monitoring, often paid by other partners. Gross allowance also includes operational/volunteer opportunity-cost headroom; it is not a detailed bottom-up cost study.

The JSON's legacy “resource” fields charge all sponsored packages' estimated costs without netting replacement or avoided healthcare. They should be displayed as **gross associated-package stress**, not a societal ICER. This guards against calling cofunded delivery free; it may overstate net induced resources where another funder would otherwise pay, and can understate difficult settings if$3 is insufficient. No cofunding outcomes are credited again under another organization.

At central settings, an additionality factor near.049 rather than.5 would move donor cost to roughly$100k/10Q; roughly.097 would do so for the gross-resource perspective. Current margin can therefore disappoint materially and still retain plausible upside. The model is stronger as evidence that AMF belongs in serious global consideration than as a precise $9,720 forecast.

Bay donors, AMF US registration and possible global economic benefits do not establish Bay QALYs. Keep global benefits fully valued in a global ranking; show zero credited local benefit for this route rather than fabricate SF spillovers.

**Verification:**113 checks passed: nine independently expanded calendar-by-survival sums and104 original-output invariance comparisons; allnine scenarios recalculated, with null/harm regression. This verifies arithmetic and units, not empirical priors. Source review completed; independent acceptance is a separate next step. The token-saver skill limited repeated retrieval to decision-changing source gaps.
