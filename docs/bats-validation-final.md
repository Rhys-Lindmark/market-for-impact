# BATS validation-only correction — accepted

Corrected `/private/tmp/mfi-bats-model.mjs` and its portable `.test.mjs` outside Site. No coefficients, weights, costs or default outputs changed.

Reproduced real failure: positive and equally negative mortality worlds (weight.4each) plus tiny positive occupancy1e-300world(weight.2) gave finite individual row prices (positive$95,832,389.81; tiny$7.1874e307), finite aggregateBayQ2.7826360919865844e-304, but aggregatepriceInfinity. Added numeric-finiteness checks on all returned row and aggregate scalars, including price and favorable share. Added this exact regression and a separate individual-row price-overflow regression.

Verification: portable suite passes. Complete `JSON.stringify(calculate())` output captured before patch and compared byte-for-byte afterward: **exact full default parity true**. Existing savedsummary and renderer checks also pass. Preserved defaultBayprice$36,290,154.70932942. Corrected artifact is ready for integration.

Comparability memo assessment: access wording about care otherwise supplied “through this or another provider” can overlap fundingresponse's replacement-of-existing-BATS-resources meaning. Partition them explicitly on future elicitation: funding=netnewBATSdelivery conditionalonbudget/capacity; access=whetherthatnewdelivery replaces equivalentcareelsewhere/later; transfer=observationalconfounding/clinicaltransport. This is a documented semantic ambiguity, **not proof current.3×.1 coefficients duplicate the same event**, so no numeric retuning is justified. Occupancy already supplies occupiedtreatmenttime; do not add another genericretentionfraction.

Observed task clock08:58:46UTC (after initial read), finalverification09:00:06UTC onSeptember11,2026;1m20s measured wall interval, initial read just before firstclock. Parent-confirmedgpt-6-astra/low. SpaceSaver/TokenSaver applied; no Site edits, installs, outreach or nestedagents. No temporarybulk created.
