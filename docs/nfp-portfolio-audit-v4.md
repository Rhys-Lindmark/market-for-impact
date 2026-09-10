# Changent: two-program whole-organization extension (v4)

## Decision

**HOLD for giving; ACCEPT as an exploratory unfavorable organization-wide report after replacing the NFP-only scope language and figures with this portfolio extension.**

The accepted v3 model correctly charged the whole $30.712 million organization expense denominator, but it credited health benefit only to Nurse-Family Partnership. Changent's second program, Child First, is too material to silently assign zero: its FY2024 direct program expense was $5.679 million (18.49% of whole expense; 26.23% of named program-service expense). The corrected portfolio estimate adds a bounded Child First contribution without changing any accepted NFP health assumptions.

## Revised headline

For a hypothetical unrestricted $100,000 gift, the two-program signed expectation is **0.07127 QALY**, or **$14.03 million donor cost per 10 QALYs**. Illustrative gross resources are **$151,281**, or **$21.23 million per 10 QALYs**. Child First contributes 0.00507 expected QALY, 7.11% of the signed total. The estimate remains dominated by the favorable stress case (84.73% of signed expected QALYs); removing that case raises donor cost to **$87.30 million per 10 QALYs**.

These are prior-modeled best guesses, not observed marginal results. No verified marginal offer or health-producing marginal capacity was found. FY2024 reported a $11.828 million accounting surplus and $111.212 million net assets; net assets are not equivalent to liquid unrestricted reserves. Giving recommendation remains **HOLD**.

The $14.03 million headline deliberately preserves v3's within-age-20 survival bound. It is not a lifetime-QALY best estimate. An actuarial-anchored finite horizon sensitivity below tests the opposite defensible interpretation rather than silently assigning zero value after age 20.

## Whole-gift allocation and non-overlap

The model counts the gift once. In each scenario, `gift × fundingAdditionality ÷ FY2024 expense` is one organization-scale fraction. That fraction scales:

- 57,005 reported 2024 NFP active families, converted to 22,802 approximate full-course equivalents per year by the accepted 2.5-year duration; and
- 2,564 reported 2024 Child First families, treated as approximate annual full-course family equivalents because the official intervention duration is typically 6–12 months.

NFP and Child First QALYs are calculated separately and then added. The reporting presents separate program counts, but it does not establish whether any household participated in both programs. The model therefore applies an explicit 90%/95% uniqueness factor to Child First in cautious/central scenarios (100% in the stress bounds). No benefit mechanism is double-counted.

The Form 990's $9.062 million non-program expense is allocated across the two programs in proportion to direct program expense. This allocates $22.656 million to NFP and $8.056 million to Child First and reconstructs the entire $30.712 million organization expense. It is an accounting allocation, not evidence that overhead causally produces outputs.

## Child First evidence and finite QALY bridge

The official program uses a licensed mental-health clinician plus care coordinator for trauma-affected families with children birth through five. Changent reported 2,564 Child First families and 60,971 contacts in 2024. Its one-site RCT (N=157) reported better child language/externalizing symptoms, caregiver psychopathology, and service access at 12 months, plus less child-protective-services involvement at three years. A newer multisite pandemic-era RCT (N=224 randomized; 182 followed) found no significant effects on caregiver psychological well-being, child behavior, child welfare, or most economic outcomes. Neither reports QALYs.

Accordingly, Child First uses an explicit signed analyst bridge:

| Scenario | Weight | finite utility bridge before transfer | causal transfer | QALY per realized unique family | Interpretation |
|---|---:|---:|---:|---:|---|
| Harm | 10% | -0.005 | 100% | -0.005 | one-year average burden equivalent to a 5% chance of a 0.10 utility loss |
| Null | 40% | 0 | 0% | 0 | newer multisite RCT controls the modal case |
| Cautious | 30% | 0.005 | 20% | 0.001 | small, finite one-year caregiver/child mental-health benefit with weak transfer |
| Central | 15% | 0.020 | 50% | 0.010 | bounded one-year caregiver plus child utility improvement, half transferred |
| Favorable stress | 5% | 0.080 | 62.5% | 0.050 | upper stress case allowing a child component lasting no more than two years |

These utility quantities are judgmental scenario inputs, not trial effect estimates. The bridge intentionally gives 50% combined null/harm weight. The positive original trial supports modeling a positive tail; the later null multisite trial prevents treating the original results as a stable modern effect.

## Gross-resource boundary

Changent is a national replication/support organization; affiliate agencies supply clinical labor and other delivery inputs. For Child First, the Blueprints program profile reports a $14,643 first-year example for 60 families, a Child First estimate of $8,000 per family in Connecticut, and a $10,834 Washington State implementation-cost estimate. These are historical/location-specific developer or evidence-clearinghouse inputs—not verified current Changent marginal prices. The model therefore uses $14,643 in harm/null/cautious cases, $10,834 centrally, and $8,000 favorably only as gross-resource sensitivities.

