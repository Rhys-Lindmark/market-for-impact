# MELP/AbleCloset: independent clinical and alternative-access assessment

Actual start: 2026-09-11 01:11:35 UTC; assessment completed: 2026-09-11 01:13:05 UTC. This assessment was written **without reading MELP/AbleCloset draft model coefficients or outputs**. Reused the controlled-study evidence in `/private/tmp/mfi-recares-utility-evidence-check.md` and independently checked current official loan/coverage sources. Dispatch metadata: root-confirmed gpt-6-astra / low (Astra Lite). No Site edits or outreach.

## Evidence conclusion before inspecting model

Lending creates a credible **earlier access / temporary-need** mechanism, not evidence of a larger utility effect than reuse. For many borrowers, the correct comparator is equipment arriving later through insurance, purchase or another loan closet—not permanent lack of equipment. A six-month permitted loan is not six months of incremental health. Adult MELP does not publish a numeric maximum loan period in the inspected FAQ; do not transfer pediatric AbleCloset's six-month rule to all adult items.

No direct controlled MELP/AbleCloset recipient QALY estimate or local time-to-alternative distribution was established. Existing trials support possible functional benefit but leave a positive generic-utility coefficient unvalidated. Null and harm must remain possible; do not fit priors to a threshold.

## Official operations change the counterfactual

