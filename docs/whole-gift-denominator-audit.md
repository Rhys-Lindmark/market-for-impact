# Whole-gift denominator audit: Clinic, OA, PVF and GLIDE

September 9, 2026 UTC. Bounded methodological review of existing packets; no assumptions or Site files changed. Clinical anchor checks below were refreshed today.

## Decision

**Yes: the corrections fix selected-program donor-cost boundaries but do not yet estimate expected total organization health.** All four explicitly retain substantial unquantified activity. Their accounting and finite-health tests can be accepted while their proposed use as comparable whole-organization expected-value rankings is not. This is an estimand/completeness problem, not evidence that their calculations are wrong, and not a reason to restore program-only gift prices.

Calling them “whole-gift cost with partial health” is honest diagnostic labeling, but does not satisfy the user's request for best estimates of ordinary gifts. In particular, Clinic's `BEST GUESS — SF` label is inconsistent with that broader request. Similar central prices must not become authoritative organization ranks merely because lower-page caveats mention omitted benefits.

The direction needs care: setting omitted positive health to zero tends to understate benefit and overstate dollars/QALY. These are **not formal lower bounds on health or upper bounds on dollars/QALY**, because omitted harms, crowd-out and speculative positive included priors also exist. Nor is a chosen central scenario automatically an expected value: no probability distribution or joint-parameter expectation is specified.

## What each packet currently represents

| Packet and exact source | Quantified pathway | Missing health scope |
| --- | --- | --- |
| `/private/tmp/mfi-clinic-portfolio-model.json`, `review.md` | Selected painful simple extraction; disjoint short-term depressive-symptom counseling | 65% general medical/food allocation entirely unquantified; most non-target dental and mental courses also omitted. Only 20%×.4 + 15%×.6 = 17% of initial spending enters targeted courses before completion, financing and deduplication. |
| `/private/tmp/mfi-oa-portfolio-model.json`, `review.md` | Selected positive-FIT follow-up, first-eye cataract, symptomatic hernia | Gynecology, orthopedics/podiatry, head/neck, urology, dermatology/plastic, vascular and nonselected GI/general/eye outcomes. Target-weighted allocation is 37%×.5 + 13%×.45 + 3%×.65 = 26.3%, before further filters. |
| `/private/tmp/mfi-pvf-portfolio-model.json`, `research.md` | First-eye support receiving 10% of gift | 10% other clinical care, 15% education/research, 40% building/capital and 25% central support. Non-cataract surgery, low vision and education effects absent. Infrastructure/support are enabling mechanisms, not separate patients. |
| `/private/tmp/mfi-glide-portfolio-model.json`, `review.md` | 10% overdose-access and 10% housing allocation | 22% meals, 10% family/youth, 5% violence/women support, 7% other HEAT/navigation, 4% policy/community plus support/other. MOUD access and other HEAT clinical outcomes absent. |

These percentages describe modeled spending eligibility, **not fractions of total actual health covered**. Overhead itself should not receive an invented health bonus. Conversely, donated building/coordination capacity can enable more than a small direct-subsidy branch; marginal capacity should propagate through the service-production model once, not disappear because accounting calls it infrastructure.

## Quantitative materiality, without inventing omitted benefit

All figures are **additional all-region QALYs per hypothetical $100,000**, holding costs and current geographic proportions fixed. For GLIDE, use its current effective aggregate SF fraction (.95); omitted branches could have different geography. These are algebraic diagnostics, not estimated omitted effects or target-fitting inputs.

| Organization | Current modeled all-Q | Extra Q to halve current price | Extra Q to reduce price tenfold | Extra Q for $1M/10 SF Q | Extra Q for $100K/10 SF Q |
| --- | ---: | ---: | ---: | ---: | ---: |
| Clinic | .044653 | .044653 | .401876 | 1.383919 | 14.241061 |
| OA | .064065 | .064065 | .576582 | 12.435935 | 124.935935 |
| PVF | .140000 | .140000 | 1.260000 | 2.360000 | 24.860000 |
| GLIDE | .347199 | .347199 | 3.124791 | .705433 | 10.179117 |

