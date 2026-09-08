# PRC: short ART interruption health bridge

Independent bounded audit, 2026-09-08. Research only; not clinical advice. Coordinated with provider/finance and payer reviewers; no duplicate local program claim.

## Decision

Do not advance a large-benefit ART-continuity model from current evidence. Maintaining ART is clinically important, but neither the local residual medication-free interval nor a causal QALY loss for a brief interval has been established. A positive clinical benefit is plausible for preventing an otherwise prolonged lapse; a cheap, genuinely additional donor margin remains unverified. This is not a finding that PRC has no health benefit.

Harvey found no ART-specific cohort or gap duration in current PRC evidence; medical grants are one component of broader emergency assistance. Euclid found a 30-day ADAP temporary-access pathway while paperwork is obtained. A 30-day administrative delay therefore must not become 30 days without medication. See `/private/tmp/mfi-prc-payer-audit.md` for primary payer citations and date boundaries.

## Primary clinical anchors

**Li et al., Clinical Infectious Diseases 2022, 74:865–870 (published online 2021), ACTG A5345.** [Primary full text](https://academic.oup.com/cid/article/74/5/865/6297156), [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC8906742/). The publisher text was readable; PMC challenged. Forty-five evaluable participants (33 chronic-treated, 12 early-treated), ages 18–70, suppressed for at least two years, current CD4 ≥500, nadir ≥200, no AIDS-defining history. Ninety-seven percent used integrase-based ART. Median rebound to ≥1,000 copies/mL was 22 days; this is neither time to any detectable virus nor a safe stopping window. Acute rebound syndrome occurred in 9% of chronic-treated participants and none of the early-treated group; symptoms resolved after restart. All resuppressed. Chronic-treated median CD4 remained 87 cells/mm³ below baseline at 24 weeks after restart. No randomized continuous-treatment comparator, preference-based utility endpoint, or donor-navigation effect. These selected, closely monitored participants cannot establish safety for medically vulnerable clients, and successful resuppression does not establish zero lasting harm. Nor does a biomarker change establish a fixed QALY decrement.

**Landman et al., Lancet HIV 2022;9:e79–e90, QUATUOR.** [Primary abstract](https://pubmed.ncbi.nlm.nih.gov/35120640/), DOI 10.1016/S2352-3018(21)00300-3. Adults with suppression >12 months, no resistance, CD4 ≥250, no chronic HBV were randomized to four treatment days followed by three off versus daily therapy. Week-48 success: 304/318 versus 308/318; adjusted difference −1.3 percentage points (95% CI −4.2 to 1.7), meeting the prespecified noninferiority criterion. This disconfirms treating every missed day as a constant fraction of untreated-HIV lifetime harm. It does not endorse unsupervised interruptions or generalize to longer irregular gaps, different regimens, resistance, or unstable patients. The PubMed record links a correction; use the indexed current abstract, not unverified older tables.

**SMART Study Group, NEJM 2006.** [Primary report](https://www.nejm.org/doi/full/10.1056/NEJMoa062360). The strategy deferred/restarted ART around CD4 thresholds of 250 and 350; average follow-up was about 16 months. Opportunistic disease or death was 3.3 versus 1.3 events/100 person-years. This is a composite, not a mortality difference. Do not annualize that contrast into a one-week or one-month insurance gap, multiply by lifetime survival, or attribute all untreated exposure to PRC. The protocol and prolonged exposure differ materially.

**NIH adult ART guideline, interruption section.** [Official guidance](https://clinicalinfo.hiv.gov/en/guidelines/hiv-clinical-guidelines-adult-and-adolescent-arv/discontinuation-or-interruption-antiretroviral-therapy). Short interruptions are discussed as days to weeks; minimize their duration. Long-acting injectable gaps and HBV-active treatment have special risks and require separate modeling, not a universal oral-ART coefficient.

## Model that would become defensible

Use one additional resolved access episode, with all unsuccessful intake work included in cost. Measure actual dispensing and medication supply, then estimate the counterfactual *medication-free* interval after pharmacy, clinic, ADAP and other substitutes. Stratify stable suppressed adults from already viremic, low-CD4, resistant, HBV-coinfected and injectable-regimen clients.

`Q = funding_additionality × [incremental symptomatic episodes avoided × utility loss per episode × symptom-days/365 + independently modeled serious-event QALYs avoided − shared clinical harms] − donor-specific harms`.

An episode's symptom utility and duration are currently missing, as is the incremental episode risk for the actual local gap. Do not set them from the 9% A5345 frequency without a gap-matched comparator. No mortality or transmission credit in the core until separately justified. Transmission would require additional viremic exposure, contact patterns, partner susceptibility/PrEP and time-specific infectivity—not one infection for every rebound. Do not add transmission effects already credited to another program.

## Transparent magnitude check, not an estimate

At $100 donor cost, the $100,000/10-QALY threshold requires 0.01 additional QALY per funded episode. As an expressly hypothetical morbidity-only calculation, preventing symptoms in 10% of recipients, with a 0.20 utility decrement lasting 14 days, yields `0.10 × 0.20 × 14/365 = 0.0007671 Q`; at 50% funding additionality this becomes 0.0003836 Q. The threshold-compatible donor cost is then only $3.84; $100 costs about $2.61 million/10 QALYs. Neither symptom duration nor utility nor causal prevention probability is measured here. This calculation illustrates why short transient symptoms cannot carry a large claim; it is not a pessimistic bound on all possible HIV harms.

Null: existing temporary coverage or home supply prevents the lapse anyway. Harm: intervention delays faster clinical access or creates a donor-specific clinical burden. Reopen only upon evidence of a real, otherwise prolonged medication gap in a specified high-risk cohort, inexpensive resolution beyond existing funded commitments, and a health model matched to that duration and baseline disease state. Counting paperwork resolutions or dollars disbursed is insufficient.
