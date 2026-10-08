# Independent prevention-benefit reconstruction: root decision

Status: tested research candidate, NOT yet a published price correction. Published-cohort completion remains 13/40; repeating two reviews adds no completion count.

## What changed in the reasoning

The current Compass and Hamilton ledgers use residual=max(0,.072-cash). Whenever cash<.072, cash+residual=.072. Changing resources or household baseline then preserves the total by construction. This is an allocation of an inherited welfare envelope, not an independent verification of benefit magnitude.

The replacement candidate independently calculates one-off tenant-resource equivalents and a finite avoided-homelessness health proxy. It does not set health equal to an old total minus cash. The old native and VA models, and the first health/income calibration, remain historical evidence. Neither candidate is funding-ready.

## Evidence and priors

[Phillips and Sullivan's original Santa Clara paper](https://sites.nd.edu/james-sullivan/files/2023/04/SCC_homelessness_prevention-8-1.pdf), pp2–3, finds a pre-pandemic 3.8 percentage-point reduction in recorded homelessness after an offer; assistance access rises from 12% to68%. Family effects are smaller and pandemic outcomes differ. The ratio .038/.56 requires exclusion/monotonicity and comparable service/receipt definitions; it is not a measured effect per Compass or Hamilton paid family. Root rejects using that ratio as the central local paid-award effect. The candidate .02 per additional realized award is an explicit local judgment, NOT a measured offer-to-recipient conversion. This is also not validation of the old native .02 offer assumption.

[The original VA study](https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2825636) combines housing transitions, mortality associations and housing-state utility assumptions. Its .144 prevention benefit cannot be transported as an empirically isolated clinical increment for SF families. Root does not infer a new health gap from its broad housing-state valuation.

Health candidate per award: .02 avoided-episode probability × .25 years avoided exposure × .025 noncash adult-equivalent health-quality gap /1.03^.375 = .0001236220820540793 years. Probability, duration, gap and one adult-equivalent are judgments. Recorded service entry does not measure avoided days. The small noncash gap is a provisional nonfinancial health prior, not EQ-5D evidence, and must be tested over zero to materially larger alternatives. No mortality, child multiplier, generic security bonus or preserved-wage tail is credited. Missing measurement does not prove those benefits zero.

Resources: .5×ln(1+.8×T/50000)/1.03^.25, once per modeled award. T and .8 net incidence refer to housing consumption, debt relief or freed resources once, not three separately additive benefits. Household-resource baseline50K, incidence80%, timing and reference welfare weight remain explicit assumptions. Additional employment-income effects are unresolved; they are not empirically established as zero and must not be presented as a complete income evaluation.

Compass uses historical program2008658/207, transfer1095985/207 and proportional shared-support factor1+6951080/38222158. The 207 reported families are not a reconciled unique paid-award denominator; costs are historical case-equivalents, not a marginal quote. Support loading is an allocation judgment. See the companion Compass source memo/receipts.

Hamilton C10000/T5000 remain joint all-in cost/dose judgments. Original mixed Housing Services costs and127 outputs cannot establish either. Current [Hamilton program](https://hamiltonfamilies.org/homelessness-prevention) eligibility supports SF prevention scope, not the whole organization's Bay/SF placement mix. A truly additional executed award is the conditional unit; ordinary unrestricted gifts cannot inherit funding/completion1.

## Exact reproducible candidates

| Organization | Currently published | Independent candidate | Why |
|---|---:|---:|---|
| Compass Family Services | $1,347,730.810521 | $2,832,929.154202 | Remove the inherited broad VA welfare envelope; independently value net rent resources and a small noncash health prior, with shared-support costs allocated. |
| Hamilton Families | $1,388,888.888889 | $2,609,546.735988 | Remove the inherited welfare envelope; independently value assumed rent resources and a finite avoided-exposure health prior using the existing all-in dose budget. |

These are candidate dollars per ten combined income/health-proxy equivalent years, not measured local clinical QALYs. Compass health=.001077939489062473 and resources=.3519135917381097 per100K; Hamilton health=.001236220820540793 and resources=.38197209126265574. Resource and incidence assumptions dominate. No empirical scenario weights or confidence interval have been established.

## Verification and acceptance gate

Candidate module: `lib/prevention-independent-anchor.mjs`; finite validation: `node scripts/prevention-independent-anchor.test.mjs` with existing Node24 runtime. PASS: independent cash/health changes, scaling, geography, cost/dose validation, attribution, null and induced-burden harm. Candidate deliberately not imported by reports, ranking or API until independent review and consistent page integration.

Independent helper accepted central arithmetic as a research proposal, not publication readiness. Root repaired the two reported control defects: nested regional prices now reject nonfinite output rather than serializing Infinity as null; avoided exposure is bounded to the six-month endpoint and adult-equivalent count to one. Regression tests cover each. These are scope limits, not evidence that the health prior is measured.

Next: test resource-baseline/paid-denominator/health-duration sensitivity, then integrate historical/current price separation, narratives, API, list/shortlist ordering and research provenance with phone QA. Do not update only the headline, force movement, count a repeat as another review, or call conditional prices verified donation offers.

Timing exception: root interval9d8911f4-c443-4878-b1e4-57196d62168d spans22:20:44.320–23:40:44.689UTC despite a bounded source check; helper likewise reported unexpectedly long wall-clock gaps. Preserve raw timestamps, but do not import whole intervals as dedicated research or invent shorter clocks. The earlier root interval605f5b58 likewise remains excluded pending activity separation. Published research-time totals are unchanged by this candidate checkpoint.
