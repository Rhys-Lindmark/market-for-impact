# Sample100 reproducibility and provenance audit

2026-09-08. Read-only audit of `/private/tmp/mfi-universe-sample100.mjs`, `.csv`, `.selection.json`, and `.md`. Executed the generator without modifying its inputs, parsed the CSV with quoted-field handling, compared all ordered identifiers and current provenance, and independently opened all ten cited primary pages. No Site files changed.

## Verdict

**Accept the completed work as 100 distinct IRS records metadata-screened, ten preliminary primary service checks, zero completed CEAs.** No count or duplicate-EIN error found. Before describing it as a reproducible sample excluding previously reviewed organizations, correct the exclusion provenance and distinguish reproducible selection from manually annotated output. It is not 100 newly verified independent charities or 100 additional substantive reviews.

## Verified numerical and structural checks

- CSV: exactly 100 data rows, 25 fields on every row, 100 unique valid nine-digit EIN strings; leading-zero EIN `010777856` preserved.
- CSV identifiers match `selection.json:selectedIds` exactly in order; rerunning `.mjs` reproduces that same ordered list.
- Current rerun reproduces saved provenance, all input raw-file hashes, pool counts and the complete ordered skipped list.
- 78 excluded IRS rows; no selected/skipped EIN overlap. 6,688−78=6,610 eligible rows. Pool counts sum to 6,610: clinical297, basic664, youth1057, environment162, civic612, research153, other1947, unknown1718.
- Selected quota counts: 15,15,10,10,10,5,5,30 =100, as stated.
- Exactly ten rows have `primary_checked=2026-09-08`, primary URLs/findings and `primary-service-checked-not-CEA` status; 90 use `primary_checked=no`. The field is a date-or-sentinel, not a Boolean; validators must not count only literal `yes`.
- Dispositions reproduce: ten `priority-program-diligence`, 73 `priority-for-identity-and-program-check`, 17 `defer-scope-or-role`.
- All 100 funding-room cells are blank, not numerical zero. No calculated QALY or CEA claim appears in this sample.

## Material provenance corrections

### 1. “Existing-review exclusion” overstates what the code checks

The recursive walker scans **every** non-universe/non-public-funding JSON, not only accepted report identities. Consequently it collects EINs from `sff-community-grants-v1.json` grant-partner lookup records. Concrete verified examples:

| Excluded EIN | Name | Actual exclusion dependency |
|---|---|---|
| 943039956 | ACCION LATINA | `sff-community-grants-v1.json:partners[4].exactIrsMatches[0]`, scorecardKey null |
| 825041780 | ALL MY USOS | same file `partners[12].exactIrsMatches[0]`, scorecardKey null |
| 942243418 | BLUE BEAR SCHOOL OF MUSIC | same file `partners[51].exactIrsMatches[0]`, scorecardKey null |

Thus the 78 are not verified previously modeled/reviewed entities. The generic skipped reason mislabels known-grantee identities. This introduces a selection bias that should be disclosed, although it does not invalidate a purposive discovery sample.

Smallest correction preserving this finished sample: rename the policy and per-record reason to “conservative prior-repository-identity/alias exclusion, including grant-partner metadata; not proof of prior substantive review.” State that the sample excludes some merely known organizations. If the intended policy is truly completed-report exclusion, generate a versioned v2 using an explicit canonical report/EIN/alias manifest; retain v1 and its work rather than silently overwriting it.

Alias regexes can also suppress unrelated legal entities: the log includes SAINT ANTHONY OF PADUA CHURCH due to the broad Saint Anthony alias. Fiscal sponsors and parents are not interchangeable with projects. These conservative over-exclusions are acknowledged generally, but per-record exact reason/source would make them actionable.

### 2. Snapshot is currently reproducible, but dependency pinning is incomplete

The three recorded hashes pin the IRS and contract inputs, but selection also depends on all scanned JSON files plus `app/charities` directory names and code/alias configuration. Those dependencies lack hashes or a saved full effective exclusion manifest. The saved skipped list is sufficient to reconstruct this run's eligible IRS frame, but `.mjs` does not consume it; a later repo change can alter output despite unchanged three advertised hashes.

Minimum fix: record the generator hash and sorted effective exclusion EIN/name/alias manifest, or implement replay from the frozen skipped-EIN list with an explicitly pinned input hash. Retain historical source timestamps. Locale-independent lexical hex comparison is preferable to `localeCompare` for portable determinism; no current mismatch was observed.

