# GiveWell / Market for Impact reconciliation

September 8, 2026. Read-only runtime and central-data inspection in `work/market-for-impact-unified-research/lib/{amf-model,new-incentives-model}.mjs` and `data/international/{amf,new-incentives}-cea-v1.json`. Central outputs independently recomputed. No Site changes.

## Bottom line

The user's concern is substantive. There is no factor-of-ten arithmetic bug: the disagreement combines **a much smaller discounted health gain per death averted** with **substantially fewer deaths attributed to the gift**, especially for New Incentives. Several differences are legitimate choices, but a pile of uncalibrated conservative priors is not automatically a better expected-value estimate than GiveWell's much more detailed model. The models should expose this disagreement and reconsider calibration, not claim equivalent units or silently force agreement.

## Current external benchmark and native units

GiveWell's impact page, updated August 2026, reports historical 2022–24 grant-weighted averages rounded upward: AMF **$5,500 per life saved** and New Incentives **$4,500**. These are modeled deaths averted, not observed trial deaths or QALYs. The estimates refer to specified funding opportunities; ordinary undirected gifts are not the same allocation. GiveWell already considers displacement from other funders, while displacement among its own grants can move benefit to another organization rather than erase it. Therefore a second generic replacement factor cannot simply be attached to its final estimate. [GiveWell impact methodology](https://www.givewell.org/impact-estimates).

| Central quantity | AMF | New Incentives |
|---|---:|---:|
| Our cash gift | $3,000 | $10,000 |
| Our undiscounted early deaths averted | 0.240975 | 0.1944 |
| Our cash / early death | $12,449.42 | $51,440.33 |
| Our remaining event-time QALYs / early death | 13.64614 | 13.64614 |
| Our discounted net QALYs / gift | 3.086360 | 2.321640 |
| Our cash / 10 QALYs | $9,720.19 | $43,073.00 |
| Our gross associated-resource / 10 QALYs | $19,440.37 | $66,332.42 |
| GiveWell life price / our 13.64614 Q, times 10 | $4,030.44 | $3,297.64 |
| GiveWell life price / hypothetical 50 Q, times 10 | $1,100 | $900 |

The last two rows are transparent conversion illustrations, not GiveWell QALY estimates; they omit a new gift's implementation lag and harms. A $5,000 life with 50 QALYs indeed implies $100/QALY or $1,000/10Q. Comparing $5,000/life directly with $9,720/10Q is not apples-to-apples.

## Survival conversion explains a large but not complete difference

Both models use `L=.8*.85*sum(k=1..40, (.99/1.03)^(k-.5)) =13.64613675`. This incorporates a 40-year truncation, annual competing survival, 3% discount, utility .85, and a further .8 persistence probability. None is a locally fitted survival curve. Fifty remaining undiscounted life-years are not fifty discounted QALYs. Discounting, utility and background mortality are distinct; the .8 persistence prior must specifically mean lost incremental survival, not another generic uncertainty penalty for the already estimated deaths.

AMF adds implementation/exposure timing; NI averages mortality benefit over four future years after a two-year delay. Thus NI's event-time value is multiplied by .87593044. These separate calendar intervals are not an arithmetic double discount. Excluding morbidity and adult benefits differs from a broader valuation, but cannot be invoked to explain an arbitrary gap in **death counts**. GiveWell's income and moral-weight calculations are not QALYs and must not be added to its lives-saved output.

## AMF: where our death rate comes from

Undiscounted deaths = `1000*1.8*.14*.015*.17*.5*.5*(.8+.5+.2)=.240975`.

