# Operation Access: ordinary whole-gift portfolio revision

September 9, 2026 UTC (September 8 local reporting context). Model `oa-whole-gift-finite-portfolio-v1`. Research packet only; no Site edits, count increase, outreach, slots or transactions.

## Outcome and historical comparison

Central national donor/resources cost per 10 QALYs: **$15,609,221 / $57,020,662**. Bay: **$26,015,369 / $95,034,437**; SF: **$195,115,266 / $712,758,277**. Geographic shares are weak priors, not measured county allocations. The joint favorable national donor case is $1,050,175; cautious assumptions produce harm. No parameter was retuned to preserve a threshold.

The prior selected SF abnormal-FIT model remains unchanged at `/private/tmp/mfi-oa-model.json` and in historical repository data. Its $600,000 donor and $1,012,000 expanded cost per 10 QALYs were conditional on one selected service, not an ordinary whole gift. This revision replaces that ranking interpretation if integrated; do not call the historical estimate whole-organization effectiveness.

This is a **whole-donor-cost, partial-health portfolio estimate**, not a complete estimate of every service's health. Leaving other outcomes unquantified can materially understate real value, but no formal upper bound on cost-effectiveness is claimed because unmodeled harms also exist. It is not observed OA effectiveness.

## Identity, portfolio and complete donor numerator

