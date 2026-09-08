# Charlotte Maxwell Clinic: independent model audit

2026-09-08. Reviewed `/private/tmp/mfi-charlotte-maxwell-full-model-packet.md`, recalculated its scenarios and checked primary publisher/provider/payer sources. No Site changes. **Conditional acceptance with one material payer-source correction and minor scope/copy clarifications.** No numerical central correction required by the retrieved evidence.

## Accepted arithmetic

Formula `Q = a*(E*b*Y*t-h)` is dimensionally sound: pain points × utility/point × effective years = QALYs; transport and funding are dimensionless. Harm is in QALYs per genuinely added assigned course, so the shared additionality factor is appropriate for identical replacement.

| Scenario | Q per funded assigned course | USD per 10 incremental QALYs |
|---|---:|---:|
| Central | .0054 | 3,703,703.703704 |
| Favorable | .05344 | 112,275.449102 |
| Pessimistic positive | .0000375 | 800,000,000 |
| Harm stress | −.0021 | Net harm; no positive impact price |

Full-resource diagnostic $3,400 at the central denominator gives $6,296,296.296296/10Q. Cost identity 20×$90+$200=$2,000 and extra 20×.5hour×$80=$800 both reconcile. Null clinical effect, utility or additionality gives zero Q; do not divide by zero or rank a negative harm-case dollar ratio as attractive.

At favorable health/additionality inputs, the threshold cost is **$534.40/course** for exactly $100,000/10Q, not below it; strictly under the target requires strictly below $534.40. Central threshold cost is only $54/course. Neither is a verified available quote. $112,275 should not be rounded to an under-$100K claim.

## Material correction: adult acupuncture proposal was rejected in final budget

