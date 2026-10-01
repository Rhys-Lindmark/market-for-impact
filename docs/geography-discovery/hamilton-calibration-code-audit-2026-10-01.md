# Hamilton Families code/scientific audit — 2026-10-01

Decision: ACCEPT the calibrated wrapper and focused tests after the zero-transfer validation correction. This is code/model acceptance only, not full-report integration, public-review acceptance, or publication.

Read-only scope: `lib/hamilton-calibrated-model.mjs`, `scripts/hamilton-calibrated.test.mjs`, imported Hamilton decision/receipts, and root's Hamilton source challenge. No checkout edits or new source search. User-confirmed inherited GPT-6.1 Sol; no override or independent runtime metadata claim.

## Independent arithmetic

Recomputed all 16 scenario outputs directly with `Math.log(1+x)` and negative-power discount factors, independently of wrapper intermediate values. Maximum absolute difference: 4.440892098500626e-16.

Central: D=$100,000; all-in C=$10,000; T=$5,000; net tenant incidence p=.8; household resources Y=$50,000; receipt delay .25 years; discount .03. I=.5*ln(1+p*T/Y)/(1.03)^.25=.03819720912626558 per award. Broad transported envelope H=.144*.5=.072 already includes VA second-year discount. Full-overlap residual=max(0,H-I)=.03380279087373442. Combined=10*(I+residual)=.72 years/$100,000; price=$1,388,888.888888889 per ten combined years. Residual is an allocated noncash welfare/health proxy, not measured clinical QALYs.

| Case | Combined years/$100K | Price per ten years |
|---|---:|---:|
| Central | .72 | 1388888.888888889 |
| Half overlap | .9109860456313279 | 1097711.655184558 |
| No overlap | 1.101972091262656 | 907463.9983433569 |
| Cash only | .3819720912626561 | 2617992.3163872445 |
| Cautious | .04892838754206947 | 20438033.015908856 |
| Favorable | 3.616636340976258 | 276500.0143005986 |
| Replacement harm | -.024878185827737327 | null |
| Higher dose | .5811316006826215 | 1720780.626669343 |
| Loaded cost | .5294149109306393 | 1888877.6635364052 |
| Half funding | .36 | 2777777.777777778 |

No-funding, no-completion, no-portfolio, no-transfer, and all-null cases are zero with null price. No-cash retains .72 through the independently stated broad envelope.

## Material checks

- Cash is a one-off resource receipt, not repeated annual earnings; no clinical transfer factor attenuates cash. p=.8, Y=$50K, T=$5K, C=$10K and timing remain analyst judgments, not measured Hamilton household income or average award.
- Central C is explicitly all-in, T<=C is validated. Alternative support loading uses 1+4976124/13822877 and is conditional on treating the un-loaded cost as program-only; it is not automatically added to the central all-in cost.
- Full overlap preserves cash surplus when I>H; residual never becomes negative. Partial/no-overlap diagnostics expose the broad housing-state valuation uncertainty.
- Positive benefits use funding additionality and successful completion. Signed recipient burden is not attenuated by those, overlap, or clinical utility; assigned-case/portfolio exposure and nested geography still apply. Funding replacement can therefore be harmful.
- Portfolio assignment applies once. SF share cannot exceed Bay share; geographic signed components retain the donor cost denominator. Conditional SF case geography is not a claim about Hamilton's entire organization.
- No native ITT multiplication onto participant VA effects and no second discount of the VA health/welfare envelope. Original frozen model/data remain historical, not silently recalibrated.
- Found one material guard gap: T=0 alone retained the TFA envelope. Root added rejection of T===0 && H>0, plus a test. Re-read and verified the correction; explicit no-transfer T=0,H=0 remains valid.

Focused Hamilton test passed after correction. No remaining material code/scientific blocker found within this scope. Scientific uncertainty remains substantial: the 50% VA transport, overlap allocation, marginal additionality, award size/all-in cost, and household incidence need future local evidence; acceptance does not convert them to empirical estimates.

Dedicated audit: 2026-10-01T19:39:29.791Z–2026-10-01T19:42:34.762Z, 184.971 seconds (3.08285 minutes). Closed helper record: `/private/tmp/hamilton-code-audit-20261001.closed.json`. Distinct from the source phase and root challenge; no publication/count update.
