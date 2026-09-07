# Naloxone research checkpoint — 7 September 2026

Research-only handoff; not a published donor estimate. Research implementer: sf_research_audit.

The [current Coffin/Sullivan 2013 abstract](https://pubmed.ncbi.nlm.nih.gov/23277895/) reports 227 kits per death prevented and $438/QALY in a historical lifetime model. The [2017 correction](https://pubmed.ncbi.nlm.nih.gov/28460394/) exists, but its primary text was inaccessible. Do not claim the correction has been verified or that a historical societal ICER equals current SF donor cost.

The [SF Health Commission June 4, 2024 memo, contract 1000032060](https://www.sf.gov/sites/default/files/2024-05/HC%20Memo%20Memo%20-%20%20SFAF%2032060%20Final.pdf) gives an ongoing annual $250,000 allocation and targets of 26,016 naloxone doses, 10,008 contacts and 3,600 education sessions. The bundled planned budget/target-dose benchmark is $9.60947. It is not a realized marginal price; the contact and dose ratios allocate the same budget and must not be added. Contract-date inconsistencies remain unresolved.

Initial two-month figures reconcile approximately: 4,336 doses × $33.474 + 600 sessions × $139.15 + $151,364 campaign = $380,002.264, versus the stated $380,000 budget. Do not apply those printed initial rates to ongoing annual targets.

An illustrative decision model is:

`(250000 / 26016) × doses_per_comparable_kit × 227 × 10 / (local_effect_retention × discounted_QALYs_per_death_prevented)`

At assumed two doses/kit, 50% retention and five discounted QALYs/death, this gives ~$17,451/10 QALYs. At 100% and ten QALYs: ~$4,363; at 10% and two QALYs: ~$218,135. These are scenarios, not a confidence interval or a validated SFAF funding estimate. Null additionality remains possible. Kits from the historical model and current doses are not established as interchangeable.

[SFAF reports](https://www.sfaf.org/health-services/overdose-prevention-response/) 41,399 doses, 10,041 trainings and 2,852 reported reversals in 2025. They are not necessarily attributable to this grant or incremental unique beneficiaries. Reported reversals are not deaths averted. [SFDPH's March 2025 guideline](https://media.api.sf.gov/documents/Naloxone_Guideline.pdf) describes free state naloxone, so new money must expand uncovered reach rather than assume medication procurement is the bottleneck.

Next: inspect correction text if accessible; verify realized costs and dose/kit comparability; identify an unfunded expansion; estimate additionality versus current provision; build a transparent best-estimate model with explicit judgment calls and break-even sensitivities. Do not abandon the hypothesis merely because funding-room evidence is incomplete, but keep modeled promise separate from a verified marginal offer.
