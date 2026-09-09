# Harm Reduction Therapeutics — independent acceptance audit

September 8, 2026; model `hrt-whole-gift-rivive-unique-survival-v1`.

**Accepted as a transparent, conditional whole-organization research model. No material correction remains.** This is not a recommendation, verified funding offer, current manufacturing quote, proof of additional use, or permission to add HRT and Remedy Alliance health estimates. No Site files, publication counts, orders, gifts or outreach were changed.

## Packet and verification

Reviewed `/private/tmp/mfi-hrt-model.json`, `mfi-hrt-calculator.mjs`, `mfi-hrt-results.json`, `mfi-hrt-report-content.json`, `mfi-hrt-review.md`, `mfi-hrt-calculator.test.mjs` and `mfi-hrt-report.test.mjs`. Compared required fields and nested arrays against the actual `CharityReportContent` type in `work/market-for-impact-sfaf-portfolio/components/CharityResearchReport.tsx`.

- Author calculator suite rerun with Node 24: **3,536 checks, 24 scenarios, PASS**.
- Author report/schema/saved-result suite rerun after final wording correction: **771 checks, 24 scenarios, PASS**.
- Independently written in-memory arithmetic test: **2,879 checks, PASS**. Covers every saved/calculated output in all 24 scenarios, missing and nonfinite inputs, out-of-domain inputs, 1,000 randomized valid signed cases, and direct 60,000-step integration for all scenarios plus 100 randomized cases.
- Independent actual-schema and report-text check: **1,046 checks, PASS**. Checks all required fields including `giftHeading`, optional comparison bridge shape, and each scenario's three geographic health totals, six prices, and resource numerator.

Independent checks total **3,925**, separate from **4,307** author assertions. These are research-packet checks, not claims of a deployed API/browser test. Final equation now explicitly integrates from zero to finite horizon H and rounds the expected cohort to 245 people; numerical outputs are unchanged.

## Source and cost acceptance