### 3. Reproducible selection is not a reproducible final CSV

The script emits generic hypotheses, no primary checks and no final CSV. The annotated CSV changes `local_relevance`, `plausible_intervention`, `decision`, `reason`, `primary_url`, `primary_checked`, `primary_finding`, `review_status`, and adds population/dose/cost/utility/funding/priority fields. This is legitimate manual research work, but the generator cannot reproduce those annotations.

Label it “deterministic selection generator + separately saved analyst annotations.” Hash the CSV and narrative and preferably retain a keyed annotation overlay/serializer. Do not claim the complete final CSV is mechanically regenerated by `.mjs` alone. Source pages can change, so dated quotations or captured source excerpts would strengthen the ten-check evidence trail.

## Classification and sampling limitations

The implemented letter buckets exactly reproduce their intended broad NTEE routing. They are not verified service classifications. Unknown includes blank and unrecognized codes such as Z99Z; it does not mean inactivity. Brilliant Corners and some housing entities retain visibly mismatched frozen categories, appropriately flagged for resolution.

All 30 unknown-bucket selected rows have positive metadata signals: 20 score1 and ten score2. Therefore a 30% unknown-classification reserve is **not** a low-signal random reserve. The narrative already proposes the latter separately; retain that distinction. No population prevalence, representative coverage, random-sample or quality-ranking claims are justified. Contractor-only entities are correctly acknowledged as absent. Exact-normalized-name joins remain signals, not legal EIN matches.

The selection logic has no assertions guaranteeing unique/valid EINs or filled quotas if inputs change. Add fail-fast validation before future generation: count100, uniqueness, nine-digit text format, no exclusion overlap, quota fulfillment, contract-source hash integrity and ordered-ID checksum. Current input passes these checks independently.

## Ten primary checks: independently supported at preliminary depth

Each cited page was reopened successfully during this audit. Findings below verify the narrow statements, not current funded capacity or causal effectiveness.

| Sample | Primary page | Audit result |
|---|---|---|
| 1 FCA | [Bay Area Caregiver Resource Center](https://www.caregiver.org/connecting-caregivers/bay-area-caregiver-center/) | SF-inclusive eligibility, consultation, respite/counseling eligibility and public funders supported. |
| 2 RSN | [Provider homepage](https://www.rsn2000.org/) | NoVA case management, peer support and no current introductory-computer training supported; program-text recency still unknown. |
| 4 Rafiki | [Provider homepage](https://rafikicoalition.org/) | Clinical/support and perinatal mental-health service listings present alongside alternative wellness; not a dose or clinical-effect finding. |
| 5 NICOS | [Chinatown task force](https://www.cavityfreesf.org/taskforces-chinatown/) | NICOS leadership and SF target population supported. It does not prove completed dental procedures. |
| 22 On Lok | [SFHSA Health Promotion](https://www.sfhsa.org/services/disability-aging/health-promotion) | On Lok 30th Street is named for activity/fall-prevention programs. Legal operating-entity linkage remains a separate check. |
| 58 LSC | [What We Do](https://lsc-sf.org/what-we-do/) | Youth legal/social work services supported; footer also directly corroborates EIN51-0169463. |
| 76 La Casa | [What We Do](https://www.lacasa.org/what-we-do/) | Crisis mission plus historical counseling and shelter totals supported. Do not infer present capacity from cumulative figures. |
| 77 APA | [About Us](https://www.apafss.org/about-us) | SF family and school-age behavioral-health programs supported. Medi-Cal pilot wording is developmental/future-facing, not proof of active high-school reimbursement. |
| 80 Safe & Sound | [What We Do](https://safeandsound.org/what-we-do/) | Parenting/counseling, SF addresses and bounded support hours supported. Footer corroborates EIN94-2455072. |
| 97 Bayview | [Behavioral Health Services](https://www.bayviewci.org/behavioral-health-services) | Outpatient and SF jail methadone plus adult/youth care supported. Postrelease continuity expansion remains a hypothesis. |

Small wording improvement: characterize APA as “describes developing a Medi-Cal pilot,” not established currently billable clinical capacity. The existing caveat about distinguishing current financing should remain.

## Release recommendation

Preserve all 100 rows and ten checks as legitimate first-pass work. Correct exclusion labels and freeze complete provenance before using “reproducible” without qualification. No reason to inflate the substantive-review count, discard the manual annotations, or invent CEA values. Next diligence should resolve operating entities and one actual incremental service per promising record.
