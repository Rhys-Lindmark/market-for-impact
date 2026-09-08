# SFFC Shingrix implementation audit — 2026-09-07

## Acceptance decision

Accept .005392 as a published modeled net lifetime QALY increment for vaccination initiated at age70, NOT a directly observed treatment effect or a completed-series QALY estimate. Reject 07's $50/$20 donation scenarios as implementation-ready until inventory cash and completion are explicit. Proposed replacement central standalone tranche: about $1.955M/10Q, favorable $92.6K, unfavorable $121.2M. These remain judgments about an UNVERIFIED SFFC expansion, not a funding offer. Keep old 07 estimates only as administration-only illustrative comparisons.

## Reverified primary sources and meaning

1. [2019 primary Markov CEA](https://pmc.ncbi.nlm.nih.gov/articles/PMC6602903/) (full methods/Table1/Table2 directly inspected): immunocompetent US adults, sex pooled, annual cycles to age100; 2011 mortality tables, lifetime health/costs discounted3%. Table2 net incremental QALYs versus NO vaccination are .001220 age50, .003052 age60, .005392 age70. Complications/PHN/death and vaccine adverse effects included; no separate mortality/pain bonus. Total-vaccinated-cohort efficacy incorporates95.5% second-dose completion. Model assumes linear5.44 percentage-point/year waning after two doses and8points after one; not current empirical durability. Original acquisition cost$204.38/BOTH doses is historical contract cost, not2026 retail. Societal ICER includes healthcare/productivity offsets; Q denominator can be reused conditionally, net societal cost cannot become donor cost. One author disclosed GSK advisory work; do not describe authors as uniformly industry-independent.

2. [2025 final ZOE-LTFU primary publication](https://www.sciencedirect.com/science/article/pii/S2589537025001737), [PubMed](https://pubmed.ncbi.nlm.nih.gov/40630610/): newer long-term evidence exists, through11years. Extension is open-label, not simply an11year placebo RCT. The old CEA is therefore an inspectable benchmark, NOT latest-model truth. Updating waning requires rerunning disease/utility states, not multiplying QALYs by a new efficacy ratio. This audit did not reconstruct that Markov model.

3. [Current GSKPAP rules](https://gskpaf.org/gsk/vaccines-patient-assistance/), [currently linked April2024 application, page1](https://gskpaf.org/content/dam/brs-pharma-us/gskpaf-v2/en_US/pdfs/GSK-PAP-Vaccine-English.pdf): provider registration/approval, uninsured eligibility and no Medicare; purchased vaccine first, in-kind replenishment in10-dose batches; minimum10 approved doses within12months or forfeiture;200 doses/product/site/year ceiling. No GSK administration payment and provider cannot bill public payer for administration. Verify both eligibility page and form at implementation, since form mentions coverage fields that do not override explicit eligibility exclusion.

4. [Manufacturer English2026 price](https://gskforyou.com/gsk-pricing-information/shingrix/): $234.69/dose list price, not clinic quote. Do not use stale Spanish price on same page.

5. [SFFC generic vaccination service](https://sffc.org/primary-care) is verified; [sample progress note](https://sffc.org/samplenote) is educational, not delivered shingles-dose evidence. No verified local Shingrix stock, PAP membership, eligible age70 cohort or incremental funding gap.

## Health/completion design

Best eventual design: retrieve/reconstruct published separate one-dose and two-dose disease/AE streams; model intervention and usual-care timing separately. Until then, use the explicit conservative COMPLETED-COURSE PROXY below, not a false exact reweighting of the published net result.

For each actual initiation, credit the published mixed-completion Q only if a second dose is completed. Give no disease-prevention credit to incomplete courses and charge their first-dose adverse burden separately. This intentionally understates partial protection and retains a small embedded source-completion penalty: .005392 is NOT divided by .955 to pretend it is an exact full-course effect. It is a pragmatic conservative convention, not a proven mathematical lower bound under every patient mix. Use no additional .955 multiplier or raw engagement multiplier. Clinical-transfer parameter EXCLUDES completion; it reflects different morbidity/survival and uncertainty in imported health trajectory. Do not also subtract complete-course vaccine harms already included in the source net Q.

First-dose net harm .001 central/unfavorable and .0005 favorable are JUDGMENTS, oriented to the source's common-reaction utility-loss parameter, not source-estimated net one-dose Q. Full sensitivity should allow partial-course positive benefit and zero/negative overall gains. The shortcut cannot estimate the incremental value of ONLY recalling dose2 among already vaccinated people; such a model needs Q(two doses) minus Q(one dose).

Counterfactual factor represents the fraction of full no-vaccine-comparator benefit actually attributable to the tranche. Decompose as p(no vaccine without gift) + p(vaccine later without gift)×relative timing gain; people vaccinated at the same time elsewhere contribute zero. Conditional samples should exclude already vaccinated people before initiation, but costs of finding ineligible people belong in outreach/admin cost. Do not multiply an extra funding-displacement factor if this counterfactual already incorporates financing replacement. If comparing treatment/control arms explicitly, subtract outcomes and remove this scalar entirely.

## JSON-shaped source/assumption brief

```json
{
  "id": "sffc-shingrix-pap-exploratory-v2",
  "verifiedLocalProductDelivery": false,
  "verifiedMarginalOffer": false,
  "unit": "one finite annual cohort of actual first-dose initiations",
  "costPerspective": "gross donor cash; no terminal-stock salvage or payer savings",
  "healthPerspective": "discounted patient lifetime QALYs imported from published CEA",
  "healthBenchmark": {
    "age50": 0.001220,
    "age60": 0.003052,
    "age70": 0.005392,
    "sourceSecondDoseCompletion": 0.955,
    "discountRate": 0.03,
    "horizonTerminalAge": 100,
    "alreadyIncludesVaccineHarms": true,
    "alreadyIncludesHospitalDeathAndPain": true
  },
  "papRules": {
    "batchSize": 10,
    "annualSiteProductCap": 200,
    "replenishmentDeadlineMonths": 12,
    "reimbursementType": "in-kind, not cash",
    "priorPurchasedStockRequired": true
  },
  "priceAnchor": {
    "usdPerDose": 234.69,
    "type": "2026 manufacturer list-price proxy, not SFFC acquisition quote"
  },
  "centralJudgments": {
    "initiators": 20,
    "completedSeries": 16,
    "benchmarkAge": 70,
    "clinicalTransferExcludingCompletion": 0.75,
    "counterfactualBenefitShare": 0.5,
    "netQalyHarmPerIncompleteInitiation": 0.001,
    "purchasedSeedDoses": 20,
    "paidAdministrationPerDose": 15,
    "paidNavigationPerInitiator": 20,
    "fixedSetupCash": 300,
    "wastedDoses": 0,
    "approvedEligibleDoses": 36,
    "papDosesAlreadyUsedByOtherPatientsAtSite": 0,
    "cashTerminalInventoryCredit": 0,
    "incrementalClinicalCostsPaidElsewhere": "unquantified; disclose, not zero"
  },
  "formulas": {
    "administeredDoses": "initiators + completedSeries",
    "eligibleReplenishment": "min(10*floor(approvedEligibleDoses/10), 10*floor(max(0,200-papDosesAlreadyUsedByOtherPatientsAtSite)/10))",
    "terminalInventory": "initialExistingStock + purchasedDoses + replenishmentReceived - administeredDoses - wastedDoses",
    "donorCash": "purchasedDoses*price + administeredDoses*paidAdministrationPerDose + initiators*paidNavigationPerInitiator + fixedSetupCash + otherCashCosts - actualCashRefunds",
    "cohortQ": "(completedSeries*sourceNetQ*clinicalTransferExcludingCompletion - (initiators-completedSeries)*netQalyHarmPerIncompleteInitiation)*counterfactualBenefitShare - extraUnmodeledNetHarm",
    "usdPer10Q": "Q>0 ? 10*donorCash/Q : null",
    "thresholdCost": "10000*max(0,Q)"
  }
}
```

Use integer dose/person counts, NOT floor(expected fractional patients) in a stochastic model. For uncertain completion simulate integer outcomes or sum probabilities; source PAP batches make costs nonlinear. All local scenario inputs are subjective unless explicitly sourced. Othercash includes failed screenings/applications, disposal, cold-chain, delivery, additional clinical supervision and financing if not captured by above allowances. Missing them must be disclosed.

## Inventory algorithm and terminal-stock correction

`eligibleReplenishment` is a YEAR-END eligibility ceiling, not proof of receipts or adequate intrayear stock. Track dated administrations, approvals, shipments and expiration. Before each administration require usable inventory≥1; if not, buy or delay. Add shipments only on receipt. Preserve the existing site's remaining200-dose cap and any batches already committed to other patients. Do not claim a donor caused benefits just because its patients completed a batch that existing patients would have filled anyway.

Scenarios below assume all credited shipments arrive by tranche end and sufficient cadence/stock to avoid interruption. Twenty seed doses centrally is a chosen buffer, NOT a GSK purchase minimum. Favorable10 assumes prompt turnover; additional working capital can remove its apparent threshold pass. Negative inventory is an implementation error, not permission to vaccinate without stock.

PAP shipment is inventory, never a cash refund. For a standalone finite donor tranche, count all purchased seed stock and assign NO future Q to end stock. An accounting sensitivity can value usable terminal inventory, but that is a capital asset/salvage estimate, not money returned to donor. If later cohorts use that stock, extend cohort/Q/cost boundaries together and avoid charging initial capital twice. At steady state with existing adequate float, a different marginal tranche may need no new seed purchase; label the supplied capital and do not represent that result as standalone launch cost. Value all administered vaccine and donated labor separately in a total-resource analysis; list price is only an illustrative resource-value proxy, not actual manufacturing opportunity cost.

## Checked scenarios

| Input/output | Favorable | Central | Unfavorable |
|---|---:|---:|---:|
| Initiators / completed | 100 / 95 | 20 / 16 | 4 / 2 |
| Benchmark age/Q |70 / .005392|70 / .005392|60 / .003052|
| Clinical transfer excluding completion | .9 | .75 | .5 |
| Counterfactual share | .9 | .5 | .25 |
| Incomplete-course harm | .0005 | .001 | .001 |
| Administered doses |195|36|6|
| Purchased float doses |10|20|10|
| Replenishment received |190|30|0|
| Terminal doses, not cash |5|14|4|
| Paid admin per dose |$5|$15|$30|
| Navigation per starter |$5|$20|$40|
| Setup |$0|$300|$500|
| Donor cash |$3,821.90|$5,933.80|$3,186.90|
| Cohort Q |.4126644|.030352|.000263|
| Dollars/10Q |$92,615|$1,954,995|$121,174,905|

The favorable case uses 100 eligible age70 starts at one site, unused PAP cap, almost complete courses, 90% counterfactual attribution, donated/shared labor and rapid supply turnover. This is aggressive and unverified, NOT an endorsed offer. Its threshold maximum cash is $4,126.64: only $304.74 headroom. Two additional purchased buffer doses at list price would break the threshold. Central requires cash below $303.52 for its entire20-person cohort to pass, versus $5,933.80 modeled. Unfavorable intentionally illustrates failed batch economics; unused purchased doses are not counted as health.

Null/harm: when counterfactual share=0, Q=0 even if injections occur; no finite positive ratio. If expected vaccine harms exceed gains, return signed Q and a dominated/health-loss label, not a negative-dollar 'bargain'. If completion=0, this conservative proxy shows harm but does not establish real one-dose vaccination harms exceed benefits; explicitly distinguish model omission from biological conclusion.

## Minimum acceptance checks before publishing a claim beyond exploratory

Verify current product availability/PAP registration; age distribution and Medicare/PAP eligibility; prior zoster vaccination (old CEA does not evaluate prior live-vaccine recipients); number of incremental starts rather than applications; comparator vaccination timing; dose2 completion; remaining site cap; realistic shipment lag; donor-paid versus already-paid staff; itemized purchases and terminal stock. Publish source Q provenance, gross-cost boundary and model limitations alongside estimate. Do not add a separate benefit for leveraging manufacturer stock, as its clinical benefit is already in Q.
