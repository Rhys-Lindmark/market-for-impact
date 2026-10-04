# Legacy coverage route audit

## Decision: keep three published model boundaries in P0

After the original 48-item queue, independently assess the published legacy Vision To Learn, YMCA of Greater San Francisco and New Door Ventures models. This is coverage repair, not proof of three previously accepted deep-review passes, and adds no accepted/publication count today. The unresolved historical acceptance metadata must remain explicit. A current public substantive cost-effectiveness model needs health and net-resource review regardless of whether an old independent memo can be recovered.

| Boundary | Verified source/history | Public consumers | Required next evidence |
| --- | --- | --- | --- |
| Vision To Learn legacy US/Bay/SF | Commit d657bc5 adds `data/us/vision-to-learn-v2.json`, full report and engine; metadata claims independent audit, no separate memo located. | `/charities/vision-to-learn`, `/api/vision-to-learn-model`, `lib/us-research-index.ts` | Reconcile separate California accepted model with ordinary national/local tranches, matching, current finances and signed household resources; retain original complete outputs. |
| YMCA Greater SF portfolio | Commit a5c6b02 replaces narrower DPP report with fitness/therapy/family/DPP allocation; modelVersion remains proposal-v1. | `/charities/ymca-greater-sf`, `/api/ymca-portfolio-model`, `lib/research-cost-ranking.mjs` | Independent full portfolio health/resource challenge, participant fees and time, overlap, current recipient/capacity and coherent donor versus societal costs. |
| New Door Ventures portfolio | Commit ca72954 publishes employment/education/career model; no separate independent acceptance packet found. | `/charities/new-door-ventures`, `/api/newdoor-portfolio-model`, `lib/research-cost-ranking.mjs` | Employment-related health plus net earnings/consumption, displacement, paid wages/transfers, household costs and finite causal persistence. |

The current New Door report explicitly leaves earnings outside its health model. YMCA leaves educational/community value outside QALYs. Those are substantive missing pathways under the current requested scope, not grounds to exclude the routes. Vision's legacy national/Bay/SF model is separate from California's accepted recalibration and must not inherit acceptance by name alone.

## Funnel classification is not yet complete

`data/san-francisco/research-funnel-v1.json` explicitly records 25 initial reviews/exploratory models and zero completed cost-effectiveness reviews. `app/san-francisco/ResearchLibrary.tsx` links all 25 rows to actual charity reports. Labels alone therefore cannot establish either deep acceptance or adequate current income coverage. Preserve all rows; inspect actual linked report/model boundaries. Compass, Hamilton and GLIDE already have accepted P0 coverage; New Door is retained above. The other 21 route boundaries still require classification and, where substantive health-only models are public, recalibration rather than silent exclusion. This gate remains open.

## Timing and counts

This is repository/history coverage inspection, not organization-specific source research; no research minutes were assigned to charities. Published counts remain 40/40 cohort, 10/11 confirmed legacy, 47/48 original queue. Changent/NFP is the sole current isolated author. Three added coverage boundaries and unresolved funnel routes are shown separately until independently reviewed and published. Overall P0 and geographic goal remain incomplete.
