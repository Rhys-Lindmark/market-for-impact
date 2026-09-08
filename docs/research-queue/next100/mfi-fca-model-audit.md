# Independent FCA model audit

2026-09-08. Audited `/private/tmp/mfi-fca-full-model-packet.md`; research-only, no Site changes.

**Verdict: accept arithmetic and the cautious donor conclusion; correct trial-denominator language and make the trial-dose redesign explicit before implementation.** Central $3.2M/10 caregiver QALYs is a conditional, judgment-led illustration, not measured FCA cost-effectiveness. It need not be numerically revised merely because the evidence limitations below are now clearer.

## Required evidence/copy corrections

1. **PTC randomized 73, not 60.** The [primary full text, Terracciano et al. 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7302999/) was successfully read in this audit, superseding the packet's retrieval limitation. Of 37 allocated to PTC, only 24 enrolled/completed baseline; all 36 controls completed baseline. Baseline timing differed by arm. There were 55 second and 44 third assessments. Analyses included participants with follow-up, not all randomized people. Describe the authors' ITT terminology as available-case/modified ITT, with potentially important postrandomization selection.
2. **94% is conditional on starting.** It is 49/52 starters across both arms, not 94% of everyone offered or randomized. Control participants received PTC between assessments two and three: third-assessment results are not an untreated randomized durability comparison. The reported burden/depression/self-confidence effect sizes match the abstract, but no PTC preference-based QALY outcome was measured. This weakens transport and durability confidence; do not mechanically multiply START QALYs by 94% or 24/37.
3. Replace “trial anchors are allocation-based” with: “The external START estimate already incorporates its trial engagement pattern and missing-data limitations. PTC has differential postrandomization missingness. Local relative engagement is part of the judgmental transfer factor; a separate completion multiplier would require a defined estimand.” This retains the sensible protection against double-discounting without overstating the evidence.

## START anchor: verified, but not intervention-matched

[NIHR Table 15, directly retrieved](https://www.ncbi.nlm.nih.gov/books/NBK262909/table/table15/?report=objectonly), reports 24-month incremental QALYs **0.03 (95% CI −0.01 to 0.06)**, cost/QALY complete-data sample **144**, incremental health/social-care cost **£336 (−£223 to £895), 2009–10 prices**, and **£11,200/QALY**. These packet values are correct. The [primary results](https://www.ncbi.nlm.nih.gov/books/NBK262909/) concern eight individual START sessions, not six PTC groups. This is an integrated 24-month QALY difference, not annual utility. The central retained fraction 0.25 is a judgment about the integral, not proof of six-month PTC durability. The favorable full START-equivalence assumption is optimistic; its $111K result must not be presented as a supported local lower bound. Null and negative-Q scenarios are appropriate.

## Dose and cost corrections

The [current FCA page](https://www.caregiver.org/connecting-caregivers/events-classes/powerful-tools-for-caregivers/) establishes a free six-week advertised program, not a presently available restricted funding offer. The packet's historical 90-minute cohort citation remains indexed-only; no claim that every current FCA class uses that duration is warranted.

The central budget purchases **six 120-minute sessions**, whereas the documented historical FCA schedule was 90 minutes. Label the modeled unit “conditional trial-dose PTC expansion for SF dementia caregivers”; it is not a verified existing FCA offer. The $6,000 construction is internally correct: 24 delivery hours + 24 other hours, at $100/hour, plus $1,200. At 90 minutes, holding every other placeholder fixed, that would be $5,400, or $540 per ten-person enrollee, and nine participant hours rather than twelve. Those are mechanical cost sensitivities only: do not silently switch duration while retaining assumed fidelity. Staff rates, enrollment, language/access, licensing and training amortization remain unquoted judgments. Additional replacement care may dominate the placeholder allowance.

## Arithmetic acceptance

`Q = .03 × transfer × retainedIntegral × additionality; costPer10 = 10 × cost/Q`.

| Scenario | Q/enrollee | Donor $/10Q | Expanded $/10Q |
|---|---:|---:|---:|
| Central | .001875 | 3,200,000 | 4,800,000 |
| Favorable | .0225 | 111,111 | 244,444 |
| Pessimistic | .00001875 | 800,000,000 | 960,000,000 |

Central harm scenario is −.000625 Q/enrollee; do not output an attractive negative ratio. Threshold costs of $18.75 central and $225 favorable are correct. Expanded resources add participant time but omit uncertain additional respite, travel and healthcare; keep “expanded-resource illustration,” not “full societal cost.”

## Respite is not course funding

The [June 3, 2026 SFHSA primary memorandum](https://www.sfhsa.org/es/sites/default/files/media/document/2026-05/family_caregiver_alliance_temporary_respite_care_fy26-30.pdf) matches the packet's $3,453,460 base, $345,346 contingency, July 2026–June 2030 term and $863,365 annual county funding. Its service objectives are at least 300 consumers and 19,000 respite hours annually. It is an authorization request for temporary respite, not a PTC appropriation or proof of money spent. Its wellbeing targets are not causal effects. Do not use budget/consumer ratios as PTC costs, unused ceilings as donation capacity, or publicly funded respite as an unpriced incremental donor benefit. If a new course induces extra respite, add that real resource cost; if existing respite is merely reallocated, assess opportunity cost and displaced beneficiaries. The packet already preserves these boundaries correctly.

**Implementation acceptance:** retain central/scenario numbers with the corrections above; label the estimate conditional and low-confidence. Actual next cohort, dose, SF/dementia mix, marginal cost, funded baseline and donation restriction remain unverified. There is no evidence-backed claim of an available under-$100K/10Q opportunity.