Formula: current price = 10G/(sQ); halving requires omitted Q=Q; tenfold reduction requires 9Q; target price P requires omitted Q = 10G/(sP) − Q. No negative values occur in these examples. Holding resource numerator fixed yields the same relative price changes, but adding real clinical pathways can also increase outside resources, so that shortcut cannot establish a new societal ratio.

Thus quite small omitted QALYs would materially change Clinic/OA ratios. This does not prove that omitted health reaches a particular target, nor that a low SF-residence prior is wrong. It demonstrates why a near-zero evidence-selected denominator cannot safely rank the entire clinic/surgical portfolio.

## Actionable repair, ordered by tractability

### 1. Clinic: model a defined general-medical cohort, not “care visits × QALYs”

Official [medical services](https://www.clinicbythebay.org/services) include chronic care, prescription support, acute/minor procedures, rheumatology and referrals. A defensible next model can have:

- **Cardiovascular risk treatment/access:** dollars → unique high-risk uncontrolled patients → incremental sustained treatment/adherence versus current public/free treatment → bounded change in event risk during funded exposure → finite survivor and morbidity difference. Explicit priors may stand in for unobserved case mix, achieved BP change, uptake and retention. They require plausible patient-risk and exposure anchors; absence of local RCT data does not justify assigning all benefit zero.
- **Acute or rheumatologic symptom relief:** separate unique patients with a documented symptom burden, probability of effective treatment, signed utility relief and time until spontaneous/alternative relief. Use short, bounded person-periods. Do not add a universal utility award to wellness visits.
- **Referral-enabled care:** only a diagnosis-mix and completion bridge that includes outside diagnostic/treatment resources. Deduplicate from direct-care and OA/PVF pathways; referral counts alone have no QALY meaning.

Primary [SPRINT](https://pubmed.ncbi.nlm.nih.gov/26551272/) supports a vascular-treatment mechanism but compares intensive with standard treatment in selected older high-risk patients without diabetes, not generic uninsured access or the clinic's diabetes cohort. It must not be imported wholesale. The randomized [Oregon insurance experiment](https://www.nejm.org/doi/full/10.1056/NEJMsa1212321) improved mental-health/access outcomes but did not find significant measured BP, lipid or HbA1c improvements at two years. That is a useful counterweight against assuming every new medical visit produces strong vascular gains; it does not prove targeted effective treatment has zero benefit.

Root should authorize a substantive Clinic denominator revision before ranking. The current dental/counseling packet can remain a tested component diagnostic. audit_sfphf independently agrees and has identified the same medical branches.

### 2. OA: strongest available portfolio-mix basis for a broader model

The [2025 annual report](https://www.operationaccess.org/s/Operation-Access-Annual-Report-2025.pdf) already supplies specialty counts. Use these to construct **diagnosis-mixture priors within specialties**, not fixed QALYs per service. Priority: symptomatic gynecology, orthopedics/podiatry, urology and non-hernia general surgery; together they cover large omitted service shares. Plausible finite symptom/function bridges can use external condition-specific health-state and earlier-versus-later treatment evidence, with signed response, complications, alternative-care catchup and one person-level utility ceiling.

Genuine missing variables are diagnosis, severity, procedures versus consults, unique patients, wait reduction and repeat services. These do not all require precise clinic observations before modeling: use defensible bounded priors where evidence exists. Do not assign a cataract or hernia effect to an entire specialty. The previous reasoning “this finite revision did not establish a bridge” describes unfinished research, not evidence for a zero expected contribution.

### 3. GLIDE: extend clinical HEAT before speculative broad social multipliers

[HEAT](https://www.glide.org/heat/) documents treatment navigation including MOUD. Start with added initiation and retained person-time on effective treatment versus existing SFDPH/partner access. Reuse one person-level overdose survival model with mutually exclusive rescue-only/MOUD/both exposure states, or a joint hazard calculation. **Do not add two saved-life estimates for the same person.** HIV/HCV linkage can be included only after testing→diagnosis→additional treatment→finite clinical outcome, with public costs and existing services in baseline.

Meals/food are plausibly health-bearing but meals served are not days of starvation averted. First distinguish shortfall prevention, chronic-condition nutrition and substitution for other food; apply bounded nutrition evidence and consumption priors. Family/violence support can have acute safety and symptom pathways, but require recipient/household composition, recurrence and overlap. Broad policy effects remain genuinely less identifiable and should receive an explicit uncertain model only with a concrete mechanism—not an arbitrary QALY-per-dollar remainder.

### 4. PVF: repair production/attribution before adding branches

[PVF's current social model](https://pacificvisionfoundation.org/about/what-we-do/) combines care, infrastructure and training. The [impact report](https://pacificvisionfoundation.org/wp-content/uploads/2026/07/FINAL-DIGITAL-PVF-Impact-Report-2025.pdf) identifies non-cataract and low-vision activity. First clarify whether an ordinary gift changes charitable treatment, broadly used facility capacity, debt sustainability or endowment draw; a standalone charity subsidy allocation need not capture all clinical production affected by support.

Then add non-cataract sight-threatening disease and low-vision rehabilitation with condition-specific vision trajectories and finite earlier-care counterfactuals. Clinical existence is established; annual unique mix and gift causation are not. Second-eye benefits must use incremental binocular function, not another first-eye coefficient. Training/research effects need additional trainee capacity or practice change, downstream patient volume, displacement and geographic attribution; current evidence does not support a generic perpetual alumni multiplier. These are the most genuinely unresolved mechanisms in this set, not a reason to multiply existing first-eye benefit by ten.

## Cross-packet methodological acceptance standard

1. **Every material activity gets a causal disposition:** quantified direct health, enabling input allocated into that health, health plausibly negligible with reasons, or an explicit unresolved distribution/model. “No convenient trial” is not a zero-effect rationale.
2. **Estimate the marginal ordinary gift, not the spending average.** Use a single coherent budget/capacity counterfactual for donations, public contracts, donor replacement and infrastructure. Costs and additional patient outcomes should arise from the same scenario.
3. **Best estimate means a reasoned expectation.** Choose and document distributions or a weighted coherent scenario mixture, including null/harm probability and parameter correlation. Report E[Q_SF] for a fixed gift and 10G/E[Q_SF] when positive; do not average positive-only ratios or discard harmful outcomes. A central-point calculation is a central scenario, not automatically that expectation.
4. **Avoid accumulated one-sided discounts masquerading as neutrality.** Selection, completion, funding replacement, clinical transfer and counterfactual catchup may each be needed, but specify distinct events and dependence. A trial ITT effect already incorporates some failures. Do not stack catchup twice when a source effect already compares later usual care. Finite horizons remain necessary, but must reflect the effect/counterfactual rather than a blanket short conservative truncation.
5. **Do not deduplicate away uncounted health.** A disjoint ledger is safe but can omit distinct marginal utility gains. Where feasible model joint health states bounded by patient utility, crediting combined treatment once. Do not merely multiply all branches by arbitrary overlap haircuts, then assume the remainder has zero benefit.
6. **Keep costs matched to the expanded outcome model.** Donated clinical inputs are not free; transfers are not additional resources. Newly quantified referrals/treatment may entail public costs and downstream savings. Separately report donor perspective and a clearly scoped resource perspective; incomplete gross envelopes are not full societal ICERs.
7. **Publication gate:** arithmetic/schema acceptance remains valuable. Expected-organization ranking acceptance additionally requires a credible material-omission audit. There is no universal percentage-of-spending cutoff; test whether plausible unresolved health changes the decision. Until repaired, preserve component diagnostics with labels and do not silently rank them as total expected impact.

## Recommended next step

Revise **Clinic and OA denominators first**, because direct health-bearing services and delivery are established and omitted benefits can easily dominate the small included denominator. In parallel planning, specify GLIDE's joint HEAT treatment model and PVF's gift-to-capacity attribution. Do not implement a blanket uplift, inverse-allocation extrapolation or threshold-matching residual. If a needed variable remains genuinely unconstrained after bounded source work, state that the total expected-value estimate is unresolved rather than presenting a partial ratio as the answer.

No report/model edits made by this audit. Prior independent numerical acceptances should be understood as component/accounting acceptance, not proof of total-organization completeness.