- .015 is annual all-cause mortality among young children, not cumulative under-five deaths per live birth. It remains a judgment for unknown campaign geography and is not demonstrably conservative. Do not replace it mechanically with a national under-five mortality statistic.
- .17 is an old trial all-cause relative effect. `transport=.5`, functional protection `.8/.5/.2`, and `additionality=.5` are independently chosen judgments. They can represent different causal losses, but transport must not again cover the same deteriorating use, durability, resistance, or already-owned nets represented in coverage/additionality.
- GiveWell's ITN analysis explicitly models effective protection relative to trial contexts, pre-existing nets, durability, shortened distribution intervals, and other funders' responses. It gives approximately two effective protection years in one reference example; DRC has separate adjustments. Its calculations include costs beyond the net commodity, with confidential partner-cost presentation conventions. Our $3 cash and $3 partner-resource assumptions therefore cannot be treated as a literal replication of its numerator. [ITN analysis](https://www.givewell.org/international/technical/programs/insecticide-treated-nets).
- GiveWell's AMF review describes net purchase by AMF and distribution by partners; its historical comprehensive output costing includes commodity, delivery, organizational and government in-kind inputs. This supports keeping our donor and gross-package costs separate, not interpreting all cofunding as free or adding it twice. [AMF review, December 2023](https://www.givewell.org/charities/amf).

Diagnostic reruns, **not recommended replacements**: additionality=1 gives $4,860.09/10Q; also transport=1 gives $2,428.17; also full three trial-equivalent protection years gives $1,227.97. This shows the disagreement's location without proving the unshrunk case true.

## NI: larger calibration problem

Eligible catchment infants=`10000*.9/25=360`; deaths=`360*.3*.12*.03*.5=.1944`.

GiveWell's currently available technical narrative estimates coverage effects of 9–18 percentage points and roughly 50% vaccine mortality efficacy. Its cost table uses $18.21 per **enrolled** infant, already including noncompleters and adjusted repeat enrollment; extra government vaccine costs use **additional vaccinated children**, a different denominator. Our $25 per **catchment** infant, .12 full-course-equivalent increment and .03 residual disease risk are not reproduced parameters. The central .3 funding factor removes 70% of remaining benefit and is the largest isolated penalty. [NI technical analysis](https://www.givewell.org/international/technical/programs/new-incentives).

Diagnostic reruns: fundingAdditionality=1 gives $12,921.90/10Q; additionally disease risk=.06 gives $6,458.12. The latter is a diagnostic doubling, not a verified current risk for all marginal states. The .12 coverage term already includes partial-course/transport standardization; .5 must mean standardized-course efficacy, not a second partial-series discount. Prior wording was corrected accordingly. Do not equate $25/catchment child and $18.21/enrolled child without the missing enrollment-to-catchment ratio.

## Corrections versus legitimate differences

1. **Arithmetic accepted.** No extra factor of ten or repeated identical time interval found in central calculations.
2. **Material model-quality correction:** label the centers as conservative constructed scenarios, not independently calibrated expected values, until reconciled with matched campaign/state mortality, output cost, and replacement evidence. A separate ordinary-gift allocation uncertainty is legitimate; assuming displaced GiveWell funding produces zero health elsewhere is not a whole-donation welfare estimate.
3. **Do not stack a GiveWell death benchmark and our entire adjustment ladder.** Either reproduce native causal inputs with nonoverlapping corrections, or use GiveWell's death rate as an external calibration and add only demonstrably new scope/recipient/timing adjustments. Keep both as visible comparison scenarios.
4. **Separate modeled death count from survival QALYs.** Display cash/death, discounted Q/death and cash/10Q so readers can locate disagreement. Fifty QALYs per life may be an undiscounted illustration, not the shared base case of a 3%-discounted model.
5. **Cost labels:** retain gross associated package rather than claiming a net societal ICER. Partner costs and transfers have different opportunity-cost treatment; our NI $15 per catchment infant is not GiveWell's cost per induced vaccination.
6. **Evidence bounds:** today's inspected GiveWell pages contain differently dated technical inputs and historical grant aggregates. They do not establish a price for the next unrestricted dollar. This audit did not reproduce the underlying full spreadsheets or authorize a new central calibration.

Recommended immediate public correction: add the native-unit comparison and explicit conservative-prior warning. Recommended research correction: build one matched GiveWell-calibrated mortality scenario for each organization, preserve current centers as conservative sensitivities if their combined downside is no longer judged the actual mean. Do not mechanically average or retune to the user's threshold.
