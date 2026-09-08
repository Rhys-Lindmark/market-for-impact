# Issue 191: reproducible SF universe first-pass screen

Audit: 2026-09-07. Read-only inspection and aggregate computation, **not manual research of every record**. No Site changes. Counts below describe the available frozen snapshots, not a newly refreshed September 7 census.

## Inputs and independently recomputed counts

Base inspected: `/Users/rhyslindmark/Documents/Codex/2026-08-29/okay-you-re-gonna-make-this/work/market-for-impact-clinical-pathways/`.

| Artifact under `data/san-francisco/` | Snapshot and denominator | Recomputed coverage |
|---|---|---|
| `irs-exempt-universe-v1.json` | IRS California EO BMF, exact CITY=SAN FRANCISCO and STATE=CA; retrieved Aug 30, posting Aug 11, 2026 | **6,688 rows / 6,688 unique EINs**, 6,390 lowercased/trimmed names |
| `candidate-universe-v1.json` | Active nonprofit prime contracts on Aug 30, grouped by NFKC/whitespace/case-normalized contractor name | **548 source-name groups**, not proven legal-entity count |
| `public-funding-v1.json` | Same active-contract snapshot; source data-as-of Aug 20, retrieved Aug 30 | **1,784 rows / 1,784 unique contract numbers**; 36 departments represented by contractors |
| Same public-funding artifact, budgets | FY2026–27 approved department spending, data-as-of Aug 23 | **54 department aggregates**, not 54 nonprofit programs |

IRS: 5,747 subsection 03; 5,905 deductibility code 1; intersection **5,721**. NTEE present 5,008, missing **1,680**. Unknown NTEE group is **1,735**, because it also includes populated unknown/unrecognized codes. Tax period missing 1,063; present but before January 2024 in 218. Revenue is null in 1,723 and explicitly zero in 2,000: keep these states distinct. These are administrative values, not proof of inactivity.

Contract text rules map 388 contracts; 1,396 are unclassified. Twenty-one contracts map to multiple outcomes. At name-group level, 196 have a mapped outcome and **352 are unclassified-only**. Title, scope, prime contractor and end date are nonempty in this frozen accepted subset; this does not imply informative scope or complete population coverage. There are 144 negative remaining-authority values; preserve them as accounting-quality flags, not negative funding needs.

Existing exact IRS-name/contract-name crosswalk flags **189 IRS rows**. Do not claim `6688 + 548 − 189` unique nonprofits: the overlap is a name crosswalk, not verified one-to-one legal identity. Identical names can have distinct EINs; aliases and fiscal sponsorship can hide true overlap. Similarly, a nonprofit flag can include entities such as California ISO or landlord-like names, not only charities delivering health services.

The generated files still report four IRS scorecard matches and six initial diligence records. These are **historical build-time annotations**, not current counts of completed reviews. Rejoin the current report registry by verified legal identity before defining the next fifty.

### Provenance and live-source checks