[AbleCloset's instructions](https://ablecloset.com/how-it-works/) explicitly frame pediatric loans as trial equipment and a bridge while obtaining permanent equipment. Most items permit six months; some recreational equipment is limited to two weeks–two months. Extensions can be requested. Families can borrow up to three items, regardless of income. They must have a therapist available to check safety/sizing; volunteers do not provide those services. Thus loan counts are neither unique children nor verified safe use, and multiple items should not stack independent generic QALY gains. The rule is an administrative limit, not observed use duration or insurance wait.

[MELP's FAQ](https://www.freemedequip.org/faq/) asks users to return equipment when ready, but supplies no numeric universal loan deadline. Pickup is first-come-first-served, with no delivery; fit can be tried at pickup. It refers users to ReCARES as an alternative and welcomes users outside San Mateo County. This creates concrete transport, stock and alternative-provider considerations. It does not measure how quickly those alternatives are accessible.

MELP's [inventory page](https://www.freemedequip.org/get-equipment/) includes mobility/bathing devices **and absorbent underwear**. Consumable supplies are not reusable loans; their duration must follow quantity/use, not durable-device lifespan. A returned device can serve later users, but annual distribution counts already include such turnover. Do not multiply observed annual loans by an additional reuse factor.

The [December 2025 public district packet](https://www.peninsulahealthcaredistrict.org/files/b7631a8fd/12.11%2BBoard%2BPacket.pdf) says an occupational therapist trains volunteers and equipment is inspected/repaired; this is stronger process support than an unsupported assumption of zero fitting support. It is still not proof every child/adult receives individual assessment or successful long-term use. It also mentions international redirection of surplus/unusable items, so local warehouses do not establish 100% Bay health.

## Public coverage is a live baseline, not immediate guaranteed access

[Medicare](https://www.medicare.gov/coverage/durable-medical-equipment-dme-coverage) covers eligible medically necessary home-use DME, including walkers, wheelchairs and commodes; ordering-provider/supplier conditions and usual coinsurance apply. Rental can itself be covered. Therefore lending may replace a covered rental or purchase, reduce coinsurance without changing health, or bridge an actual delivery gap. These pathways cannot all receive the same full-duration health credit.

[CMS/HHS prior-authorization guidance](https://www.hhs.gov/guidance/document/prior-authorization-process-certain-durable-medical-equipment-prosthetics-orthotics-and-1) says standard review was shortened to no more than seven calendar days effective January 2025 for affected DMEPOS requests. **That is a decision deadline, not observed order-to-delivery time**, and does not apply identically to every item/payer. Do not use it to assume immediate access or, conversely, invent a months-long delay for everyone. Clinical evaluation, documentation, fabrication, supplier availability and transport can add time. Recent future-effective code changes should not be treated as already in force.

The [San Mateo County equipment directory](https://www.smchealth.org/sites/main/files/file-attachments/hh2024_english.pdf?1709940717=) lists suppliers and other loan channels alongside MELP. This supports availability of alternative mechanisms, not an estimated fraction obtaining equivalent equipment promptly. Pediatric eligibility and custom-fitting requirements differ from adult Medicare; do not use elderly coverage rules as the pediatric counterfactual.

## Controlled clinical evidence carried forward

- [Polesel et al., 2025](https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2841747): 75 older adults, randomized walking-aid provision with physiotherapist assessment/training. Ninety-day mobility and fear-of-falling improved, but between-group 0–100 health-rating difference was −1.17 (95% CI −7.34 to 4.99). This rating is not preference-weighted utility; dividing by 100 would not produce QALYs. A null health-rating effect does not refute every functional benefit, but it does not support a precise positive utility duration.
- [Gupta et al., 2006](https://pubmed.ncbi.nlm.nih.gov/17035442/): 31 post-rehabilitation COPD patients randomized to home rollator/usual care for eight weeks. Acute walking help did not establish between-group home quality-of-life improvement; 8/18 used it fewer than three times weekly. This is low frequency, not measured abandonment. Short loans do not automatically fix adherence.
- [BATH-OUT feasibility trial](https://link.springer.com/article/10.1186/s12889-018-6200-4): 60 participants, immediate versus routine-wait **installed level-access showers**; three-month EQ-5D change difference .09, CI −.003 to .18. It supports the relevance of earlier access, but an intensive £4,878 average home adaptation is not a portable shower chair. Later receipt by controls limits incremental duration. Do not transplant this effect or extrapolate it to children.
- [Larger BATH-OUT funder results](https://sscr.nihr.ac.uk/research/care-economics/bath-out/) support a short-run physical-health effect and higher trial QALYs, without a retrieved numeric QALY coefficient on the page. High/differential attrition and later attenuation remain limitations. This is contextual corroboration, not a loan-closet scalar.

No primary controlled pediatric loan-equipment utility coefficient was established in this bounded search. That is a search limitation, not a claim none exists. Adult walking-aid findings do not justify generic pediatric developmental/lifetime benefits.

## Model-review criteria fixed before seeing draft

1. For each nonoverlapping person/need episode, credit health only while useful equipment is available **with the gift and not equivalently available without it**. Operationally the horizon is bounded by actual safe use, resolution of need, loan return and alternative acquisition, not only device durability.
2. A defensible finite representation is `integral[utility difference × probability of additional safe use at time t] dt − harms`. If using a simpler duration scalar, say whether it already includes alternative catch-up; avoid multiplying another delay haircut that charges the same loss twice.
3. Separate temporary postoperative need, pediatric fitting/trial bridge, prolonged unmet access, and consumables where data allow. No outcome frequencies are currently established for these groups; shares must be marked priors.
4. Loan duration can be **shorter** than indefinite reuse, but loan programs can reuse inventory more often. Neither direction establishes superior whole-gift QALYs without cost and unique-episode data. Do not assume ReCARES recipients keep useful equipment indefinitely either.
5. Retain full legal-entity gift cost; no duplicate MELP/AbleCloset charity entries. Current official site identifies both under EIN 27-1212734. Preserve Bay dilution, independent harm, funding additionality and unknown external fitting/transport/resource costs.
6. Distinguish cash additionality from recipient alternatives. A public grant may already fund warehouse capacity; privately buying the same capacity is not new health. Conversely, payer coverage on paper does not establish actual timely access.

Highest-value local evidence: unique borrowers by primary device class; actual pickup/return/use dates; planned alternative source and expected/actual arrival; resolution of temporary need; therapist fit/safety follow-up; and whether incremental donations change inventory/slots. A simple follow-up survey can inform these inputs, but does not by itself identify causal utility. No outreach is authorized or performed.

Status: evidence assessment complete; await final draft for independent full-model/content audit. No MELP coefficients or results have been inspected.
