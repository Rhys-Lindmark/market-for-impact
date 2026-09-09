# Breathe California ordinary-gift revision
2026-09-08. Conditional research; independent acceptance pending. No Site edits, donations, outreach or new research-count entry. The token-saver skill kept work focused on recipient, marginal allocation and decision-changing clinical/resource evidence.

## Exact recipient and historical comparison
The recipient is **Breathe California of the Bay Area, Golden Gate, and Central Coast, EIN94-1156307**, at1469 Park Avenue, San Jose. The [official donation page](https://lungsrus.org/donate/) connects that address and lungsrus.org giving; the [primary municipal agreement](https://records.sanjoseca.gov/Contracts/CON667613-000.pdf), pp1–2, names the entity and EIN. The agreement is historical2022, not proof of present funding. Do not combine its assets/programs with Golden Gate Public Health Partnership EIN94-0836760 or Sacramento/Southern California affiliates. [The alliance has separate affiliates](https://www.breathecalifornia.org/).

Existing breathe-cea-v1 remains unchanged: cessation$533,333/10Q and child asthma$5,983,607/10Q are conditional selected-program prices, not unrestricted-gift prices or separate organizations. The old .5 lifetime QALY calibration is not carried into the new finite cessation model.

## Whole portfolio
The [organization describes](https://lungsrus.org/about-us/) cessation, asthma, sleep-apnea equipment, COPD, youth prevention, TB and clean-air work. Central marginal gift shares are15% cessation,25% all-age asthma,25% sleep-apnea equipment,10% senior/COPD,10% clean-air/policy/youth prevention,5% TB/other education and10% central management/fundraising. These sum100% but are explicit allocation priors, not audited functional shares or an earmarked gift. Only40% enters two clinical branches; the other60% stays in the numerator with no invented health. Adult asthma within its25% allocation also receives no extrapolated child-trial benefit.

Direct offer budgets$250 adult cessation and$1,200 all-age asthma include recruitment failures, branch staff, course/visit delivery and follow-up, but exclude the separately retained central10% overhead. They are not provider quotes. Repeat sessions within an adult course or2–3 home visits within an asthma episode are one person/episode, not new beneficiaries.

FYJune2025 [IRS-derived financial extract](https://projects.propublica.org/nonprofits/organizations/941156307) reports revenue$1,648,480, expenses$1,373,246, net assets$1,994,569, filedMay16,2026. Current raw filing/XML links failed retrieval; financial figures remain secondary context, not a primary functional-cost reconciliation or marginal gap. Other-year zeros in the extract are not treated as zero service. No affiliate totals are pooled.

## Current SF/Bay reach and funding baseline
The [county directory](https://lungsrus.org/county-resources/) says the office serves18counties and includes SF. Its geography is broader than the nine-county Bay Area. This establishes scope, not a current additional SF course, marginal caseload, funded-slot vacancy or future resident mix. The current website offers a [six-session cessation program](https://lungsrus.org/ash-kickers-smoking-cessation-program/) and [all-age asthma home visits](https://lungsrus.org/asthma/). We found no gift-ready next$100k budget or distinct-person queue.

[Kick It California](https://kickitca.org/faqs) supplies existing free counseling and conditional patch access. Insured clinical care, Medi-Cal and other providers are not erased. [DHCS's2026 payer transition](https://www.dhcs.ca.gov/wp-content/uploads/2025/10/Community-Supports-February-2025-Service-Definition-Updates.pdf), pp21–24, keeps asthma education/environmental assessment in APS; remediation supplies/modifications are distinct Community Supports. Coverage is not uptake, but philanthropy must not claim already-financed services automatically. Central financing additionality40% cessation/35% asthma is separate from marginal clinical benefit and later background quitting. Funding room stays unknown, not zero.

## Adult cessation: finite state model
Provider end-of-six-week tobacco-free claims are uncontrolled and are not sustained causal effects. Central extra six-month quit probability is3percentage points among all offered adult cigarette smokers versus actual care, a prior.60nominal adult offers ×40% funding additionality gives24incremental people ×.03=.72additional initial quitters. Starting at the six-month outcome state, one extra quitter replaces one current smoker; common later background quitting(.04/year) and relapse(.10/year) evolve both arms, with death absorbing.

The [Lung Health Study](https://pubmed.ncbi.nlm.nih.gov/15710956/) randomized a substantially more intensive intervention in5,887middle-aged adults with airway obstruction. Five-year sustained quitting was21.7%vs5.4%; mortality over14.5years was8.83vs10.38/1,000person-years. Those are intervention-arm outcomes, **not** conditional smoker/former-smoker hazards or effects for Breathe's course. They support the mechanism and finite timescale, not the chosen coefficients.

Central smoker/former mortality hazards .012/.008, utilities .75/.77 and10-year horizon are explicit local-transfer priors. For two calendar years after the initial quit state both states use .012mortality; afterward former smokers use .008. This coarse delayed-risk-recovery proxy does not accurately reset time-since-quitting for each later quit/relapse, and is a material model limitation. No effects before the six-month state are credited, and no tail after10years exists. The .5-year delay discounts outcomes once.

For living state difference x=(smoker,former), initially(-1,+1):
dxS/dt=-(smoker mortality+background quitting)xS+relapse*xQ;
dxQ/dt=background quitting*xS-(former mortality+relapse)xQ.
Integrate [.75*xS+.77*xQ]/1.03^t across the finite horizon, with mortality switching at the lag. The calculation counts survival and morbidity once; no separate lives-saved, cancer/COPD endpoint or lifetime multiplier is added. It uses RK4 with at least120steps/year and exact split at the recovery boundary, verified against an independent closed-form state propagation plus quadrature. Central 0.13002696366471556Q per extra initial quitter; 0.09361941383859519Q for this gift branch. No-mortality-advantage, high-relapse, fast-background-quitting, short-horizon and signed-effect scenarios expose the main structural assumptions.

## Child asthma: separate finite morbidity
The [Healthy Homes II randomized trial](https://pmc.ncbi.nlm.nih.gov/articles/PMC2810206/) found an incremental0.94symptom-free days per two weeks, annualized24.4, for nurse+CHW versus nurse support. This is not no-treatment comparison or a QALY measure. The [2024 Philadelphia trial](https://jamanetwork.com/journals/jamapediatrics/fullarticle/2825197) in626children found no overall between-group primary asthma-control advantage; the new packet includes an asthma-null case. Different interventions/settings prevent treating either as a direct Breathe effect.

$25k/$1,200 gives20.833all-age nominal episodes ×35% funding additionality=7.292incremental people. The60%child fraction is a prior, giving4.375children; adults retain costs and harm but no child benefit.24.4days ×50%local transfer /365 ×.1utility gap ×one finite discounted year produces 0.0032693006296660417Q per added child. Timing assumes this annualized symptom advantage is spread uniformly during the one-year window; no second year is credited. Clinical effect and utility are independently stress-tested. Adult cessation and child asthma patients are disjoint; family members may share households, but no caregiver/secondhand-smoke benefit is counted twice. Child survival change is excluded, and the one-year utility estimate is conditional on the child being alive during service.

## Costs, geography and harm
Gross associated resources=$100k+$100 per nominal cessation offer+$300 per nominal asthma episode=$112250. Outside medicine, clinician, remediation supply and other-provider resources exclude direct branch cash and central overhead. These are unpriced real-input allowances, not reimbursement, insurance or donation transfers. Outside resources for unquantified portfolio branches remain unmeasured; thus this is a partial associated-resource envelope, not complete net societal spending. No savings or costs of displaced later care are netted out. The donor-pays case moves outside expenses into unit cash cost once and reduces offers. Inputs need an itemized all-payer ledger before recommendation.

All modeled health is US. Central cessationBay/SF75%/5%, asthma80%/8% and independent harm80%/5% are separate future-residence priors, not population-stock ratios. SF nests inside Bay; Central Coast/outsideBay health can still count in US. No assumption says all service reaches SF. Non-US effects are excluded, not proved zero.

Signed extra quit and symptom-day effects allow worse outcomes. Shared losses are gift-datePV per added offer, including all-age asthma cases; independent gift harm is also gift-datePV and survives no incremental activity. Losses already reflected in utilities/state transitions must not be added as harm again. Nonpositive health yields no positive ratio, while signed Q and full gift cost remain.

## Results, not a threshold calibration
Central US/Bay/SF health: 0.10792260409338413/0.08165711258277754/0.005825225912312874Q.
Donor$/10Q: 9265899.469352242/12246330.642493377/171667161.93551975.
Central SF gross-associated$/10Q: 192696389.27262092.
Joint favorable US donor$142333.2883341567/10Q and SF$1172858.9553383137; these are scenarios, not probability intervals. No parameter was retuned to meet$100k or preserve historical ranking.

## Next evidence and reproducibility
First obtain a dated unrestricted deployment budget tied to EIN94-1156307: marginal allocations and shared costs, distinct adult/child counts by county, additional capacity versus funded alternatives, sustained quit outcomes among all enrollees, payer overlap and complete external resources. CPAP/seniors/clean-air work may matter materially but need their own causal models; zero credited health is not evidence of no benefit.

Run node /private/tmp/mfi-breathe-portfolio-tests.mjs. Calculator/model/report contain20identical scenarios. All finite bounds are computational validation limits, not confidence ranges or evidence for scaling a gift to$1b. Companion files are isolated in/private/tmp; no changes to historical programs or Site data.