The [DHCS FY2026–27 Budget Act Highlights, July 20, 2026](https://www.dhcs.ca.gov/file/dhcs-fy-2026-27-budget-act-highlights/), PDF page6, explicitly lists the proposed optional adult acupuncture elimination among May proposals **not included** in the final budget. It states the budget does not eliminate the benefit. The packet's cautious “proposal is not enactment” principle is correct, but the proposal's ultimate status is now ascertainable and should replace the unresolved account.

Suggested wording: “California's final 2026–27 budget did not eliminate the optional adult Medi-Cal acupuncture benefit. Coverage indications, network availability, authorization, applicable visit limits and this patient's ability to access an equivalent course remain unverified. Care Plus supplemental benefits are product-specific.”

Do not infer either universal access or a universal uninsured gap. This audit does not independently confirm every provision of the separate Care Plus handbook; retain that original source with product/year specificity. No observed coefficient for funding additionality follows from benefit retention. The central .5 remains a judgment, not an inference from grant mix or insurance eligibility.

## Trial fidelity: sound endpoint, narrower eligibility needed

[2018 JAMA primary trial](https://jamanetwork.com/journals/jama/fullarticle/2687355), DOI10.1001/jama.2018.8907: the .96 adjusted worst-pain contrast versus waitlist and .92 versus sham are supported; the uncertainty about clinical importance is appropriately retained. The prespecified between-group two-point target was not reached. Grade1 bruising 47% versus25%, one grade2 presyncope in each needle arm and no reported grade3+ events are accurately represented. No generic-utility endpoint is established by those symptom findings. Keep the causal between-group contrast rather than within-arm improvement.

[2022 follow-up](https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2798317), DOI10.1001/jamanetworkopen.2022.41720: strict trial compatibility means postmenopausal women, stage1–3 disease, third-generation AI for at least30days and BPI worst-pain≥3. Replace broad “adult” eligibility with that definition or explicitly identify broader eligibility as a transfer. Eighteen sessions and later ten-session vouchers are verified. There were191 evaluable baseline/52-week pain records; the analysis used available assessments, not complete outcome recovery for all226 randomized. Missing-data risk persists, though another blanket completion multiplier would be inappropriate. The reported long-term contrasts and 12.1% overall AI discontinuation without an arm difference support the packet's boundary: no adherence-mediated survival benefit. This is one trial followed over time, not replication.

Direct PMC access produced challenges; primary publisher pages were readable and used instead. No challenge bypass was attempted.

## Utility and time: acceptable judgments, not validated conversion

The .02 utility-per-worst-pain-point parameter is explicitly unvalidated, and its uncertainty dominates. Worst pain is not average pain or a preference-based health state. The implied central pre-transport utility difference is .0192, favorable .0668: not mathematically impossible, but neither is empirically established in this population. Model these as narrow local linear assumptions, not portable 0–10-scale mappings. Retain b=0 and possible adverse outcomes; do not add stiffness, interference or analgesic benefits that describe overlapping health states.

Y=.75 already represents an integrated effect-year assumption. Clarify the separate roles to avoid double discounting: Y describes onset and persistence of symptom benefit; t describes how an equivalent delivered course transfers to the target population/protocol; a describes access added by this funding rather than alternatives. The packet currently lists counterfactual treatment in Y, comparator differences in t and alternative providers in a. That is not necessarily numerical double counting, but definitions should prevent applying the same alternative-care loss three times.

Favorable Y=1 is an upper-envelope sensitivity with effectively immediate full effect (or stronger interim effect compensating for ramp-up), not literal measured full-year utility. If the owner wants a simple six-week linear ramp then constant effect, Y=49/52=.9423077; the favorable ratio becomes about $119,149/10Q. This is an optional transparent timing variant, not a mandatory correction: the observed symptom trajectory need not equal that stylized ramp. Central need not change.

The additional two-session cost allowance is a conservative buffer, not an observed mean dose. Later receipt percentages are among observed follow-up respondents; do not portray 13.2%×10 as expected use over all assigned participants or a directly measured average number of extra visits. Existing cautions substantially address this.

## Local delivery and cost boundary

[CMC service page](https://charlottemaxwell.org/about-us/what-we-do/) supports Oakland acupuncture, licensed/certified volunteers, SF referring organizations, language assistance and rides. It does not confirm the specific AI-arthralgia protocol, available course capacity or the planned SF cohort. The program should be described as **an existing acupuncture provider assessed for a constructed trial-compatible course**, not an established named CMC protocol. Other integrative modalities and immune-system claims remain excluded.

[CMC 2024 impact report](https://charlottemaxwell.org/wp-content/uploads/2025/05/CMC-Impact-Report.pdf), financial page6, corroborates $556,497 revenue and the44/53/3 funding percentages. Aggregate outputs and grant mix do not identify a current restricted offer, procedure costs, payer split or additional delivery. The packet correctly avoids revenue-per-visit as a causal unit price.

The $2,000 cash ledger is coherent only if purchased coordination/space/supplies/supervision/travel exclude the donated clinical labor added in the $800 resource diagnostic. Avoid duplicate admin/overhead across the $90 allocations and $200 intake item. Patient travel expenditure inside donorC and patient time/travel opportunity cost are not automatically duplicates: cash transport expense versus uncompensated time can differ. Define the $600 as time plus unreimbursed out-of-pocket travel only, excluding transport already purchased by the program. SF-to-Oakland travel burden is an important unresolved dose/cost constraint.

The $3,400 figure is a **gross resource-use diagnostic per assigned course**, not a counterfactual incremental societal ICER. If half of care would happen elsewhere, full alternative-care resources should not silently be counted as newly consumed. A donor-cash metric can conservatively charge the full gift while giving no credit for replaced care; the packet already says this and should preserve that wording.

## Donor-useful acceptance statement

Accept the $3.70M conditional central as transparent analyst modeling, not measured CMC effectiveness. Correct final-budget status, trial subgroup and resource labels before publication. This is an evidenced modest symptom effect with uncertain preference-based utility, volunteer/cash costs, SF access and funding additionality. It does not demonstrate a sub-$100K donor opportunity or cancer-survival effect. A full report may responsibly show the constructed course if this conditional status is prominent; it should not imply current grant availability or deny other unmodeled patient-valued benefits.