The [primary FY2024 Form 990-PF](https://projects.propublica.org/nonprofits/full_text/202533219349104918/IRS990PF) independently reconciles gross sales $11,454,985 less COGS $4,658,446 to gross profit $6,796,539. Operating expenses $8,244,357 exclude those COGS; combined cost is $12,902,803, one dollar above the direct-charitable-activity entry. Reported net revenue is not gross sales or a complete production-resource figure. Contributions of only $5,000, inventory and substantial accounts payable appropriately prevent historical finance from being presented as current philanthropic room.

[HRT's current giving information](https://www.harmreductiontherapeutics.org/about/) supports free supply, price access and capacity as possible philanthropic uses. It calls $36 the initial twin-pack price and says the current price is lower. The model's $30 is explicitly a current planning prior, not a quotation. The 70%/20%/10% allocation is a prospective whole-gift judgment, not observed spending or an earmarked ordinary gift. Unquantified portfolio cash remains in the numerator.

[HRT's FAQ](https://www.harmreductiontherapeutics.org/faq/) includes manufacturer logistics, coordination and regulatory expenses in price. The modeled outside allowance is downstream only; manufacturer production and shipping are not charged twice. Gross-associated resources retain nominal downstream activity and the entire gift even at supply null. They are neither exhaustive nor net societal costs; this label must remain visible.

The [January 28, 2026 Capstone announcement](https://www.harmreductiontherapeutics.org/wp-content/uploads/2026/03/HRT-x-Capstone-Health-Alliance-Partnership-Press-Release_Final.pdf) is not a March event despite its upload path. The [August 31, 2026 SSDP announcement](https://ssdp.org/blog/carry-naloxone-know-your-rights-save-a-life-ssdps-hope-puts-the-tools-in-your-hands/) confirms a current donated-product distribution mechanism beyond Remedy, not otherwise-unavailable use. Neither establishes a new donor-funded batch or funding capacity. Existing free production, stock, commercial orders and other funders are baseline.

## Clinical, counterfactual and overlap acceptance

[FDA approval](https://www.fda.gov/news-events/press-announcements/fda-approves-second-over-counter-naloxone-nasal-spray-product) supports the rescue mechanism, not charity-level mortality per pack. The [19-person manufacturer-commissioned feedback report](https://www.harmreductiontherapeutics.org/wp-content/uploads/2026/04/2025-RiVive-Community-Feedback-Report.pdf) is correctly described as compensated, selected, qualitative interviews with variable denominators. No comparative mortality, use rate, preference-to-QALY or formulation-superiority coefficient is imported.

[Olfson's primary historical cohort](https://pubmed.ncbi.nlm.nih.gov/30005310/) verifies repeat-overdose rate 295 per 1,000 person-years and fatal-opioid rate 1,154 per 100,000 person-years. The [companion analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC6143082/) verifies all-cause mortality 778.3 per 10,000 person-years. These are risk-context anchors, not current RiVive-recipient estimates. The model correctly separates the 0.06 other-cause hazard prior from the 0.01 modeled opioid hazard; it does not add an unpartitioned all-cause rate to a second overdose hazard. [Walley's community study](https://pubmed.ncbi.nlm.nih.gov/23372174/) is observational implementation evidence, not an individual rescue-effect parameter.

Funding additionality, high-risk placement, packs per unique beneficiary, event rate and effective-rescue increment are explicit conditional priors. Shipment does not equal use. Current [DHCS free supply](https://www.dhcs.ca.gov/individuals/naloxone-distribution-project/ndp-frequently-asked-questions/), other naloxone and EMS remain in baseline. Supply replacement and event-time effective rescue describe distinct conditional stages rather than duplicating one adjustment.

The calculator compares the same initially alive expected people. A fatal event ends a person's survival; repeated nonfatal events do not create additional life tails. Extra rescue protection lasts one year centrally; thereafter both arms return to the same mortality hazard, with residual survival differences observed only to ten years. Delay discounts the cohort conditioned alive at service start. Independent quadrature confirms the positive and negative survival integrals. The device-demand guard is only an expected incremental-use budget, not proof of realized use or an episode simulation.

Acute per-person harm is gift-date present value and distinct from surviving-person utility. Independent harm persists at zero activity. Zero supply, no placement, true health null, rescue null retaining harm, signed access-displacement harm, finite horizons, capacities and zero-local-share cases are retained. Prices are null for zero or negative health; signed QALYs are not clamped to benefit. All numeric inputs are required and safely bounded.

Existing Remedy files were read directly. Its four-injectable-dose-equivalent accounting bundle is not a RiVive twin pack. HRT and Remedy are alternative marginal-gift counterfactuals along a shared supply chain. A joint portfolio must deduplicate linked recipients/person-time; published health totals cannot simply be summed. Baseline distribution capacity and separate downstream resources are explicit. No arbitrary attribution haircut is required to replace that stated counterfactual, but the non-addition boundary is essential.

## Result and residual uncertainty

For the entire $100,000 gift, central modeled national health is **3.912297655 QALYs**, with gross-associated resources **$140,000**. National donor/resources cost per 10 QALYs is **$255,604 / $357,846**. The joint favorable case is **$3,293 / $4,939**, not a confidence interval or verified opportunity.

Bay donor/resources prices are **$25,560,427 / $35,784,598** and SF **$127,802,137 / $178,922,991**, based only on weak 1% and 0.2% beneficiary-residence priors. SF is nested in Bay, and both are contained in US health; they are not additional health streams. No indirect local benefit is credited, no headquarters inference is used, and local-zero scenarios remain available.

The cheap disconfirming test remains material: obtain an otherwise-unfunded, supply-constrained tranche, current complete price and delivery capacity, then document nonduplicated exposure and event-time additional rescue. Until then, this is a defensible explicit-prior research estimate, not observed cost-effectiveness or a recommended current gift. Detailed primary-source checks are retained in `/private/tmp/mfi-hrt-source-audit.md`.
