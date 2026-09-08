# SPUR clean-heat model independent acceptance audit

2026-09-08. Read `/private/tmp/mfi-spur-current-model-brief.md` and `/private/tmp/mfi-spur-current-model.json`. No Site edits.

## Verdict

Accept as a conditional, highly judgmental donor-health model, not an empirically calibrated effect of SPUR. No material arithmetic correction. Core central $13,661,202.19/10Q; favorable $186,741.36; pessimistic $45,045,045,045.05. Ambitious-scale $46,685.34 is correctly excluded from core/ranking. Two implementation clarifications below prevent misleading extrapolation.

## Numerical and causal checks

- Central `.01 × .5 × .1 × 3 × .1 × 61 × 8 = .0732 Q`; favorable `.05 × .7 × .2 × 5 × .15 × 85 × 12 = 5.355 Q`; pessimistic `.001 × .2 × .02 × 1 × .05 × 37 × 3 = .0000222 Q`. Prices use `1,000,000/Q` for the $100K grant.
- Ambitious-scale `.1 × .75 × .2 × 7 × .2 × 85 × 12 = 21.42 Q`. $100K plus another $1M in net resources gives $513,538.75/10Q. Threshold total resources $214,200; residual $114,200 after grant is correct.
- Zero contribution and zero realization produce zero Q; central gross .0732 minus harm .1 gives −.0268, correctly no positive bargain ratio.
- Agency 37–85 is the full **regional modeled annual premature-mortality contrast** associated with total appliance PM2.5 reduction, not observed deaths, heat-wave mortality, SPUR impact or an SF-only statistic. The secondary-only range is alternative, not additive. Midpoint61 and health-years3/8/12 are transparently judgments. Counting primary PM benefit requires actual elimination of the relevant gas combustion, not merely documentation or a lower-NOx gas appliance.
- F is conditional outcome scale, P implementation success, A marginal grant contribution and S SF health geography. Their distinctions are coherent as defined; no extra generic local-transfer factor should be applied without identifying a new mismatch. F must be interpreted as a health-relevant exposure-equivalent fraction, not a universal linear conversion from permit counts or tons of NOx.
- T handles discounted occurrence of mortality differences after ramp/lag and before usual-care catch-up. L values health-years from each mortality-event time. This does **not** inherently double count lifetime credit: summing distinct annual attributable mortality cases then valuing each case is standard. Do not subsequently multiply by appliance life or again discount case timing. L remains an uncertain life-extension quantity, not automatic complete life expectancy; no local age-specific calibration was found.
- Existing laws, agency work and prior SPUR achievements are in the baseline. No new donation is credited with 2023 adoption. The model appropriately omits separate asthma, cooling, indoor-air and climate benefits.

## Smallest required public-copy/implementation clarifications

1. **Current rule status:** Add a dated sentence and the current primary source rather than merely saying implementation is evolving. The [Air District's building-appliance page](https://www.baaqmd.gov/en/rules-and-compliance/rule-development/building-appliances?sc_lang=en), retrieved September8, reports July14,2026 draft Rule9-6 flexibility amendments, an August13 comment deadline, and a tentatively scheduled November decision. These are proposed changes, not enacted exceptions. This matters to the no-gift replacement schedule. No numeric change follows without a schedule model. Also do not use the [September10 SPUR roundtable](https://www.spur.org/events/2026-09-10/clearing-air-heat-pump-adoption-benefits-bay-area-homes-health-and-climate) as a completed event as of this audit; the draft currently avoids that error.
2. **Harm semantics:** The current formula is acceptable because H is defined as already-net, grant-attributable harm. Make this explicit in implementation: H is **not** a raw harm per installed appliance or a generic full-package harm. If estimated from unsafe installations, heating interruption or household burdens, first apply the relevant additional installation/implementation and donor-causality factors. Identical funding replacement should not retain those shared physical harms, whereas a genuinely donor-specific adverse effect can persist at A=0. Do not count the displaced program's forgone QALYs both here and in a portfolio opportunity-cost comparison. No change to the illustrative .1 net-harm stress is necessary if labeled as such.

## Source-access boundary

Primary official agency current-rule text and SPUR program pages independently checked. Author visually inspected AppendixE table and preserved `/private/tmp/mfi-spur-primary/tmp/pdfs/appliance-primary-2022.pdf`; this pass did not repeat the PDF rendering. Independent indexed agency sources corroborate37–85, but no claim is made that I revalidated the underlying atmospheric computation. The key remaining empirical gaps are the grant-to-earlier-conversion dose, SF exposure distribution, calendar trajectory, remaining QALYs per postponed death and net induced resources. Missing offer alone is not the reason the result remains conditional.
