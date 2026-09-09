# NEXT Distro packet author review

September 8, 2026. Acceptance-ready conditional research packet; independent review pending. No Site/checkout changes, outreach, organization-count change or recommendation has been made.

## Outcome

Central ordinary unrestricted $100,000 gift: 5.78124985 US QALYs, 0.115625 Bay QALYs and zero credited SF QALYs. Donor cost per10 is $172,972.98 US /$8,648,648.87 Bay /unpriced SF. Gross associated resources $124,381.86, with US $215,147.01/10; net resources $112,190.93, with US $194,059.99/10. SF health is not allocated by population: NEXT's current California page explicitly excludes in-city delivery. Bay's 2% future residence share is an unmeasured prior outside SF.

The central donor ratio misses $100,000/10. Holding other central assumptions fixed, it needs roughly $57.81 cash per course instead of $100, or an 8.65-point conditional fatality improvement instead of5 points, to break even on that donor-only screen. These are diligence thresholds, not fitted inputs. Joint favorable US $3,759.52/10 is not an expected value or confidence bound. No evidence supports assigning a probability to that joint case. It remains a genuine nonpolitical clinical-access hypothesis, not a verified recommendation.

## Math and boundaries

The organization buys supported courses, not claimed lives or individually credited sprays. Entire gift remains numerator. Attributable program/central overhead is inside course cash; the unquantified portfolio receives the other allocation. No additional management percentage is added on top. Financing additionality removes replacement courses; a separate unique-beneficiary factor removes repeats/responders/overlap. First eligible use follows an exponential time with a finite access window and common competing mortality. Each distinct person receives at most one indexed conditional survival difference, not a renewed lifetime on every use. Post-event common mortality includes future overdose and erodes gains. Utility and health end at the finite horizon, with continuous health discount and explicit implementation delay. The delay defines the cohort at activation; it is not a claimed current enrolled cohort surviving unmodeled delay.

The signed clinical difference compares actual rescue/EMS availability with an adequate stocked course. Multiple doses, training, timing and ready access are not separately multiplied as if independent measured effects. They are uncertainties inside that prior. The use hazard is likewise not derived from voluntary reports. No use after access expiration, later repeat rescue or additional secondary beneficiary is credited. These omissions limit credited benefit but do not establish a general lower bound because substitution and harm remain uncertain.

Per-course burdens apply to every financing-additional course, even those excluded from unique health. Independent gift-date PV harm and displaced-alternative PV QALYs survive a failed target. None receives a second discount. Benefit and loss have separate nested US/Bay/SF residence shares, permitting local harm without local benefit. Regions are never summed. Nonpositive health gives null positive-health prices; signed negative net-resource ratios remain visible in the savings diagnostic.

Gross resources = gift + all nominal courses × outside public/private cost + all nominal courses × unique fraction × first-event probability × expected additional medical resource per event. Net resources = gift + financing-additional courses × outside public/private cost + added unique events × expected additional medical resources − distinct real resource savings. Gross thus retains replacement-course inputs as an associated envelope; net excludes their already-baseline outside inputs. Neither allocates the whole historical public budget to the gift. $20 public and $20 private/course are uncertain real-resource priors outside NEXT's paid invoices/subcontracts; validate before use. Medical $100/event is an incremental real-resource prior, not gross billed ambulance charges. All costs are expressed in gift-date dollars; no claimed cost savings centrally. Displaced alternative health is independently stress-tested, not erased by zero target efficacy.

## Source acceptance

The activity premise and exact recipient pass. Latest Form990 is fiscal July2024–June2025 despite a tax-year2024 label, filed April2026. The finance ledger reconciles. Deficit/cash/restrictions are not a current unfunded package. Early cumulative recipients and voluntary rescue reports are not used as a current annual unit denominator. The 2025 embedded impact report was inaccessible; no evidence was invented from it. FDA evidence supports rescue physiology, not a measured marginal mailing death-risk difference. See research.md for primary links, dates and access limitations.

NEXT, HRT, Remedy and affiliates occupy overlapping supply-chain stages. Do not sum their modeled lives. The cost ledger excludes medicine/fulfillment amounts already inside NEXT costs; the unique factor must also remove overlaps with other funded recipient programs before portfolio aggregation. Finances do not show that every donated dollar buys naloxone; the explicit 50% allocation is a judgment, not audited spending.

## Verification and reproducibility

Run `node /private/tmp/mfi-next-distro-self-check.mjs` and `node /private/tmp/mfi-next-distro-report-check.mjs`. The self-check has 18 signed scenarios and1,882 assertions, including independent100,000-step midpoint time integration, a no-mortality/no-discount closed form, 500 deterministic bounded-domain cases, missing/nonfinite inputs, domain limits, short horizons and negative/zero states. Simpson2048 is checked against4096/8192 over a deliberately bounded operational domain, not arbitrary physical input magnitudes. Output overflow is rejected rather than serialized as Infinity.

Required report fields were inspected against the actual read-only CharityReportContent component; giftHeading, excludedBenefits, source dates and every regional donor/gross/net scenario ratio are present. Saved model/results match pure calculator outputs exactly. This is author verification, not independent acceptance.

Final report/schema parity run: 871 assertions pass. Arithmetic run: 1,882 assertions pass. Machine-readable receipts are self-check-results.json and report-check-results.json. Negative zero is normalized to zero so live and serialized scenario results agree exactly.