For each program, local delivery resources attach to funded, pre-realization equivalents. The model subtracts the single modeled internal Changent support amount once and then adds the donor gift once. This avoids both treating unrealized services as resource-free and double-counting donor cash.

## Geography

No primary evidence located in this audit verifies a Child First affiliate in San Francisco, the nine-county Bay Area, or California. Child First therefore receives **zero modeled Bay/SF QALYs**, which means “no verified local pathway in this model,” not proof that no local resident ever benefits. The existing unsourced NFP geography priors (2.5% Bay; 0.2% SF) apply only to NFP QALYs. Portfolio impact shares fall to 2.322% Bay and 0.1858% SF; modeled donor costs are $604.16 million/Bay 10 QALYs and $7.552 billion/SF 10 QALYs.

## Exact scenario results

| Scenario | total QALY / $100k | Child First QALY | donor $/10Q | gross $/10Q |
|---|---:|---:|---:|---:|
| Harm | -0.01255 | -0.000668 | not defined | not defined |
| Null | 0 | 0 | not defined | not defined |
| Cautious | 0.003475 | 0.000319 | $287.79m | $448.34m |
| Central | 0.07396 | 0.007138 | $13.52m | $25.14m |
| Favorable stress | 1.20783 | 0.07931 | $0.828m | $1.828m |
| Weighted signed | 0.07127 | 0.005065 | $14.03m | $21.23m |

## NFP mortality-horizon sensitivity

The Memphis mortality outcome was measured only through age 20. The core 9-QALY input assumes a counterfactual death around age 10 and credits approximately ten remaining years through age 20 at 0.9 utility; it gives no value after age 20. That is a conservative follow-up-bound diagnostic, not an actuarial lifetime expectation.

As a separate finite extrapolation, the 2022 Social Security period life table gives 65.33 remaining years for a male and 70.72 for a female at age 10. An unweighted midpoint is 68.025 years. At 0.9 utility and 3% annual discounting, an end-of-year finite annuity is 25.983 QALYs per prevented death. Scaling only the positive NFP scenario credits by 25.983/9—while leaving the harm/null cases, scenario weights, funding additionality, modern-trial discount, and all Child First inputs unchanged—produces:

- 0.19845 signed expected QALY per $100,000;
- $5.04 million donor and $7.62 million gross resources per 10 QALYs;
- $30.08 million donor per 10 QALYs after removing the favorable scenario; and
- 84.09% of signed benefit from the favorable scenario.

This is actuarial-anchored, not a full survival-curve integration. The assumed mean counterfactual death age of 10 is not reported by the trial, an equal-sex life-expectancy midpoint may not match the Memphis sample, and the calculation assumes deaths were prevented rather than merely delayed beyond age 20. Those extrapolations are too strong to replace the core bound without a stated modeling judgment. The sensitivity materially lowers the numerical price but **does not change HOLD**: the mortality endpoint was sparse and non-prespecified, the modern age-two primary composite was null, the result remains tail-dependent, and marginal gift capacity is unverified.

## Sources (accessed 2026-09-10)

1. Changent FY2024 Form 990, official public-inspection copy: https://changent.org/wp-content/uploads/2025/08/Public_Inspection_-_NFP_-_09.30.2024_Form_990.pdf
2. Changent 2024 Year in Review: https://changent.org/year-in-review-2024/
3. Changent Child First program page: https://changent.org/what-we-do/child-first/
4. Lowell et al. RCT, PMID 21291437, DOI 10.1111/j.1467-8624.2010.01550.x: https://pubmed.ncbi.nlm.nih.gov/21291437/
5. Multisite pandemic-era RCT, PMID 41213563, DOI 10.1037/fam0001393: https://pubmed.ncbi.nlm.nih.gov/41213563/
6. ACF Prevention Services Clearinghouse, Child First: https://preventionservices.acf.hhs.gov/programs/995/show
7. Blueprints for Healthy Youth Development, Child First evidence and cost profile: https://www.blueprintsprograms.org/programs/715999999/child-first/print/
8. U.S. Social Security Administration, 2022 period life table (age-10 remaining life expectancy): https://www.ssa.gov/policy/docs/statcomps/supplement/2025/4c.html

## Inspectable artifacts

- `lib/nfp-portfolio-model.mjs`
- `data/us/nfp-portfolio-results-v4.json`
- `scripts/nfp-portfolio-model.test.mjs`
- the scope evidence summarized above

All empirical values are dated. The QALY bridge, ordinary-gift additionality, service realization, recipient uniqueness, geography, and delivery-cost transfer are explicitly analyst priors. The model should not be presented as a verified marginal offer.
