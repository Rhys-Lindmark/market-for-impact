# Hearing and Speech Center: proposed health and income calibration

October 1, 2026. **Retain the conditional central $1,500 supported adult course, .012 health QALYs and explicitly judged zero net income: $1,250,000 donor cash per 10 combined welfare years.** Gross cash-plus-stock diagnostic remains $1,750,000. This is a source/calculation proposal for independent challenge, not accepted integration, an expected-value estimate, a current marginal offer or whole-organization impact. No product edits or publication.

Run identity: GPT-6.1 Sol, as designated in the delegated assignment. Actual work started **2026-10-01 18:29:08 UTC**; end recorded below. Space Saver and Token Saver applied: reused the existing checkout/model/audits; baseline workspace93MB, filesystem30GiB available; no installs, servers, retained bulk downloads or other agents. Initial git status was clean on `priority/recalibrate-in-depth-health-income`.

## Current identity and operations

Fresh [IRS bulk landing-page](https://www.irs.gov/charities-non-profits/tax-exempt-organization-search-bulk-data-downloads) labels are September8 revocations and September10 Publication78. Both ZIPs were downloaded into memory and exact EIN/full-name searched. Revocation record remains:

```text
941322198|HEARING AND SPEECH CENTER OF NORTHERN CALIFORNIA||1234 DIVISADERO ST|SAN FRANCISCO|CA|94115-3911|US|03|15-NOV-2025|10-MAR-2026|
```

The [IRS dictionary](https://www.irs.gov/pub/irs-tege/auto-revocation-data-dictionary.pdf), inherited from the September9 identity audit, maps the final fields to effective revocation, posting and reinstatement. Reinstatement is blank. No exact EIN or full-name match appears in freshly downloaded Pub78 or California BMF. The [BMF landing page](https://www.irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf) labels September8, but the California file's bytes/hash match the inherited August11 file; do not imply an updated HSC record merely from the landing label.

| Fresh download | Bytes | SHA-256 |
|---|---:|---|
| [Revocations](https://apps.irs.gov/pub/epostcard/data-download-revocation.zip) |47,561,205|`565b543f6cf31da7800749c068376c0d8a70f9ba86c243db801a722a75f6c3e7`|
| [Pub78](https://apps.irs.gov/pub/epostcard/data-download-pub78.zip) |29,928,640|`a587da65150da1d3fa8e0b86524376933ca95bcb71e53a68df2f11ca502c4796`|
| [CA BMF](https://www.irs.gov/pub/irs-soi/eo_ca.csv),202,765rows |35,138,893|`1b6a88df3f8cf70e7516f6d3537acaa77de8079dd3ded183b711d4f3bb458adf`|

These dated files do not establish closure, misconduct, dissolution or absence of later reinstatement. CA BMF follows filing address; an unidentified successor is not excluded by exact historical-name/EIN searches. Retain unresolved recipient status; no PHC substitution or sponsor assumption.

Fresh [CMS NPPES API](https://npiregistry.cms.hhs.gov/api/?number=1164577433&version=2.1) returns organization NPI1164577433, statusA, updated/certified June8,2026, Emily Smith CEO,433CaliforniaStreetSuite130. This supports clinical identity, not appointment availability or charitable eligibility. HSC's undated [audiology page](https://hearingspeech.org/services/audiology-services/) lists services; its [donation page](https://hearingspeech.org/donate/) permits program instructions but supplies no priced additional course. [Item donations](https://hearingspeech.org/donate/item-donations/) accept specified reusable behind-ear devices, without current stock/yield/capacity. No verified post-revocation successor, reinstatement or current completed-care cohort was located in this bounded check.

Fresh [PHC Core Senses](https://www.projecthomelessconnect.org/programs/coresenses/) describes HSC partnership, screening, indicated aids, batteries, support and follow-up without requiring insurance. These are descriptions, not current marginal capacity. Preserve ledger `phc-hsc-adult-hearing-aid-access`: an HSC/PHC patient-course produces one clinical and household-income stream. Standalone alternative assessments can each show the same pathway; a portfolio must allocate its benefit once. HSC and Community Initiatives financial entities remain separate.

## Three latest comparable financial years

The [IRS-derived filing directory](https://projects.propublica.org/nonprofits/organizations/941322198) presently lists FY2022 as newest. Search did not locate later original HSC accounts. Original Form990 reconstructions were fetched successfully with `curl --compressed` after browser-cache/XML routes failed. PartI revenue/expense, PartIX line25 functional totals and PartX net assets were checked directly; these are primary return contents hosted by ProPublica, not merely its summary extracts.

| Year ended June30 | Revenue | Whole expenses | Program expenses | Year-end net assets |
|---|---:|---:|---:|---:|
| [2022 original](https://projects.propublica.org/nonprofits/full_text/202301359349320515/IRS990) |1,784,277|2,316,008|1,708,165|1,995,646|
| [2021 original](https://projects.propublica.org/nonprofits/full_text/202211369349314371/IRS990) |2,492,144|2,352,018|1,464,698|2,527,377|
| [2020 original](https://projects.propublica.org/nonprofits/full_text/202131349349306533/IRS990) |2,246,227|2,713,993|1,999,855|2,141,226|

FY2022 PartIII audiology expenses **$473,752**, revenue$516,474; school and speech are separate programs. PartX assets$2,782,004/liabilities$786,358. Whole-expense three-year mean **$2,460,673** is nominal historical accounting, without inflation adjustment. It is neither a current funding shortfall nor marginal supported-course cost. No annual QALYs or income productivity ratio is defensible without corresponding completed cohorts and service mix. Sponsor-wide PHC accounts must not fill this gap.

Original decompressed HTML receipts: FY2022 504,935bytes SHA256`7eec771ca833cef5f17cbf924ce4ed19bd5ac4e1f099102e8e38e7245cff2fb1`; FY2021 515,009bytes `042c8cd6f5f0872576a10fb72fa4a93f35cc77bffb95acd19796331a0417cf63`; FY2020 518,485bytes `dc90de6bd6e49d456f030e6c52925f41153abf8c87d3cfcf38af18aa883e87e3`. No bulk source files retained.

## Clinical bridge and reconstruction

[Kaur2020 primary trial](https://link.springer.com/article/10.1186/s12913-020-05977-x) compares immediate fitting/rehabilitation with three-month delayed fitting in Singapore community centers. Analyzed groups264/163; reported increment **.12 HUI3 utility**, not .12QALYs. Control questionnaire omitted aid-use items. Participants were selected, willing adults with at least moderate loss, no recent aid use and no excluded ear complications. One-year reported use71.4% was among66% telephone respondents. Five-year persistence/utility was extrapolated. This supports a fitted-and-supported hearing mechanism, not local QALYs, earnings or imported ICER. Instrument sensitivity and local transfer remain serious uncertainties; retain the .01-utility pessimistic case and do not add cognition, mortality or social-health bonuses.

Existing `lib/hearing-access-model.mjs`, `data/san-francisco/hearing-access-cea-v2.json` and `docs/hearing-access-acceptance.md` recompute all seven inherited scenarios exactly. Central inputs are analyst judgments except external utility anchor:

```text
cash_components = {clinical_labor:600,refurbishment_molds:250,
 support_batteries_repairs:250,coordination_and_failures:200,
 facility_admin_contingency:200}; cash_cost_per_offer=1500
additional_resource_allowance=600
utility_increment=.12; local_transfer=.5; pre_fitting_completion=.8
funding_additionality=.5; discount_rate=.03
calendar_horizon_years=1; annual_incremental_benefit_fractions=[.515]
shared_pathway_harm_qaly_per_offer=0; donor_specific_harm_qaly_per_offer=0
supportBudgetCoversEntireCalendarWindow=true
E_health=.515/1.03=.5
H=a*(u*transfer*c*E_health-h_shared)-h_donor=.012
donor_price=10*1500/.012=1250000
gross_resource_price=10*(1500+600)/.012=1750000
```

Unit is an already clinically eligible, willing adult offered a supported course, one/both ears as indicated. Broad outreach/screening would require added costs. Funding additionality discounts financial replacement, while health exposure already accounts for ramp, nonuse, mortality and alternative-care catch-up. No extra retention or catch-up multiplier. Cash/support reserve is committed at time0, so no future-gift discount or free support extension. The .5 clinical-transfer factor is **not** geography, completion, income incidence or an extra funding haircut.

Fresh [DHCS adult FAQ](https://www.dhcs.ca.gov/services/hearing-aid-benefit-cap-benefits-frequently-asked-questions-for-members/) describes$1,510 fiscal-year cap with exemptions/medical-necessity approval, covered molds/initial batteries/fitting visits/repairs, and exclusion of adult replacement batteries. It also prohibits charging a beneficiary the balance above the cap for the same aid. This is a materially better baseline than assuming no publicly funded option; it does not identify this cohort's access or plan approvals. [Medicare](https://www.medicare.gov/coverage/hearing-aids) excludes aids/fitting in Original Medicare but notes possible Advantage benefits. [FDA OTC guidance](https://www.fda.gov/medical-devices/hearing-aids/otc-hearing-aids-what-you-should-know) applies to adult perceived mild/moderate loss, not severe/profound cases. Those alternatives belong in the counterfactual already represented by exposure; do not deduct them again without revising that profile.

## Net household income judgment and exact proposed wrapper

Recommend **zero central net income**, explicitly a provisional net judgment with unidentified sign, not a finding of no economic mechanism. Improved communication can enable work; genuinely avoided purchases can preserve disposable income; travel, attendance, missed work, maintenance and benefit withdrawal can offset gains. HUI3 already includes emotion and cognition: do not add a financial-distress or social-confidence utility bonus on top of its health effect. The income stream here values disposable resources only, with no extra mental-health credit. No current HSC household-income distribution, labor-force composition, purchase counterfactual or incremental burden is measured. Choosing a positive earnings magnitude centrally would require unsupported incidence and transport choices; choosing a compulsory negative burden is equally unsupported. Zero is the current declared center of those competing effects, not a statistically estimated expectation or permission to omit the economic ledger.

[Spreckley2020 primary Guatemala study](https://pmc.ncbi.nlm.nih.gov/articles/PMC7277678/) supplies a real economic signal: nonrandomized before/after hearing-aid provision with comparison subjects,135cases/89comparisons,6–9month follow-up. Case median household income490→506 versus comparison614→540; individual case income155→121 did not significantly improve. Paid/self-employed time increased. Comparison income decline, residual age confounding, subsidized-case selection and different labor/benefit markets limit causal/local transfer. Neither these medians nor the relative contrast becomes HSC's baseline or earnings coefficient. HSC's [financing page](https://hearingspeech.org/services/hearing-aids/hearing-aid-financing/) documents a paid commercial route, while [insurance/sliding scale information](https://hearingspeech.org/patient-resources/navigating-insurance/) documents alternative access. Neither establishes that recipients of the modeled charitable course otherwise purchase at retail.

The proposed current wrapper should retain the frozen health engine and add an independent signed income ledger. Apply the project's existing `.5*log(income ratio)` welfare crosswalk. **Y=$50,000 is a reference judgment, not measured recipient income.** Count one affected household per completed adult in these stresses, without adding household members/caregivers separately. Net gains mean after taxes, work/acquisition costs and benefits offsets; saving means genuinely counterfactual household expenditure, not donated-device retail value or public reimbursement.

```text
g_bay=1; g_sf=1; nonoverlap_share=1
# Conditional commissioning of SF-resident courses; not whole-HSC residence evidence.
n = funding_additionality * pre_fitting_completion * nonoverlap_share = .4
earnings_eligible_share=0; net_earnings_fraction=0             # central
income_calendar_years=1; income_annual_exposure_fractions=[.515]
E_income=.515/1.03=.5
acquisition_loss_USD=0; purchase_saving_share=0; purchase_saving_USD=0
baseline_household_income_USD=50000; receipt_delay_years=.25
receipt_factor=1.03**(-.25)=.9926375361451395
I_earn=.5*n*earnings_eligible_share*E_income*log1p(net_earnings_fraction)
I_purchase=.5*n*purchase_saving_share*receipt_factor*log1p(saving_USD/Y)
I_acquisition=.5*n*receipt_factor*log1p(-acquisition_loss_USD/Y)
I_local=g_local*(I_earn+I_purchase+I_acquisition)
T_local=H_local+I_local
price=10*cost/T_local if T_local>0 else null
```

The earnings schedule is a **separate judgment** about useful income-producing exposure and delayed equivalent care within one year, conditional on fitting; its numerical equality to health exposure is an explicit stress choice, not automatic reuse of health retention/mortality or clinical transfer. It can be changed independently. Earnings cease when equivalent hearing-enabled work catches up. `.25year` acquisition receipt is an illustrative timing judgment, not HSC measured delay; completion is defined as survival to fitting by then, so do not charge another survival-to-receipt multiplier. Once-only money events receive receipt discount, never the annual wear factor. Cash effects for genuine otherwise-purchasers can outlast clinical catch-up, so their profile must be specified independently; keep purchase inputs zero in the three proposed main diagnostics below until their incidence is known.

Standalone conditional geography credits SF/Bay residents only. A general HSC gift spanning Northern California needs measured residence/share before this geography can be generalized. Portfolio nonoverlap must be assigned once; apply it to the shared health and income streams, while independently attributable donor health harm persists even when funding additionality is zero. Additionality0 or completion0 yields no income from nonexistent additional fitted recipients. Do not add recipient acquisition loss to donor cash unless the donor reimburses it; such reimbursement then changes both ledgers consistently.

| Case; all unlisted inputs central | Health | Income-equivalent years | Total | Donor/10total | Gross resources/10total |
|---|---:|---:|---:|---:|---:|
| Central, net income0 |.012|0|.012|1,250,000|1,750,000|
| Earnings stress:10%of funded completions, net+5%, own E_income=.5 |.012|.0004879016416943202|.01248790164169432|1,201,162.57|1,681,627.59|
| Earnings loss stress:same incidence, net−5% |.012|−.0005129329438755054|.011487067056124494|1,305,816.35|1,828,142.89|
| Acquisition stress:$6 incremental loss per funded completion at.25year |.012|−.000023824730379897534|.011976175269620103|1,252,486.68|1,753,481.35|

These are independent judgments, not confidence bounds, observed wages/burdens or probability weights. Do not stack them silently. No commercial aid purchase or battery saving is assumed merely because the device was donated. If a future purchaser-only case is added, explicitly partition purchasers from otherwise-unmet care and remove their equivalent-alternative clinical exposure; do not assign their avoided expenditure and the full untreated clinical contrast to the same interval.

Required independent/null crossings: utility0 with positive earnings stress →H0/I.0004879016416943202, price$30,743,901.47 (resource$43,041,462.06); this represents functional income despite a null generic utility instrument, not evidence that aid-inactive recipients earn more. Full null health and income0 →T0/pricenull. Funding0 with acquisition/earnings incidence tied to completions →I0; donor cash remains1500. Existing independent donor health harm−.001 plus acquisition stress →T−.0010238247303798976/pricenull; shared harms cancel under identical funding replacement, independent donor harm does not. Income fractions must be finite and greater than−1; Y>0; loss<Y; shares in[0,1]; no positive price for T≤0.

Inherited clinical sensitivities remain unchanged: favorable four-calendar-year support stress E2,u.12,transfer.75,c.9,a.75,cost900 →H.1215/$74,074.07 donor/$123,456.79 resources; pessimistic one-year E.25,u.01,transfer.5,c.5,a.25,cost2500 →H.00015625/$160M/$224M. Favorable reserve$150 must cover all four calendar years; this is optimistic and unverified, not duration padding or central evidence. Also preserve halfutility and halfhealth-duration separately (each H.006/$2.5M with income0), nofunding, shared-harm cancellation and independent-harm persistence. Altering health utility must not silently turn off separately parameterized economic effects; changing useful-function exposure can legitimately change their own schedule.

## Proposed decision and gaps

Accept for independent challenge: retain clinical priors and conditional marginal scope; add explicit central0 and the signed income inputs above; refresh recipient/financial source dates. Do not force a price change, introduce a whole-organization claim, convert old accounts into current room for funding, or publish a direct-giving endorsement. The financial deficit establishes historical accounting, not a verified unfunded tranche or donation additionality. No sponsor funds are treated as HSC expenses, and recipient burdens stay outside donor budget.

Decisive gaps are reinstatement/authorized successor recipient; current whole/program accounts; unique supported adult completions, residence and unfunded capacity; cost payer split across HSC/PHC/insurance; actual without-gift fitting delay; longitudinal useful use/utility; and net household income, purchaser incidence, time burdens and benefits offsets. A measured local QALY study is not required to publish transparent conditional judgment, but these gaps prevent presenting its price as verified donor productivity. Parent owns independent arithmetic/causal challenge and integration.

End UTC: **2026-10-01 18:38:04 UTC** (8 minutes 56 seconds dedicated bounded review; earlier research remains separately recorded/partial). Final workspace93MB/free30GiB; no disposable bulk files retained or cleanup needed.
