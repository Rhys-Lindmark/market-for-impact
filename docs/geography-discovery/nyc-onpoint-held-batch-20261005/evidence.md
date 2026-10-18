# OnPoint NYC beta source map

Focused author start: 2026-10-05 T 03: 58: 47.925 Z. User-confirmed GPT-6.1 Sol assignment; no independent runtime metadata claimed. Space Saver: 28 GiB free, 190 MiB checkout; no install, copies, servers or checkout edits. Root manager owns acceptance and integration; no nested agents. Bounded phases: preserve alpha; verify sources; author signed model; deliver tests. All four completed in this packet, acceptance pending.

## Primary pages and table mapping

- https://onpointnyc.org/year-three-impact-report/ — overview states Nov 30,2023–Nov 29,2024. Highlight 434 intervention events and 25.3% depressant events involving naloxone. This is a provider activity claim, not additional deaths prevented. Website EMS denominator differs from explicit PDF.
- https://onpointnyc.org/wp-content/uploads/2026/09/OnPoint-NYC-Impact-Report-Year-3-web.pdf — printed 14–15: 13,887 all-program participants; 2,733 OPC participants; 61,876 visits.16–17: 2,127 wraparound participants.18: 294 buprenorphine-related service recipients, including screening/counseling, not 294 new sustained treatments.19: 143 wound-care participants and 616 visits.22–24: 434 interventions; unique rescue recipients unavailable.30–31:eight EMS activations across all visits, 99.987% visits without activation. Claimed $13 M saving uses $30,000 response assumption; no counterfactual EMS activation or realized household saving established. No activity count is equated with incremental clinical outcome.
- https://onpointnyc.org/ — service section verifies clinical, mental-health, food/hygiene, professional development and Bronx outreach; cumulative current milestones not annualized.
- https://onpointnyc.org/case-management/ — dedicated case-management paragraph states income-benefit, insurance, identification and housing assistance. No dollar benefit awards, income distribution, persistence or gift-sensitive incremental counts.
- https://www.nyc.gov/assets/doh/downloads/pdf/basas/opioid-settlement-funds-report-06032026.pdf — printed 1–4:public funding sustaining/expanding OnPoint wraparound; FY 26 quarterly harm-reduction participant/service counts and basic-needs counts; infrastructure support; alternative SSP list. Quarterly participant cohorts overlap and cannot be added to unique annual reach. The reported service counts establish delivery, not additional purchasing power or QALYs.
- https://www.nyc.gov/site/doh/health/health-topics/alcohol-and-drug-use-services.page — Naloxone, Drug Checking and Public Health Vending Machines sections establish free alternatives, operated by ACQC, SUS and VOCAL among others. Availability does not establish particular household replacement.
- https://pubmed.ncbi.nlm.nih.gov/31770391/ — abstract:observational adjusted mortality association in Vancouver, with residual confounding/generalizability limits. Not a New York causal effect or second mortality award.
- https://pubmed.ncbi.nlm.nih.gov/39104058/ and original DOI https://onlinelibrary.wiley.com/doi/10.1111/dar.13921 — Ontario aggregate controlled study; abstract indexed search, root separately retrieved original paper. Aggregate null does not prove zero individual effect; population dilution and slowing increase are possible. No numeric transfer coefficient recovered.
- https://coefficientgiving.org/research/cost-effectiveness/ — Economic benefits formula $50,000*N*ln(1+gain/baseline)*years; Health benefits $CG 100,000 per healthy year. Signed adaptation divides by 100,000, discounts each flow year and includes losses. This is a welfare comparison, not measured clinical QALYs. OnPoint household coefficients remain judgments.

## Financial verification boundary

Current https://projects.propublica.org/nonprofits/organizations/208672015 identifies On Point NYC Inc., EIN 20-8672015. FY 25 extraction:expenses $16,203,740, revenue $19,268,609, net assets $18,520,698; FY 24 expenses $15,432,498; FY 23$11,980,572. Extraction was refreshed onOct 5, not an independently accessed original return.

Original URLs preserved from September 14 alpha primary review:

- https://projects.propublica.org/nonprofits/full_text/202621359349304162/IRS990 — FY 25 Form 990 PartVIII grants; PartIX functional expenses; PartX cash/receivables; current review access blocked.
- https://projects.propublica.org/nonprofits/full_text/202621359349304162/IRS990ScheduleD — recognized expense reconciliation; fresh access blocked.
- https://projects.propublica.org/nonprofits/full_text/202621359349304162/IRS990ScheduleM —$336,016 donated drugs/medical supplies per inherited primary reading; does not by itself prove consumed noncash expense or cash-only cost.
- https://projects.propublica.org/nonprofits/full_text/202423619349300202/IRS990ScheduleO — inherited amended FY 23 perimeter/audit explanation.

Browser original iframe retrieval and shell XML endpoint returned security blocks; no claim of fresh original 990 reconciliation. Own https://onpointnyc.org/financials/ still links 2022 WHCP and 2020–21 audited statements. Original detailed amounts are preserved, dated as inherited, pending root review. No artificial three-year mean or noncash subtraction.

## Modeling decisions

Health assumptions unchanged so all six exact original alpha scenarios reproduce within 1 e-10. New signed branch assumes disjoint common-alive cohorts: 100 additional households gain $300 net consumption, 100 others lose $30, at $10,000 baseline resources for one year and 98% residency. These uncalibrated choices test a modest basic-needs purchasing-power pathway; alternative free access can make it zero. Additional exposure 100=400 eligible exposures*25% funding response is a judgment, not a finding. Use net household changes before logarithms; no service-value monetization or salary credit. Costs and gains remain when clinical mortality benefit is zero. Complete funding replacement is separately modeled as no additional exposure. Negative cash burden has no success/independence haircut; positive overlap factor is 1, with extra-survival income excluded structurally. No taxpayer saving appears in household welfare or recipient cost subtraction.

Tests:node 24 model.mjs --selftest reproduced original six scenarios; clinical-null retained both financial branches; negative financial-only/adverse and zero/unknown cases behaved correctly; invalid hazard and negative burden haircut rejected. No server/dependency generated.
