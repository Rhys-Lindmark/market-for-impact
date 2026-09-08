# Reproducible first universe triage sample:100 records

Completed2026-09-08. **100 distinct IRS EIN records received a documented metadata screen;10 received primary service-page checks;0 received completed CEA reports in this phase.** No new gift offers, utility estimates or cost-effectiveness rankings. No Site edits/outreach.

## Files

- `mfi-universe-sample100.csv`:100 rows, unique EIN/source identifiers, bucket and deterministic selection hash, frozen contract matches/scopes, individual analyst intervention hypothesis, local-relevance limitation, screen disposition and primary-source check where performed.
- `mfi-universe-sample100.mjs`: reproducible selection generator (prints JSON; does not alter source data).
- `mfi-universe-sample100.selection.json`: selected identifiers, exclusion log, eligible-pool counts and input hashes.

## Sampling frame and limits

Read the design in `/private/tmp/mfi-next100-universe-triage-design.md`. Used equivalent frozen copies in `/Users/rhyslindmark/Documents/Codex/2026-08-29/okay-you-re-gonna-make-this/work/market-for-impact-large-bay-impact`, not fresh IRS/DataSF downloads. IRS6,688 records; contractor548 source-name groups; contracts1,784. All selected records are from the IRS frame; contractor scopes enrich exact normalized-name matches. **Contractor-only organizations are not represented** and require a separate sample. We do not add the frames or assert exact unique legal-entity overlap.

Quotas: clinical15, basic-needs15, youth/education10, environment/safety10, civic/legal10, research5, other5, unknown30. Total100. This departs from the design's suggested120 allocation to honor the requested100 and reserves30% for missing/unrecognized classifications. Bucket is the frozen NTEE routing, not verified purpose; misclassifications remain visible (e.g., Brilliant Corners in youth, housing names in environment).

Within each bucket sort descending by a transparent metadata score: one point for a predefined service/health keyword in name or contract scope, plus one for an exact normalized-name contract match. Break ties by ascending SHA256(`mfi-sample100-v1|EIN`). The script records the complete keyword expression. This is a **purposive, stratified discovery sample with hash tie-breaking**, not a uniform random sample, representative survey or basis for population prevalence estimates. It favors documentation/service signals and may miss unusually named high-value entities. All strata filled without replacement.

Existing-review screening scans current non-universe JSON EIN/organization fields and current charity-report slugs, supplemented by conservative known-name/fiscal-sponsor aliases. It excludes78 IRS records. These filters are conservative, not certified identity resolution: overlapping names/sponsors can exclude an otherwise distinct program. All exclusions are logged. Selected records are **not identified as previously modeled by these checks**, not100 certified independent donation recipients. PRC, fiscal sponsors, property entities and other aliases still require parent/entity reconciliation before promotion or counting as net-new legal organizations. Exact normalized-name contract links are signals, never verified EIN crosswalks.

No minimum revenue threshold, no automatic exclusion of missing/zero revenue, no contractor-authority-to-room conversion. The source's old review flags were not trusted as current coverage.

## Snapshot provenance

- irs-exempt-universe-v1.json: generated 2026-08-30T17:55:58.840Z; raw-fileSHA256 a54b12fd374fbbb8538a3a5c7cea230631f4b2df1d39aed53dba96aec3c9f725
- candidate-universe-v1.json: generated 2026-08-30T15:40:37.403Z; raw-fileSHA256 9724663868f3b4d9b9f0c72b429d0efb12e1ff45d8831b7221ee87e9392dbc69
- public-funding-v1.json: generated 2026-08-30T15:40:37.403Z; raw-fileSHA256 00dd025a7b95dc5f52e50132639b944b3067ca7bc19a8765cb12794b4371632b

The design's semantic hashes and these raw-file hashes measure different representations; they should not be compared as if equal. Source dates remain Aug2026, while primary page retrieval is Sept8. Reproduction requires these inputs and the same current-review exclusions; the saved selected-ID/exclusion log freezes this run even if the report registry subsequently grows.

## Brief screening method and honest interpretations

All100 named rows were inspected as a list with name, classification and available scope; each received an individual short hypothesis or deferral reason.90 remain metadata-only. A hypothesis is not an assertion the entity delivers that intervention. Local relevance for unchecked records is SF filing geography and, if present, a contract signal—not confirmed service geography. Dose, causal evidence, health utility, marginal cost and funding room remain unknown; no scores substitute for those variables.