The [IRS documentation](https://www.irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf) still listed Aug 11, 2026 as its posting date when checked. It explains filing/headquarters geography is not operating geography. BMF records are discovery evidence, not current donation eligibility or current activity certification. The underlying [California CSV](https://www.irs.gov/pub/irs-soi/eo_ca.csv) was not redownloaded in this audit.

The [DataSF source metadata](https://data.sfgov.org/api/views/cqi5-hm2d) describes weekly updates, expenditure contracts, confidential/revenue exclusions and missing off-contract spending. Converted pre-July-2017 contracts may contain only unused authority rather than original awards. A live September-7 filtered count request failed to open; **no fresh September-7 row count is claimed**. Use the frozen snapshot for reproducibility, then refresh explicitly before substantive contracting conclusions.

Both stored semantic hashes recompute correctly:

- IRS `{organizations,groups,subsections}`: `d6bc74fd4001b13adc6f06fa71cf936ad8f614e1d456f21654418f94174f29da`.
- Contractor `{organizations,outcomes}`: `19d3c0a3456d2f00bd0626663ca05b5bc95d0cb8672a26963346024b3da8fdbc`.

Fifteen available worktrees containing the IRS artifact share the same timestamp/count/hash; they are copies, not additional evidence. Important provenance defect: candidate-universe `source.queryUrl` and `retrievedAt` are null because the builder searches for source key `contracts`, while public-funding uses `datasf-supplier-contracts`. The valid query and retrieval timestamp exist in `public-funding-v1.json.sources` under that key. A later implementation should repair the linkage, without claiming data itself is missing.

## Feasible broad buckets: exhaustive routing, not effectiveness ratings

These mutually exclusive IRS buckets can be reproduced from `nteeGroupKey`. They sum to 6,688. Codes describe organization classifications, not verified interventions. All require an operating/program check.

| Routing bucket | NTEE initial letters | Count | First-pass question |
|---|---|---:|---|
| Clinical and behavioral health | E,F,G | 304 | Which untreated condition and additional completed treatment course? |
| Basic needs and supportive services | K,L,P | 687 | Which health change beyond food/housing/service outputs? |
| Education, employment, recreation and youth | B,J,N,O | 1,069 | Is there credible causal health evidence rather than earnings-only benefit? |
| Environmental and safety prevention | C,M | 162 | Which exposure/injury reduction, affected population and dose? |
| Legal, civic and community services | I,R,S,W | 619 | Specific non-electoral mechanism and attributable health consequence? |
| Research institutions | H,U,V | 153 | Is there an evaluable local delivery tranche or only uncertain research impact? |
| Other classifications requiring role split | A,D,Q,T,X,Y | 1,959 | Local service vs grantmaker, membership, international, cultural or animal mission? |
| Unknown/unrecognized | Z | 1,735 | Resolve purpose before exclusion; reserve discovery capacity here. |

Contract outcome name counts (overlapping, not additive): housing 48; unsheltered 18; overdose 9; mental health 29; food 25; education 73; violence 1; economic mobility 68. These are keyword/department results, **not evidence that only one contractor addresses violence**, or that every matched contractor improves its named outcome. Reuse contract titles/scopes for routing but retain matched rule and its version.

## Fields we have and fields we still need

**IRS normalized file:** EIN, legal/sort name, filing address, subsection, deductibility and foundation codes, ruling month, tax period, assets/income/revenue, NTEE, narrow identity crosswalk and old review flags. The CSV parser expects 28 source columns, but the normalized file drops several, including affiliation/group, filing requirement and status. Re-read raw CSV when those fields matter; do not invent them from the normalized data.

**Contract detail:** contract number/title, dates, type, purchasing authority, department, prime name, scope, award, outstanding purchase orders, payments, remaining authority, source timestamps and rule matches. **Not present in accepted normalized rows:** EIN, verified donation recipient, service address, completed doses/participants, unit costs, outcomes, controlled comparison, current capacity or marginal gift acceptance. Department budget totals do not supply these.

**Both lack:** reliable program ontology, population age/severity, SF service share, fiscal sponsor/project relationships, existing payer coverage at the intervention level, donor-restricted expansion offer, incremental benefit/cost/time horizon and utility evidence. Website and primary-evidence checks remain substantive work.

## Reproducible brief first-pass workflow

1. **Freeze inputs.** Record file hashes, snapshot timestamps, exact SQL/filter, code version, observed counts and exclusions. Existing code: `scripts/lib/sf-irs-universe.mjs`, `scripts/lib/sf-candidate-universe.mjs`, and `data/san-francisco/public-funding-config-v1.json`. Validate counts/hash before routing. Paginate any future raw refresh and reconcile source count; do not silently accept API limits.
2. **Maintain separate identifiers.** `irs:EIN` and `contract-source:existing-id`; a relation table stores evidence-backed matches, not destructive name merging. Add `program_id`, `fiscal_sponsor_ein`, `service_geography` and existing-review links separately. Automated fuzzy matches are review suggestions only. A new program at a reviewed organization is a new mechanism, not a new nonprofit toward 100.
3. **Route all rows automatically.** Apply the exhaustive NTEE buckets, contract keywords and explicit unknown bucket. Store every matched rule and a status `metadata-screened`; do not label this “researched.” National/headquarters-only, grantmakers, fiscal sponsors and direct delivery get separate role fields when verified. No revenue minimum, overhead cutoff, or automatic zero-revenue exclusion.
4. **Brief-check an initial 120 resolved leads.** Suggested research allocation: 30 clinical/behavioral, 25 basic-needs, 20 environmental/safety, 15 youth/education/employment, 10 legal/community, 20 exploration from unclassified/other buckets. This is research allocation, not a judgment of social worth. Draw at least 30 of the 120 from IRS-unknown or contract-unclassified records, overlapping the allocations, to audit the classifier's blind spots. Within buckets prioritize specific program signals, then use deterministic EIN/source-ID hash order for ties; log every skip/replacement. Deduplicate existing reviews first. If a bucket cannot fill, record that rather than force-fit it.
5. **One short primary-source brief per lead.** Verify one current service page plus one program budget/contract/report if available. Record organization/entity, named program, geography, population, dose, counterfactual payer, potential causal health evidence and fatal missing inputs. Separate observed facts, analyst hypothesis and unknown. Initial effort can be bounded to roughly 10–15 minutes, but an unresolved identity cannot be promoted as verified merely because time expired.
6. **Promote roughly 30–40 programs for deep review**, retaining rejected/deferred reasons. A first-pass score orders further research, never serves as a donor recommendation or $/QALY ranking. Maintain a random/unknown reserve so sparse public documentation does not monopolistically favor large contractors.

## Defensible shortlist rubric

Use five independently recorded 0/1/2 dimensions, with **unknown separate from zero**:

- **Local implementability:** hypothetical only / plausible SF partner / verified current named SF delivery.
- **Causal health link:** only outputs or speculation / explicit bridge with external causal evidence / directly relevant randomized or strong quasi-experimental health/utility evidence.
- **Cost-and-dose tractability:** whole-organization totals only / priceable course with gaps / actual completed-dose cost and resource perspective.
- **Additional donor delivery:** no identified lever / plausible bottleneck distinct from funded commitments / evidenced expandable tranche and payer counterfactual.
- **Research decision value:** duplicate/mechanism already resolved / meaningfully different transfer case / distinct mechanism with a realistically decisive unresolved test.

Tie-break by fewer unresolved entity/geography questions, then mechanism diversity, then deterministic ID. A total is optional for queue ordering, but retain its components; require at least a named-program hypothesis, a plausible causal health bridge, and no unresolved mistaken identity before deep-review promotion. Do not penalize a credible null result by hiding it: it can settle a hypothesis and improve the portfolio.

For threshold plausibility, ask `required incremental Q per completed unit = gross donor cost / 10,000` (since $100,000 per 10 Q means $10,000/Q). Compare this requirement with a transparent bounded effect/horizon, not a guessed rank. Illustratively a $100 course needs 0.01 incremental Q. Do not substitute earnings, symptom-free days or organizational reach for QALYs, and do not count payer savings as donor resources. Carry null/harm and replacement scenarios when modeling starts. No mechanism receives a numerical central solely to satisfy a shortlist quota.

## Minimum output schema and honest coverage statements

`source_record_ids; snapshot_hashes; entity_ein; entity_match_status; sponsor_relation; existing_review_ids; primary_bucket; secondary_tags; program_name; local_service_evidence_url/date; population; dose; cost_anchor/perspective; external_causal_anchor; utility_bridge; comparator/payer; donor_bottleneck; rubric_components; decision; reason; reviewer; reviewed_at`.

Publish separately: metadata records routed; unique EINs; contractor names; verified crosswalks; manually brief-checked programs; distinct donation entities; deeply modeled programs; incremental entities beyond the prior 50. The defensible statement at this stage is **“audited dataset structure and counts and designed a reproducible screen,” not “researched all 6,688 nonprofits.”**
