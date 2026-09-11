# Breathe V2 independent audit

Observed interval: 2026-09-11 16:38:56–16:41:01 UTC through initial memo; author correction and final test followed immediately. GPT-6 Astra / low by parent dispatch, not self-introspection. Read-only to author packet and Site; no installs/outreach.

## Disposition

ACCEPT numerical and source conclusions as an explicitly partial-health exploratory assessment. Author corrected the custom-scenario cost-label issue below and added the exact regression; reviewer reran the suite successfully with default saved outputs unchanged. No outstanding mandatory correction. This is not acceptance as a complete whole-organization expected-value recommendation.

## Checks performed

- Executed author's test suite: passed. It verifies saved full output and old baseline, finance identities, signed/null scenarios, bounds and report schema/Markdown parity. Node reports one test-file unit, not an invented assertion count.
- Independently fetched original FY2025 Form990 via native fetch after web retrieval failed. Verified functional1,373,246, netted event6,344, whole1,379,590; environment511,139, lung407,539, tobacco299,166, community25,046, admin130,356. Netted event charge is not double counted in functional costs.
- Verified FY2025 revenue1,648,480 and surplus275,234. Net assets1,483,421 +275,234 +95,338 +140,576 =1,994,569. Adjustment is not described as current spending. Source: https://projects.propublica.org/nonprofits/full_text/202641369349300219/IRS990
- Independently fetched FY2024 original and confirmed zero current functional columns. Report correctly treats this as an unresolved anomaly, not zero operations or permission to invent a replacement year. Source: https://projects.propublica.org/nonprofits/full_text/202511359349318961/IRS990
- Independently checked current Clean Cars page: GRID Alternatives is the authorized application-assistance partner. No Breathe vehicle benefit is credited. https://lungsrus.org/clean-cars-for-all/
- Inspected finite cessation state equations, one-year asthma and CPAP pathways, whole-gift denominator and nominal-service external costs. Later quitting/relapse is modeled; CPAP ITT is not multiplied by duplicate adherence or survival factors. Remaining model risks (cohort-calendar mortality lag, generic utility transfer, overlapping patients) are explicitly disclosed, not computational mistakes.
- Prose central10,751,762.342975779 and mixture12,346,598.399682583 match outputs; old central5,739,210.197176861 remains distinct from newweights/oldallocation6,552,112.130998517. Broad-budget32.3065% quantified allocation is a proxy with subjective internal splits, not observed marginal allocation. Favorable81.3427% contribution and59,557,999.1762108 no-favorable price prominently disclosed.

## Mandatory bounded correction

In `mfi-v2-breathe-model.mjs`, `checkedCore` overwrites `other_allocation_usd` using base allocations rather than merged world overrides. Reproduction:

`calculate({worlds:[{id:'custom',weight:1,foundation:{cessation_allocation:0,asthma_allocation:0},inputs:{cpap_allocation:0}}]})`

It correctly yields zero clinical episodes/QALYs but reports other allocation57,784.733 instead of90,091.259, alongside enabling9,908.741. Compute that row label using effective merged allocations, or disallow allocation overrides. Add regression and preserve exact default output. Top-level quantifiedAllocation should remain explicitly base/central if retained for variable-mix worlds; do not imply it describes every world.

## Residual research limitations, not forced corrections

Within-category splits, delivery unit costs, marginal response and Bay shares are not locally measured. No additional gift plan is established. Large unquantified environmental/policy activity prevents calling the subset result a full-return estimate or an assured upper bound. The report states these boundaries well. Deeper prose does not resolve them; an actual priced deployment/cascade or attributable exposure denominator would be more valuable than additional generic intervention citations. No favorable tuning requested.