Disposition counts: priority-program-diligence=10; priority-for-identity-and-program-check=73; defer-scope-or-role=17. These are research routing decisions, not charity quality judgments. Deferral covers hospital/insurer, research, animal, cultural, religious or likely grantmaking roles without a defined human-health tranche. Religious identity alone is not grounds for excluding an actual direct-service program.

## Ten primary checks and priority rationale

These were selected deliberately from the100 for explicit service signals and mechanism diversity, not mechanically the first ten or the ten largest. Priority ranks in CSV are next-diligence ordering, not impact ratings. Primary pages were opened; dates below are retrieval2026-09-08 unless the page itself dates content. No claim of current program price follows from a page.

1. **FAMILY CAREGIVER ALLIANCE** (sample1, EIN942687079). [Primary service source](https://www.caregiver.org/connecting-caregivers/bay-area-caregiver-center/). Provider verifies SF-inclusive caregiver consultation, respite eligibility and counseling; names state/county funders. Research incremental caregiver mental-health course, not all referrals.

2. **RECOVERY SURVIVAL NETWORK** (sample2, EIN943269300). [Primary service source](https://www.rsn2000.org/). Provider verifies SF NoVA intensive case management and peer support; explicitly no longer provides introductory computer training. Current capacity and date of program text unknown.

3. **RAFIKI COALITION FOR HEALTH AND WELLNESS** (sample4, EIN943098879). [Primary service source](https://rafikicoalition.org/). Provider lists perinatal/maternal mental health and clinical support alongside alternative wellness modalities; select clinical treatment, not all wellness claims. Dose and payer gap unknown.

4. **NICOS CHINESE HEALTH COALITION** (sample5, EIN943184812). [Primary service source](https://www.cavityfreesf.org/taskforces-chinatown/). CavityFreeSF collaboration identifies NICOS leading Chinatown children oral-health task force. Completed dental service versus outreach not yet resolved; existing oral-health contract overlap.

5. **ON LOK DAY SERVICES** (sample22, EIN943101292). [Primary service source](https://www.sfhsa.org/services/disability-aging/health-promotion). SFHSA identifies On Lok30thStreet as Always Active health-promotion provider. Separate from PACE and Openhouse joint day services. New funded course and fall-specific dose unknown.

6. **LEGAL SERVICES FOR CHILDREN INC** (sample58, EIN510169463). [Primary service source](https://lsc-sf.org/what-we-do/). Provider verifies free youth legal representation and social-work support. Actual health effect, case mix and marginal staff capacity unmeasured here.

7. **LA CASA DE LAS MADRES** (sample76, EIN942330864). [Primary service source](https://www.lacasa.org/what-we-do/). Provider verifies domestic-violence shelter, crisis and counseling services. Select trauma/safety intervention; cumulative service totals not causal outcomes.

8. **APA FAMILY SUPPORT SERVICES** (sample77, EIN943164091). [Primary service source](https://www.apafss.org/about-us). Provider verifies SF family support, school-age behavioral health and Medi-Cal pilot. Distinguish home visitation from clinical therapy and current public financing.

9. **SAFE & SOUND** (sample80, EIN942455072). [Primary service source](https://safeandsound.org/what-we-do/). Provider verifies counseling, parenting and trauma-prevention services at SF sites. Current page gives bounded TALK Line hours; historical24/7 descriptions not current guarantees.

10. **BAYVIEW HUNTERS POINT FOUNDATION FOR COMMUNITY IMPROVEMENT INC** (sample97, EIN941747575). [Primary service source](https://www.bayviewci.org/behavioral-health-services). Provider verifies outpatient and SF jail methadone plus adult/youth behavioral care at Bayview. Postrelease medication continuity is analyst proposal, not verified marginal service offer.

The10 checks support identifiable service hypotheses, not ten accepted models. Most already have public funding signals; the decisive next step is identifying a narrow additional course/bottleneck and payer counterfactual. Bayview methadone continuity, NICOS completed pediatric oral care, FCA caregiver treatment/respite, and La Casa structured trauma care are especially useful next mechanism questions; do not infer comparative QALY yield yet.

## Next acceptance gates

1. Verify EIN/operating entity/sponsor and actual SF program; resolve PRC/property/fiscal-sponsor aliases before counting incremental organizations.
2. Read a program-specific budget/contract and denominator for top candidates; existing frozen scope alone is insufficient. No100-dollar-target CEA should be manufactured from metadata.
3. Find transferable causal health evidence and a clinically appropriate utility/duration bridge; preserve null/harm.
4. Seek publicly documented marginal budget, alternative care and staff capacity; room stays unknown when absent.
5. Run a separate contractor-only and lower-signal random reserve in the next phase to test blind spots introduced by the IRS filing frame and signal-first selection.