Ambulatory Surgery Access Coalition dba Operation Access, EIN94-3180356. [Official giving route](https://www.operationaccess.org/donate) verified without submitting the form. Current [patient eligibility](https://www.operationaccess.org/for-patients-para-pacientes) requires uninsured status and ineligibility for full-scope Medi-Cal, Medicare or CMSP, with an outpatient specialty need. OA is not insurance; eligibility does not establish a never-care counterfactual.

The [2025 audit](https://www.operationaccess.org/s/2025-Audited-Financial-Statements.pdf) records $22,876,888 total expense, $20,530,000 waived clinical charges and $89,922 other donated support. Subtraction yields $2,256,966 cash-like accrual expense, not cash flow; the annual report presents $2,256,967, an immaterial $1 difference. Functional expenses were visually verified. Waived charges are not economic opportunity cost.

The [annual report](https://www.operationaccess.org/s/Operation-Access-Annual-Report-2025.pdf), chart PDF7, records 1,529 services: GI575, general201, gynecology168, orthopedics/podiatry158, head/neck127, urology101, dermatology/plastic80, vascular58, ophthalmology45, other16. The all-function cash-like average is $1,476.11 per mixed service. These are not unique patients, positive-FIT cases, hernia counts, first-eye surgeries or SF counts.

Prospective cash allocations 37%,13%,11%,10%,8%,7%,5%,4%,3%,2% sum to one. They are loosely informed by service composition, not observed specialty cash spending. Specialty cash-per-service priors range $1,300–$1,800 centrally and include allocated all-function coordination, overhead and unsuccessful referral work. Do not subtract overhead again or multiply completed services by a navigation success rate.

Largest-funder loss and layoffs coexist with service/referral growth and other-donor growth. The [2026 budget](https://www.operationaccess.org/s/2026Budget-8pz4.pdf) plans $1.9M cash expense without a service target. Neither this plan nor sixteen months of operating cash measures marginal slots. Financing additionality .5 and a 100-service cap are explicit judgments, not offers.

## Health-bearing subsets and disjoint people

Only selected abnormal-FIT, function-limiting first-eye cataract and symptomatic-hernia subsets receive modeled health. All other specialty and nonselected service costs remain, with health unquantified.

For each subset, nominal services = gift × specialty allocation / all-function cost. Common activity factor = min(total nominal services × financing additionality, service cap) / total nominal services. Selected fractions are .5 of GI, .65 of ophthalmology and .45 of general surgery, all uncertain. Each is divided by 1.2 services per unique patient-episode, retaining service costs. An exclusive ledger assigns people to CRC first, then eye, then hernia with 1/.95/.90 disjoint fractions. These are planning allowances, not observed linked records. Repeats, second eyes and people in multiple pathways cannot each earn another full-person health award.

Central expected unique people are CRC5.506, eye0.429, hernia1.290. Net component QALYs are CRC−0.000258816, eye0.021343665, hernia0.042979846, summing to0.064064695. The small negative CRC component is preserved, not forced positive.

### Cataract and hernia: finite earlier-care symptom difference

For j=eye or hernia:

`Qgross/person = success_j × signedUtilityGain_j × (1+d)^(-delay_j) × F(catchup_j + loss_j + mortality_j + ln(1+d), H_j)`

`F(r,H)=(1−exp(−rH))/r`, with `F(0,H)=H`.

Successful symptom utility is lost when later comparator care catches up, benefit recurs/fails, death occurs, or the finite horizon is reached. Central horizon is three years from procedure, catchup hazard .7/year, delay .25year. These are priors, not observed wait distributions. The reported72-day referral-to-specialty appointment is not a no-gift waiting-time estimate.

The [first-eye cataract economic RCT](https://pmc.ncbi.nlm.nih.gov/articles/PMC2095519/) studied306women over70, comparing expedited with routine surgery. Its **.056 integrated first-year QALYs** are not an annual utility parameter. The .05 utility-point successful-person-year value here is an independent modest judgment, with .9 success and finite later-care/loss filters; the trial's .056 is not multiplied by three years. No extra fall-prevention gain is added.

The [hernia randomized trial](https://pubmed.ncbi.nlm.nih.gov/16418463/) studied minimally symptomatic men, with similar two-year pain/function outcomes and substantial crossover to later surgery. It does not validate positive QALYs for every hernia. The .04 utility gain and .85 success are independent priors only for the assumed pain-limiting subset. A minimally-symptomatic-null scenario sets utility to zero.

### CRC: finite survival hypothesis, not observational causal conversion

Let b=.025/year be baseline all-cause mortality; delta=.0006/year the signed additional fatal-hazard reduction if no later-care catchup; L=2years latency; A=5years differential hazard window; k=.5/year later-care catchup decay. For procedure-time t:

`Z(t) = delta × exp(−kL) × F(k, min(max(t−L,0), A))`

`S0(t)=exp(−bt); S1(t)=exp(−bt+Z(t))`

`Qgross/person = treatmentLinkage × survivingUtility × (1+d)^(-delay) × integral[0,H] (S1(t)−S0(t)) × (1+d)^(-t) dt`

H=10years, treatment linkage=.7 and surviving utility=.75. Baseline b already includes CRC mortality; no second mortality term is added. After A both arms return to common mortality, but any earlier survival difference persists only to H. Later ordinary care during latency reduces the contrast. This is an **aggregate mean-hazard approximation**, not an exact mixture over random individual care times or a validated cancer-stage simulation. Linkage represents whether necessary management can deliver this contrast; diagnosis alone earns no full treatment gain.

The [Zorzi cohort](https://pubmed.ncbi.nlm.nih.gov/33789965/) reports10-year CRC mortality6.8versus16per1,000. It is observational; nonprogram care, selection and timing biases remain, including the [methodological critique](https://pubmed.ncbi.nlm.nih.gov/37549982/). Delta was not inferred as.0092/10. Five hazard-years×.0006=.003 before catchup only illustrates magnitude relative to a larger association, not estimated attenuation. Latency, risk window and horizon are explicit clinical timing hypotheses. No separate adenoma, stage-specific morbidity or lifetime benefit is added.

The [navigation RCT](https://pmc.ncbi.nlm.nih.gov/articles/PMC13007779/) estimates offered-navigation completion, not benefit per completed OA service. Its13percentage-point effect is not multiplied here. Current [public coverage](https://www.dhcs.ca.gov/medi-cal/updates/medi-cal-changes/) and future safety-net care remain baseline.

## Harms, resources and geography

Per unique episode, gift-date PV acute/recovery/complication burden is eye.002, hernia.004 andCRC.001 QALYs, independent of clinical success or cancer linkage. These priors cover repeat procedures within the episode. A delayed no-gift procedure's burden is not subtracted, conservatively. Symptom utility is subsequent benefit, so acute burden is not already included in it. Independent harm persists with zero activity. Signed gains, benefit null with harms retained, and true all-health-null are distinct cases.

Gross-associated resources total **$365,301** centrally: $100,000 donor cash plus $234,803 clinical-resource allowance across **all nominal services**, $4,004 donated nonclinical support, $6,673 patient/caregiver time, and $19,821 expected downstream cancer management. These allowances are priors, not waived charges or provider quotes. They include uncredited/nonadditional activity; this is not net induced societal cost. No public reimbursement, donated retail value or future savings is subtracted. Future care may remain incomplete, so resources are not a proven exhaustive total.

Bay.6 andSF.08 are weak nested beneficiary-residence priors because specialty-specific county data were not verified. They are not office location, restricted allocation or regional clinical evidence. National means all-region direct health; no indirect local or international effect is credited. Local-zero and higher-local scenarios expose uncertainty. Signed local health is preserved.

## Verification and handoff

Pure calculator with bounds, stable finite integrals and23saved/report scenarios accompanies this review. Calculator suite **2,838 assertions PASS**; report/schema/saved-calculator parity suite **1,053 assertions PASS**. Tests check arithmetic and safeguards, not the truth of priors. Independent auditor is reviewing the full packet.

Cheap disconfirming checks: verify distinct symptomatic diagnoses and services per unique person; compare actual no-gift care delays with enabled timing; inspect specialty cash allocation and donated provider capacity; verify downstream management after abnormalFIT. Measurement of unquantified gynecologic, orthopedic and other health could materially revise the estimate. Lack of a bespoke donor offer is not why those benefits are withheld; this finite revision did not establish defensible bounded health bridges for them.

All75 numeric inputs, scenario ranges and provenance are in model/report. No recommendation or extra organization count is claimed. Historical selected-service files remain unchanged.
