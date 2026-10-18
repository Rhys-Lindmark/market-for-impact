# Project Homeless Connect: proposed health/income calibration decision

October 1, 2026. **Retain the existing finite central clinical judgments; explicitly add provisional zero net-income central and independent signed income diagnostics.** Central marginal gift $100,000 produces **1.291308406850 Bay health QALYs + 0 income-equivalent years**, or **$774,408.34 per better life**. This is a proposed acceptance packet, not accepted/published recalibration, a probability-weighted expectation or a verified capacity offer. No product edits.

Read current `lib/phc-portfolio-model.mjs`, `data/san-francisco/phc-portfolio-model-v1.json`, `phc-v2-financials.json`, report/source packet and V2 handoff. Existing model tests freshly pass **4,506 checks**, including15scenarios and1,000finite parameter cases. This establishes arithmetic, not validity of allocation, clinical transfers or current post-cut operations.

## Clinical/source review

- [PHC Core Senses](https://www.projecthomelessconnect.org/programs/coresenses/), freshly reopened: one prescription pair annually at no cost, prescription required, monthly optical route; denture lottery; dental waiting list; Hearing and Speech Center partnership includes aids/batteries/follow-up and does not require insurance. These are service descriptions, not current completed counts or open marginal slots. Retain hearing-provider overlap warning: PHC and HSC cannot independently claim the same patient-year's whole clinical effect in an aggregate portfolio.
- [Griffiths Zambia primary study](https://pmc.ncbi.nlm.nih.gov/articles/PMC3944959/), fresh abstract/full-text XML obtained from [Europe PMC](https://www.ebi.ac.uk/europepmc/webservices/rest/PMC3944959/fullTextXML) after browser challenge:113refractive-error/presbyopia recruits,41treated/followed six months later; uncontrolled EQ-5D change .850→.925 under Zimbabwe preference weights. **.0375 remains a judgmental transfer**, not a measured half-causal-effect correction. 41/113 combines nonreceipt and missing outcomes; do not apply it again to a completed-treatment cost as a proven failure rate.
- [Mulrow hearing-aid randomized trial](https://pubmed.ncbi.nlm.nih.gov/2197909/), fresh primary abstract via Europe PMC:194older veterans,188completed; communication/social-emotional/depression scores improved. These scores are not utility and do not identify PHC .02.
- [Ye randomized economic hearing study](https://pubmed.ncbi.nlm.nih.gov/37306959/), fresh primary abstract via Europe PMC:385Chinese adults45+, .017QALY gain in a costing framework annualizing device purchase overNyears and reporting annual healthcare saving. The abstract does not fully resolve the integrated effect period or household/payer incidence. Do not transplant .017 as PHC's one-year effect, or annual healthcare saving as household cash. Retain .02utility×.6effective use as explicitly subjective.
- [Pearson randomized domiciliary denture study](https://www.nature.com/articles/bdj.2007.569), freshly reopened:133older edentate adults, immediate versus delayed care, oral daily-performance benefit. Not a preference-weighted QALY effect; retain .03utility as judgment, with zero/adverse tests. No nutrition-survival or employment multiplier.
- [DHCS vision coverage](https://www.dhcs.ca.gov/providers-partners/pharmacy-benefits-division-and-vision-care-program/medi-cal-vision-benefits/), freshly checked:full-scope coverage includes exams/glasses through participating providers and specified replacement. Formal coverage is not receipt, but no-gift publicly insured alternatives remain real.
- [Current DHCS dental-change FAQ](https://www.dhcs.ca.gov/services/medi-cal-dental-benefit-changes/medi-cal-dental-benefit-changes-frequently-asked-questions/), freshly checked:affected existing-member regular-dental loss delayed toJuly1,2027; new applicants afterJan1,2026, immigration and pregnancy/foster exceptions differ. Older officialPDFs still show2026. Do not treat all PHC patients as uninsured or infer a universal current coverage collapse.

No newly measured clinical coefficient warrants forced point-estimate change. Keep finite one-year benefits after care begins, delays and effective use; longer benefit is possible, but physical durability is not incremental effect duration when alternatives catch up. The current model's one-year ceiling is a judgment boundary, not observed retention or proof that all later benefit is zero.

## Legal/financial boundary and refreshed identities

PHC is a **project of Community Initiatives, EIN94-3255070**, sinceJuly2020, not a stand-alone sponsor-sized charity. [Native donation instructions](https://www.projecthomelessconnect.org/donate/) freshly confirm project-designated checks. Current fundraising examples ($100/two glassespairs; $1,000oralcare+dentures) are incomplete-cost examples, not actual household payments, completed-care invoices or an expansion offer. Its undated “privately funded” wording cannot erase historical city financing.

[Sponsor finance index](https://communityinitiatives.org/annual-reports/) still lists2025as latest published audit/990. Freshly opened its linked original2023/24/25returns and2024/25audits (2024audit also contains2023comparatives). Filenames are unreliable fiscal labels; read fiscal-end headings. Confirmed:

| Fiscal end June30 | Sponsor return revenue | Sponsor return expense | Sponsor audited expense | PHC whole actual expense |
| --- | ---: | ---: | ---: | --- |
| 2023 | $59,435,734 | $55,372,330 | $55,548,613 | Unknown |
| 2024 | $77,611,739 | $68,349,743 | $68,562,676 | Unknown |
| 2025 | $86,764,695 | $89,142,542 | $89,372,099 | Unknown |

Primary originals: [2023return](https://communityinitiatives.org/wp-content/uploads/2024/01/2022-Community-Initiatives-20230623-Public-Disclosure-Copy-signed.pdf), [2024return](https://communityinitiatives.org/wp-content/uploads/2025/02/CI-IRS-Form-990-FY24.pdf), [2025return](https://communityinitiatives.org/wp-content/uploads/2026/04/2025-Community-Initiatives-Public-Disclosure-Client-990-20260630.pdf), [2024audit](https://communityinitiatives.org/wp-content/uploads/2024/11/Community-Initiatives-2023-FS-AUDIT-FINAL.pdf), [2025audit](https://communityinitiatives.org/wp-content/uploads/2026/01/Community-Initiatives-2025-FS-AUDIT-FINAL-.pdf).

2025audited program$76,204,047 + administration$8,258,245 + fundraising$4,909,807 = $89,372,099. Difference from return expense$229,557 equals eventcost$112,370 + COGS$116,887 + donatedservices$300. This is presentation/accounting reconciliation, not omitted PHC spending. Audit total revenue/support$86,851,217 differs from return revenue; do not mix the two bases in ratios. 2024expense difference$212,933 is separately reconciled in returnScheduleD($207,433other adjustment + $5,500donatedservices). All sponsor-level context, **never PHC's cost denominator**.

Fresh2025audit identifies **$19,976PHC contributed goods**; it is not PHC's total budget or complete donated clinical-service value. The [2024HSHcontract packet](https://hsh.archive.sf.gov/wp-content/uploads/2024/04/Consent-Item-11.21-Community-Initiatives-PHC.pdf) was freshly reopened: retained FY2024–25contract budget$1,460,295,10.45FTE, salaries$760,732 + fringe$214,526 + operations$294,564 + indirect$190,473. This is a historical restricted-contract budget, not whole-project actual or extra-private-gift cost. [September5,2025sponsor update](https://communityinitiatives.org/blog/project-news-september-5-2025/) freshly confirms key funding loss/BridgeCampaign; it does not identify current replacement, cash balance or outstanding clinical tranche. Current website routes do not prove restoration or closure. No new project expense or unrestricted reserve fabricated.

## Proposed central health ledger: unchanged

Whole gift$100k, Bay.98/SF.95, discount3%, mortality hazard.02, independent harm0; retain55%cash for otherwise unquantified project work. Do not restrict numerator to the45%modeled clinical allocation.

| Path | Allocation; complete PHC cash/episode | Financial additionality/cap | Nonoverlap; without equivalent care | Utility/use/horizon/delay | Added completions; net UShealth |
| --- | --- | --- | --- | --- | --- |
| Glasses | .20; $150 | .5/100 | 1; .7 | .0375/.75/1yr/.1yr | 66.666667;1.260844034 |
| Hearing | .10; $1,500 | .5/5 | .8;.7 | .02/.6/1yr/.25yr | 3.333333;.018251571 |
| Dentures | .15; $1,500 | .5/8 | .8;.6 | .03/.7/1yr/.25yr | 5;.038566034 |

Procedure harms .0002/.001/.002QALY per additional completion remain charged before overlap/alternative filters. Clinical cash costs include navigation/failures/admin/sponsor charges; adding a standard sponsor fee again double counts. `alternative_free_share` means **without equivalent alternative**, not free-care users. Financial additionality governs gift→added completions; patient alternatives govern addedcompletion→incremental outcome. Do not apply the same public-access uncertainty twice.

UShealth1.317661639642;Bay1.291308406850;SF1.251778557660. Associated gross resource$140k givesBay$1,084,171.68. These outside partner/device/labor inputs are charged per nominal episode, including replacement activity, so this is **gross associated**, not measured net induced societal expenditure or public saving. Both cap and resource definitions must remain visible. Normalized price is not a promise a$774kextra gift buys10QALYs; original caps bind at$150kglasses/hearing and$160kdentures.

**Annual accounting:** PHC whole expense and annual completed cohort remain unknown. Do not create an annualPHC price from sponsor totals, the historical contract budget or the model's$100kextra gift. An annual comparison requires actual project ledger/output, without reapplying marginal financial response to already delivered activity. Current marginal costs/response are conditional priors, not an annual expense reconstruction.

## Net-income central and independently signed cases

Recommend **0net-income central**, explicit unidentified sign. Possible channels are avoided genuinely paid clinical purchases, navigation-related benefit receipt, productive visual/hearing correction, caregiver/time costs and acquisition burdens. Neither clinical retail value nor donated-service accounting is household income. Coverage may pay for care; recipients may otherwise forego it. Wages conditional on continued life/function can be distinct, but no ordinary baseline lifetime earnings or duplicated social-confidence/QALY bonus.

[THRIVEprimary randomized income trial](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0296115), freshly read:824Bangladesh adults35–65, previously never-glasses, sample enriched for near-vision-intensive work; median monthly income$47.1intervention versus$35.3control at8months (33.4%contrast); self-reported earnings, no localPHC cohort. This establishes a real earnings pathway, not a transportable33.4%PHC effect or statistical estimate of its employment share. Baseline$35.3/month must not become PHC's income. Current Medi-Cal access and PHC's mixed prescriptions/occupations differ sharply.

Use `.5×people×BayShare×log1p(netGain/baseline)`for one-year income-equivalent years; reference$50k is the project's crosswalk, not measured local income. Independent stress values below are **judgments**, not new recipient/spending observations:

| Case | Assumption | Income-equivalent years | Combined price |
| --- | --- | ---: | ---: |
| **Central** | Retained health; net income0 | 0 | **$774,408.34** |
| Household purchase stress | 5%of66.6667distinct additional glasses episodes would otherwise pay$50once; baseline$50k | .001632517211 | $773,430.54 |
| Functional earnings stress | 10%of46.6667otherwise-unmet glasses episodes gain5%annual conditional-alive earnings; baseline reference unchanged | .111566842067 | $712,821.76 |
| Acquisition burden | All73.3333nonoverlap added clinical episodes lose incremental$6once; baseline$50k | −.004312258741 | $777,003.10 |
| Health/harm null plus purchase stress | All clinical utility/harm0, cash diagnostic retained | .001632517211 | $612,550,969.41 |
| Full null | No nethealth orcash movement; gift stillspent | 0 | No positive price |

**Purchase$50 is a hypothetical stress, not a verified retail price**; PHC's$50-per-pair fundraising example is organizational support, not the household counterfactual. Allocate purchaser.05 outside glasses unmet.7, with shared cohort sum≤1; insured/other-free alternatives are not purchasers. Do not claim this partition empirically exists. Hearing/denture purchase credits remain0rather than fabricate larger costs. Earnings5%/subgroup10% are attenuated transport stresses, not causally estimated PHC parameters or a new beneficiary multiplier. Use the same fixed original completion count, disjoint source of household cash, and no compounded year-on-year growth. $6burden is a hypothetical acquisition/transaction amount, not an observed fare; count only extra cost compared with obtaining equivalent care elsewhere. Income afterloss must staypositive.

Required health-only signed sensitivities remain original: lowerallocation$3,097,633.36; financial additionality.1$3,872,041.70; rapidalternatives$6,127,231.83; limitedcapacity$5,043,653.38; favorable$38,284.44; cautious$597.33M; nofunding/nocapacity0health; signedutilitycase−.744986386133Bayhealth. Add zero each clinical pathway, halfutility/duration separately, incomezero/positive/adverse crossed independently with clinical signs. Jointnegativehealth+negativeincome has no positive price and keeps cost. Fundingnull cannot retain income from nonexistent additional completions.

Historical glasses-only$71,111.11was a program-conditional pair-purchasing model, not wholeprojectgift. Current$774,408.34is retained central, not a favorable-mixture expectation. Fresh evidence supports transparent judgment retention, **not forced improvement or worsening**. Publication acceptance requires independently checked income implementation, synchronized scope labels and source/parameter provenance; current capacity offer/giving recommendation remains unverified. No localQALYmeasurement is required merely to publish an honest estimate.

Actual research/calculation interval **2026-10-01 17:25:57–17:28:18UTC,2m21s,GPT-6.1Sol**, including initial skill/packet reading; memo drafting afterward excluded, no padded15minute claim. SpaceSaver/TokenSaver fully read/applied; checkout93MB/free28GiB, existingNode24runtime reused, primarytext fetched in memory, no installs/server/newagents/bulkdownload or product edits. Own only this decision memo; root owns acceptance/integration.
