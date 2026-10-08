# California HRS technical integration audit

Decision: ACCEPT current technical integration after root corrected stale narrative during this audit. No outstanding material defect found in bounded scope. This is not independent author-source research or acceptance of empirical causal transfer.

Technical interval: 2026-10-02 04:49:54–04:51:57 UTC (123 seconds). Excluded from organization research accounting. Reviewed existing checkout only; no checkout edits, network source hunt, builds, installs, Sites calls or nested agents. Token Saver and Space Saver applied; 108MB checkout, 29GiB available; only this small private artifact created.

## Material finding, resolved

The initial California HRS `model.nativeOutcomes` incorrectly described historical September values as current (36.852 protected equivalents, .330334 all-population/.323727 California health, “central estimate is preserved,” old unit cost and first-year survival). `model.geographicAttribution` also retained obsolete favorable/adverse scenario language. Root was notified. Re-read at 04:51:57 UTC confirms both fields now describe current outputs and independent .98 California shares, with no obsolete survival claim. No price movement was requested or needed.

## Checks passed

- Read calibrated calculator and recalibration memo, California harm-reduction-services report row, and geography/income adapter implementation.
- All 37 current case IDs occur exactly once, with exactly one additional explicitly historical scenario. Every current case has `incomePathways` (including empty arrays); every stored parameter equals calculator defaults plus case overrides.
- For every current case, independently recomputed incomePathways sum equals calculator income plus induced burden, with stored clinical health separately matching all-population and California health. Price and donor-cost fields reconcile within floating-point tolerance. No combined total is encoded as clinical health or added twice.
- Central California health .14572157053314494, resource equivalent .0002164901213409561, combined .1459380606544859; price $6,852,222.069522628 per ten combined equivalent years.
- Purchaser partition is disjoint: all purchasers removes access health; no purchasers removes central retail savings. Capacity applies before partition. Household deduplication applies to resources, not clinical headcount. Zero clinical effect retains the independently modeled purchaser resource channel.
- Assignment-zero test with explicitly induced health harm .05 and 20 failed applicants losing $10 retained -.049 California health and -.003906324228677677 California resource burden, returning null price. Signed negative clinical/resource cases and zero geography do not fabricate finite positive ratios.
- Donor fee .1 scales price by 1.1; external resources remain gross resource cost rather than household benefit. One-off receipt delay and conditional baseline-alive earnings align with narrative; no extra-survivor wage tail.
- Twenty-one malformed/domain probes reject, including null/array/unknown overrides, invalid gift cap, attribution/geography shares, fees, logarithm boundaries, adverse-effect boundary, nonfinite discount and horizon/duration bounds.
- Current cost narrative distinguishes welfare equivalents from measured clinical outcomes, transferred priors from local evidence, and unidentified additional channels from proof of no real economic benefit.

Root retains responsibility for numerical stress, report/API/list/mobile/render tests, source provenance and publication. This audit did not duplicate those full workflows.
