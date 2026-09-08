# FCA: exploratory Powerful Tools caregiver course model

Research packet, 2026-09-08. **Illustrative central donor cost ≈$3.2 million per10 incremental caregiver QALYs; favorable≈$111,000; pessimistic≈$800 million; null/harm allowed.** This is a judgmental utility bridge for a real advertised course, not measured FCA cost-effectiveness or a verified funding offer. No Site edits or outreach.

## Actual local service and recipient

Family Caregiver Alliance, EIN94-2687079; primary identity corroborated by its [2022 Form990](https://docs.candid.org/edoc/11286524/document.pdf). Bay Area Caregiver Resource Center is its program, not a separate charity. [FCA course page](https://www.caregiver.org/connecting-caregivers/events-classes/powerful-tools-for-caregivers/) explicitly advertises free six-week Powerful Tools for Caregivers (PTC), once weekly, and warns that not all classes are offered every season. [Bay Area CRC](https://www.caregiver.org/connecting-caregivers/bay-area-caregiver-center/) verifies SF-inclusive service and caregiver counseling/respite eligibility. Neither page establishes a September2026 available seat or restricted donation price.

Historical delivery confirmation: indexed primary text of [FCA July2024 provider newsletter](https://myemail.constantcontact.com/Provider-E-News-Update---July-2024.html?aid=nsPOf1Pbbyo&soid=1101399948055) lists six Fridays,2024-09-13 through10-18,9:30–11am. Full-page retrieval failed. That is a **90-minute class**, whereas the trial below uses120minutes. Do not claim exact protocol fidelity from the shared name. SF-only enrollment, dementia-specific eligibility and current group size remain unknown. Restrict the proposed modeled cohort to SF caregivers of people with dementia to reduce population mismatch; that restriction is analyst-defined, not advertised as an existing exclusive cohort.

Chosen unit: **one enrolled SF caregiver offered a six-session group self-care/coping course**, not one completer, one referral, one respite hour or a whole family lifetime. Implementation would require confirming a new class or demonstrable access bottleneck.

## Primary effectiveness and utility evidence

### Direct PTC causal evidence

[Terracciano etal, JAMDA2020, DOI10.1016/j.jamda.2019.11.011](https://pubmed.ncbi.nlm.nih.gov/31866419/), [primary article](https://pmc.ncbi.nlm.nih.gov/articles/PMC7302999/): pragmatic two-arm randomized trial versus usual care;60baseline participants,55postintervention and44at six-week follow-up. Intervention: six weekly two-hour groups with two trained/certified leaders. ITT standardized effects were−0.48caregiver burden,−0.53depressive symptoms and+0.68self-confidence. No significant benefit for care-recipient behavioral/psychological symptoms.94%completed at least four classes. This is a small, short-follow-up trial; it supplies **no preference-based QALY estimate**. Do not transform CES-D points or standardized effects directly into QALYs. PubMed abstract was readable; PMC full-text retrieval failed in this pass, so avoid claims requiring unchecked tables. Earlier large before/after PTC studies are not substitutes for randomized effects.

### External utility benchmark, not PTC evidence

[START NIHR2014 scientific summary](https://www.ncbi.nlm.nih.gov/books/n/ukhta1861/abs3/):260carers randomized to eight-session individual coping intervention or usual care; EQ-5D with societal weights. [Results](https://www.ncbi.nlm.nih.gov/books/NBK262909/) and [author-hosted Table15](https://openaccess.city.ac.uk/id/eprint/16420/1/Livingston%20et%20al.%2C%202014_START_HTA%20report.pdf):24-month incremental caregiver QALYs0.03(95%CI−0.01to0.06), complete cost/QALY sample144; incremental health/social-care cost£336(2009–10prices;CI−£223to£895);£11,200/QALY.24-month analysis uses3.5%discounting. These are UK system costs, not SF delivery prices. The utility gain is imprecise and is **not0.03per year**. Eight-month results and their more favorable cost-effectiveness probabilities must not be labeled24-month results. START is not PTC; the transfer below is subjective.

## Public payer and marginal baseline

[FCA finances/funders](https://www.caregiver.org/about-fca/finances-grants-awards/?via=about-fc) lists California Department of Aging, area agencies and SFHSA among contract funders, alongside private gifts. Free-at-point-of-use therefore does not mean unfunded. [California FCSP](https://www.aging.ca.gov/Providers_and_Partners/Area_Agencies_on_Aging/Family_Caregiver_Support/) describes Older Americans Act financing through AAAs. A general donation supports FCA, not a documented incremental PTC class.

Concrete current public overlap: [SFHSA June3,2026 commission memorandum](https://www.sfhsa.org/es/sites/default/files/media/document/2026-05/family_caregiver_alliance_temporary_respite_care_fy26-30.pdf) requests a temporary-respite grant7/1/2026–6/30/2030:base$3,453,460,$863,365annually,plus10%contingency$345,346,totalceiling$3,798,806;county funding. Frozen Controller contract1000038672 matches this ceiling/term. **This is respite, not a PTC course budget.** Neither unused authority nor zero snapshot payments is philanthropic room. Do not divide its budget by PTC students; do not add funded respite to the model as a free resource without checking actual incremental use. The memo is an authorization request, with frozen contract record corroboration, not proof all money has been spent.

## Cost construction: explicit judgments, no provider quote

Model2026USD, full new-course delivery cost borne by donor. Central course budget$6,000for10enrolled caregivers:

-24facilitator delivery hours=2leaders×6sessions×2hours. This budgets trial-dose delivery; actual FCA90-minute version would use18hours and must have its own fidelity assessment.
-12preparation/training-amortization hours+6intake hours+6coordination hours=24additional hours.
-48totalstaffhours×$100loaded hourly cost=$4,800; **hourly cost is analyst judgment**.
-Additional$1,200for licensing/materials, space/technology, language/access and attendance support. This is a placeholder, not a validated adequacy claim; cost more if translation or respite is needed.
-$6,000/10=$600per **enrolled** caregiver; all costs retained for dropout/nonresponse. No organization-budget/client ratio.

Favorable$5,000/20=$250per enrollee; pessimistic$9,000/6=$1,500. These are scenario budgets, not observed costs. Amortized training may be too low for a single startup class; confirm actual trainer licensing and staff capacity before making a gift recommendation.

Broader full-resource comparison adds illustrative caregiver time:12hours×$25=$300per enrollee. Thus costs$900central,$550favorable,$1,800pessimistic. Both hours/time valuation are judgments; using full attendance conservatively counts attendance failures as fully consuming caregiver time. Transport/replacement care beyond the allowance, marginal downstream healthcare costs and participant out-of-pocket costs remain unpriced. This is an **expanded-resource illustration, not a complete societal CEA**. Claim no medical savings or avoided nursing-home benefit.

## Implementable assumptions and formulas

```json
{
  "unit": "one enrolled SF dementia caregiver offered a six-session PTC course",
  "currencyYear": "illustrative USD 2026",
  "effectAnchor": {"qaly": 0.03, "months": 24, "source": "START, not PTC", "ci": [-0.01, 0.06]},
  "central": {"donorCost": 600, "expandedCost": 900, "protocolPopulationTransfer": 0.5, "retainedIntegralFraction": 0.25, "fundingAdditionality": 0.5},
  "favorable": {"donorCost": 250, "expandedCost": 550, "protocolPopulationTransfer": 1, "retainedIntegralFraction": 1, "fundingAdditionality": 0.75},
  "pessimistic": {"donorCost": 1500, "expandedCost": 1800, "protocolPopulationTransfer": 0.1, "retainedIntegralFraction": 0.0625, "fundingAdditionality": 0.1},
  "null": {"setAnyEffectOrAdditionalityFactorToZero": true},
  "harm": {"effectAnchorQaly": -0.01, "otherInputs": "central"},
  "roomForFundingUsd": null,
  "verifiedRestrictedOffer": false
}
```

`incrementalQ = anchorQ * protocolPopulationTransfer * retainedIntegralFraction * fundingAdditionality`

`donorUsdPer10Q = 10 * donorCost / incrementalQ`, only whenincrementalQ>0. Use null/dominated labels atQ<=0; never show a negative dollar ratio as attractive.

**Factor meanings:** transfer captures clinical/protocol/population mismatch, not financing; retained-integral fraction captures durability mismatch; funding additionality is the proportion of modeled health that the new gift creates beyond already-funded classes and substitute care. They are all judgments. Central0.25retained fraction could be pictured as six months of a flat24-month benefit, but that is only an accounting illustration: START did not show a flat profile, and six-month PTC persistence is not established by this short trial. Favorable assumes full START-equivalent integrated benefit and is intentionally weakly supported. Do not multiply again by24months or another utility. No extra completion multiplier: trial anchors are allocation-based, and costs already include unsuccessful enrollment; worsened local engagement belongs in transfer unless an explicit relative-uptake model replaces it.

| Scenario | Incremental Q per enrollee | Donor$/10Q | Expanded-resource$/10Q |
|---|---:|---:|---:|
| Central |0.001875|$3,200,000|$4,800,000|
| Favorable |0.0225|$111,111|$244,444|
| Pessimistic |0.00001875|$800,000,000|$960,000,000|
| Null |0|No finite estimate|No finite estimate|
| Harm,−0.01anchorwithcentralfactors |−0.000625|Costly and health-worsening|Costly and health-worsening|

These are deliberately wide illustrative scenarios, not confidence intervals or posterior probabilities. AnchorCI includesnull/harm even before protocol transfer. Rounded public copy should say$3.2M/$111K/$800M, not imply precise estimation.

## Threshold and decisive tests

Under$100K/10Q requires `cost < 10000 * incrementalQ`. At central assumptions this is **under$18.75per enrollee**. Even granting the full0.03anchor with100%additionality, $600cost yields$200K/10Q. At favorable0.0225Q the allowable cost is$225, slightly below the chosen$250. There is no need to force an under-threshold scenario. Cheaper genuinely additional seats might change the conclusion, but only if class capacity and utility durability support it.

Before accepting beyond an exploratory ranking: verify next class/date, actual90/120-minute curriculum and trained leaders; obtain program-specific cost/enrollment and capacity; establish how gift-funded students differ from students who receive the same free course anyway; test preference-based caregiver utility and persistence; measure dropped/failed enrollments; check whether class participation requires paid respite already funded by the county. Collect baseline distress and care-recipient diagnosis, without assuming only distressed enrollees accrue the trial-average effect. Count caregiver QALYs once if the same person receives IOA/FCA/other support. No care-recipientQALYs, survival, earnings, housing-retention or nursing-home offsets in this model.

**Readiness:** model-ready as an explicitly low-confidence, external-utility-anchored illustration; **not** a program-matched measured QALY estimate and **not** a donation-ready opportunity. The direct PTC trial is stronger evidence than generic respite benefit claims, but utility transfer and marginal capacity dominate the uncertainty.
