# Localization test: SF templates → Chicago

**Question.** Can three intervention templates factored from San Francisco BOTECs produce Chicago draft estimates using only local parameter lookups, and where does that break?

**Answer.** Running the templates takes seconds. Their output is only as good as the lookups behind it, and most of those lookups failed. Only the cost inputs were actually localized. Seven of the ten local values were copied from SF judgments, and the organization-level data was missing or stale. The templates scale the mechanics. They do not yet scale the evidence.

## Timing (measured, agent wall clock)

| Phase | Start (UTC) | End (UTC) | Minutes |
|---|---|---|---|
| Web lookups (6 searches, 2 fetches, run in parallel) | 18:37:21 | 18:38:10 | 0.8 |
| Writing 3 parameter files + 3 recipes, evaluating | 18:38:10 | 18:39:17 | 1.1 |
| **Total, lookup to schema-valid drafts** | | | **1.9** |

Model: Claude Opus 5.5 (`claude-opus-5-5`). The 1.9 minutes do not include the template factoring done beforehand, which is a one-time cost per archetype. For comparison, the repo's research-effort rules cap an initial report at 5 minutes and an in-depth review at 15.

## Results (USD per 10 QALYs)

| Archetype | SF central | Chicago central | Chicago simulated p10 / p50 / p90 | What actually changed |
|---|---|---|---|---|
| Naloxone distribution | $56,330 (SFAF, 2025) | $31,380 (CRA, 2017 data) | $10.9k / $41.8k / $204k | Reversals per unit 0.34 vs 0.069 in SF (5x), partly offset by $55/kit vs $20/dose |
| Lifestyle diabetes prevention | $2.10M (YMCA SF) | $1.66M (YMCA Metro Chicago, nominal) | $0.66M / $3.58M / $29.9M | Only cost: $475 vs $600 |
| Tai chi fall prevention | $2.34M (Self-Help) | $1.82M (no org found) | $1.10M / $3.53M / $16.9M | Only the instructor wage: $40 vs $60/hour |

Every Chicago record is `draft` with `very-low` confidence. None of these is a giving recommendation.

The simulated p50 sits above the central point in every row. That is expected for a ratio of skewed inputs. The simulated range is narrower than the legacy SF corner scenarios because inputs are drawn independently (see `simulation.notes` in each record).

## Where it broke

1. **Organization outputs, not local parameters, were the bottleneck.** No current Chicago Recovery Alliance dose or reversal counts were findable. The only paired numbers come from a 2017 city press release ($250,000 → 4,541 kits → 1,544 reversals), and they were seen only in a search summary. The direct fetch returned HTTP 403, so the record marks them as unverified. The 5x reversal-yield difference from SF drives the whole Chicago result and may reflect 2017 heroin-era conditions, self-reported peer reversals, or reversals not tied to city-funded kits.
2. **Unit mismatch.** The template counts doses. Chicago reports kits. The test kept both cost and yield per kit so the ratio stays consistent. The template should gain a `dosesPerUnit` conversion parameter instead.
3. **Judgment parameters didn't localize; they were copied.** Marginal yield retention, survival per reversal, DPP transfer, tai chi transfer, additionality and support cost all fell back to the SF distribution. The schema records them honestly as `judgment` with a "transferred unchanged" rationale. But a reader comparing SF and Chicago sees differences only in cost. **This is the main threat to the "archetypes × local parameters" bet:** the parameters that matter most (counterfactual rescue, additionality) are the hardest to look up.
4. **Archetype → organization mapping failed for tai chi.** No Chicago Tai Ji Quan: Moving for Better Balance provider turned up. The template still prices the archetype for the geography, which is useful for "what should exist here?", but the record is attached to an `Unassigned` placeholder org.
5. **The organization's own price was not found for DPP.** A neighboring Y association's flyer price ($475, Berwyn, undated) stood in. Illinois Medicaid covers National DPP for members aged 18 to 64 (fee-for-service claims opened August 2024), so additionality was judged the same as SF's Medi-Cal situation. That was the one judgment the lookup actually informed.
6. **Price-year drift.** Naloxone cost is in 2017 dollars and the wage is from OEWS 2022 scaled by a guessed growth factor. The schema records `priceYear`, but there is no shared deflator table yet.
7. **Structural disagreement with existing research.** The repo already has a Chicago Recovery Alliance model (`data/chicago/cra-pre-recalibration-model.json`). It uses population reach × hazard × effect with whole-recipient cost, not doses × yield. Its central is about $4.08M per 10 QALYs, roughly 130x this template's $31k. Same organization, same archetype, two model structures, two orders of magnitude apart. The repository needs a `population-reach` variant of the naloxone template and a rule that `compare()` flags records with different structures for the same key.

## What to change before scaling

- Add `dosesPerUnit` and a `priceYear` deflator to the naloxone template.
- Make "transferred from another geography" a first-class basis (`transferred-judgment`) that automatically widens the distribution, so copied judgments look less certain than local ones.
- Add an org-data intake form (outputs, budget, funding gap) so organizations can supply the inputs that failed here, under the self-submission rules in [README.md](README.md).
- Give each archetype a "provider finder" lookup recipe (e.g. Area Agency on Aging program lists for falls prevention, the CDC DPRP registry for DPP).

## Reproduce

```bash
node docs/open-botec/tools/evaluate.mjs docs/open-botec/estimates/us-il-chicago/cra-naloxone.recipe.json
node --test docs/open-botec/tools/check.test.mjs
```

Sources found in the lookups: [Chicago press release, 2017](https://chicago.gov/city/en/depts/mayor/press_room/press_releases/2017/july/OpioidAddictionTreatment.html) (403 on fetch), [Illinois HFS DPP notice](https://hfs.illinois.gov/medicalproviders/notices/notice.prn240805c.html), [BLS OEWS 39-9031, May 2022](https://www.bls.gov/oes/2022/may/oes399031.htm), [Berwyn Y DPP flyer](https://sportscarnival.com/userfiles/35/files/DPP%20Flyer%202023.pdf), [CDPH 2024 summer opioid response](https://chicago.gov/content/dam/city/depts/cdph/overcome-opioids/resources/2024/CDPH-SummerOpioidResponseExecutive%20Summary_FA.pdf).
