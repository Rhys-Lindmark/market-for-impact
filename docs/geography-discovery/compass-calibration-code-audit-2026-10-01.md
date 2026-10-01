# Compass calibrated wrapper: independent code acceptance

October 1, 2026. **Accept code-only. No material corrections found.** This does not accept full report/ranking/API integration or claim publication. Read-only checkout at HEAD `6f7049c`; wrapper/tests were untracked root-owned additions at inspection. Reviewed accepted proposal and current wrapper/test file directly; no source expansion, nested agents or checkout edits.

Files audited (SHA256):

- `lib/compass-calibrated-model.mjs`: `840922e3a66e33638ca631d7395ff93cbada084042d293ac59d6db9daa72da1b`
- `scripts/compass-calibrated.test.mjs`: `e0a60d52abb3af76efaa478804c9ef996373a6a55521de8e265a51efccb034f6`

Central matches exact proposal: C=2008658/207; T=1095985/207; transported broad envelope=.144*.5=.072; p=.8, Y=50000, receipt=.25years, r=.03; full overlap1; additionality/completion/portfolio/SF/Bay1; burden0. Cash per case=.0403587505191333; residual noncash proxy=.0316412494808667; $100K combined=.7419879342327066; donor cost/10=$1,347,730.8105206657 (last-bit floating-point rounding only).

Implementation checks accepted:

- Full overlap is `max(0,H-I)+I=max(H,I)`, preserving surplus cash when I>H. Cautious and low-Y diagnostic exercise this. No negative residual, income cap, native .02 prevention multiplier, clinical transfer on cash or second VA-envelope discount.
- Cash is credited once with an independent receipt discount, not repeated as annual wages. No unsupported earnings central is present. Net tenant p/Y/timing remain judgments from the accepted proposal, not new measured quantities. Wrapper names `transportedWelfareYears`/`noncashProxyYears`, not clinical netQalys.
- Funding/completion attenuate positive benefits; burden exposure independently controls negative process cost. Losses persist under zero funding/completion, and are not overlap- or capacity-discounted. Recipient costs do not enlarge donor cash budget. Portfolio share assigns all relevant benefits/costs once; SF<=Bay validated, and regional attribution scales each signed component consistently without reducing donor cost.
- Shared-support multiplier is exactly `1+6951080/38222158`, applied to C-Rent per-case cost only. No whole-Compass expense/207 substitution; program-only central and average-loaded sensitivity remain distinct.
- Positive, null and harm states are signed; nonpositive welfare returns null positive-life price. Invalid fractions, income-domain, timing and nested geography are rejected.
- Original native/VA JSON files have no diff against HEAD; their latest file commit remains `34fc51c`. Imports expose historical prices only. Current API/page/ranking search did not find wrapper integration at audit cutoff; this is intentionally a code-only gate.

Verification: finite existing-runtime `node scripts/compass-calibrated.test.mjs` passed. Independent direct-log/negative-power arithmetic recomputed all14 diagnostics from inputs, rather than copying wrapper intermediate values: maximum absolute combined-year discrepancy 4.440892098500626e-16. It independently confirmed half-overlap $1,052,693.3827034931; no-overlap $863,632.0527697911; cash-only $2,404,351.401104074; cautious $14,432,630.83559513; favorable $506,269.3265851322; loaded $1,592,829.0774053866; half-funding $2,695,461.6210413314. Replacement harm gives -.025637935708028057 years/$100K and null positive-life price. Additional combined funding0/completion0 loss check preserved the same harm.

Integration gate remains: public text must call residual **noncash welfare/health proxy**, not measured clinical QALYs; disclose 80% tenant incidence, $50K household reference, full overlap and conditional marginal funding as judgments; distinguish program/shared-support/whole-entity fiscal scopes; keep historical bridge and research timing separately; wire report/API/ranking consistently and independently verify that phase. This audit does not establish marginal funding room or empirical separation.

Space Saver/Token Saver: reused94MB checkout and existing Node24 runtime;29GiB filesystem free at phase entry. No install, server, bulk artifact, cleanup or product mutation. Dedicated actual interval and user-confirmed inherited GPT-6.1 Sol attribution are supplied in `/private/tmp/compass-code-audit-20261001.closed.json`; no independent runtime metadata claim.
