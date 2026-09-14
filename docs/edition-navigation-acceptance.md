# Edition navigation and compact research lists

Requested September 13, 2026 (Pacific time). This is a presentation/navigation change, not a model or recommendation revision.

## Route contract

- /givebetter/ redirects permanently to /givebetter/all (all twelve editions, including SF).
- /givebetter/san-francisco retains the four reviewed SF giving leads and photographs.
- /givebetter/san-francisco/all contains the existing 91 local research rows.
- Each new edition uses /givebetter/<location> for the shortlist surface and /givebetter/<location>/all for the complete report list.
- Until shortlist review is complete, new editions display a clear pending-shortlist message and link to their existing reports. Initial reports are not silently promoted to recommendations.
- /research, /editions, /<location>/research and /cities/<city> legacy routes redirect directly to their canonical replacements. Unknown editions/reports remain 404.
- City report canonicals now use /<city>/charities/<slug>; old city report routes redirect when a published report exists.

## Presentation and evidence

All full research lists use the existing SF CSS-module table: identical typography, spacing, plain headers and compact amounts. Repeated row-level readiness warnings are removed; report evidence and the page-level comparison caveat remain. Average annual expenses remain in the list. Selecting the amount opens that organization's report appendix, where annual amounts, source links, entity/accounting boundaries and incomplete-year caveats are preserved. No amounts are invented or recomputed by this UI change.

## Verification

Eleven focused plan/report/expense tests pass. Changed application and regression-test lint passes. Production build passes. 106 phone/tablet tests pass across redirects, all edition route pairs, full-table styling, existing SF shortlist and published reports/APIs. Four additional phone/tablet expense tests pass, exhaustively verifying all 93 stored expense records against each report's exact entity, basis, fiscal years, source links, mean and notes; no unresolved recipient mappings. Desktop USA list visually inspected against SF styling. Canonical post-deployment checks are the final release gate.

Next: accept queued research batches and defensible California model revisions; retain the 100 discovery → 25 initial → 10 in-depth → 4 shortlisted workflow.
