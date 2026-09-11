# ReCARES V2 independent core audit

Disposition: **ACCEPT numerical/source core for exploratory use; HOLD giving.** Both corrections below were independently rechecked at16:37:34UTC: prominent accrual disclosure present,56/56tests pass with exact saved/original parity. Final renderer JSON was not yet supplied and is not accepted by this core audit. No coefficient retuning requested.

Actual focused interval: **2026-09-11 16:34:25–16:35:45 UTC (1m20s wall)** through original-source, arithmetic and stress checks; memo writing followed. Active effort not separately metered. Parent-confirmed gpt-6-astra / low dispatch. No Site edits, author-file edits, installs, outreach, nested workers or retained downloads. Existing native Node used.

## Actionable corrections sent to author

1. **Accounting terminology:** original FY2025 Form990-EZ has `MethodOfAccountingAccrualInd` checked and Cash unchecked. Describe **$72,583 as whole reported/accrual expense, used as a cash-cost proxy**, not verified cash spending. In particular $60,000 grants receivable is not cash on hand. The report already distinguishes investments/receivables and unvalued volunteer/equipment resources, but repeated “cash/output” language must not imply a cash-flow statement. No numerical change required without a reconciled cash-flow source.
2. **Required metadata validation:** current wrapper accepts `calculate({...inputs,programExpenseUsd:null})`, likewise `reportedItems:null` and `equipmentDonors:null`. Only `externalResourceCostPerIncrementalUnique` is intentionally nullable. Reject null in other required inputs and add regression; preserve saved default/diagnostic output. This does not alter the accepted numerical estimate.

## Independently verified primary evidence

Fresh original: https://projects.propublica.org/nonprofits/full_text/202621259349200012/IRS990EZ and adjacent IRS990ScheduleO, fetched/decompressed in memory September11,2026.

- Identity **The ReCARES Network, EIN94-3213876**, calendar2025, submissionMay4,2026; not a separate site or affiliate.
- Revenue196,772; contractors54,640 + occupancy9,938 + printing/shipping2,435 + other5,570 = **72,583 whole expense**. Program69,412 is not substituted as denominator. No netted event/inventory expense add-back shown in inspected return.
- Original states **more than11,000 recipients**, **over45,000 items**, approximately4,700 donors and over5,400 volunteer hours. Floor11,000 is a transparent modeling convention; neither an exact count nor independently deduplicated people. Items are not multiplied directly by QALYs.
- Cash/savings/investments253,225; otherassets60,032 includes grantsreceivable60,000; liabilities175; netassets313,082. ScheduleO othernetassetchange360 is unrealized investment movement. No inference of unrestricted idle cash or current unfunded capacity warranted.
- Fresh native https://www.recares.org/receive confirms Oakland surplus categories, no clinical advice/quality guarantee and constrained availability; https://www.recares.org/faq confirms no residency requirement and no delivery capacity. These support the report's caution; site hours are not residence-weighted health shares. Current donor-ready cash offer remains unknown.

## Arithmetic and regression evidence

`node --test /private/tmp/mfi-v2-recares-test.mjs` independently passed **46/46 internal checks**, including full saved output/diagnostic and original numeric parity. Node reports one file test, not46separate TAPtests.

- Independent central equation: `(10000/(72583/11000)) × .5 × .65 × ((.2×.5×.85×.05×.5)+(.15×.4×.85×.03×.5)+(.65×.3×.9×.005×.08)−.0001) × .95` = **1.3383236088340245 BayQALYs**, price **74,720.34367466782/10**, agreeing within floating precision with model1.3383236088340247/74,720.3436746678.
- Weighted BayQALYs **0.927863575148451**, price **107,774.46456393202/10**. This is signed expectation, not central. Exact original price185,910.27585974694 scales by `(72583/111205)×(9770/11000)`.
- Favorable5%world supplies69.2830676% of signed Bayhealth; withoutfavorable price333,320.2030875002. Lower sharedMELPclinical family294,028.21241318743. These appear in draft narrative; no favorable coefficient tuning found.
- Additional independent tiny-positive utility fixture (`utility=1e-310`, zeroharm, centralweight1) correctly rejects nonfinite price ratios. Harm/null scenarios retained; full societal resource cost and verified funding offer remainnull.

## Clinical and donor interpretation

The preferred model reuses an optimistic, explicit subjective device family rather than finding new local clinical evidence. Mobility utility.05 for.5year is not established by a controlled local utility trial; safeuse, deduplication, device mix, unmetneed and marginal throughput remain priors. The draft states that and prominently shows the competing lower clinical family. This audit reuses earlier accepted clinical-source reviews; it did not freshly re-review every trial fulltext in this bounded core check.

The model first discounts throughput response to a gift, then deduplicates recipient equivalents, then estimates otherwise-unmet safe use with finite utility duration. Those operations are conceptually distinct if throughput is organizational capacity/funding response and unmetneed is recipient alternative access. Do not redefine both as the same insurance/public-funding haircut. No concrete double-discount error is demonstrated in the current draft.

The $10,000 gift is now13.8% of annual reported expense. A bounded calculator is not verified linear capacity: retained marginal-response assumptions may be optimistic given volunteer, inventory, transport, expertise and reserves. Resource benchmarks are explicitly hypothetical denominator additions, not observed marginal societal costs. Reported recipient growth and expense decline establish an accounting ratio, not increased clinical effectiveness. **HOLD giving** remains necessary absent a concrete deployment plan.

## Final readiness boundary

After accounting-language and nullable-input corrections, core acceptance requires rerunning exact parity. Full report/renderer readiness still requires final JSON field/number checks and actual final wordcount/timing; this memo does not claim those unfinished author artifacts accepted. No other material numerical or primary-finance discrepancy found.
