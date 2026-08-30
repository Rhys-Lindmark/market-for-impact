# Market for Impact backlog

This backlog is ordered by donor value, data integrity, and dependency. Each item should normally become one GitHub issue and one focused pull request. When the ready queue drops below five items, replenish it from the research tracks below.

## Now — foundation

- [x] **MFI-001 — Establish product direction and first opportunity market.** Create the public-facing thesis, first comparable opportunity table, funding signals, methodology, and source ledger.
- [x] **MFI-002 — Define the canonical grant and assessment schema.** Represent funders, recipients, grants, source records, recommendations, native impact metrics, uncertainty, and room for more funding without erasing source semantics.
- [x] **MFI-003 — Build the Coefficient Giving ingestion pipeline.** Discover the current databases for each fund, retain source URLs and publication lag, ingest grants idempotently, and preserve the upstream publication status without inferring paid or committed status. Do not treat the public database as complete; Coefficient says it omits most non–Good Ventures advised funding.
  - [x] Normalize and idempotently import all 79 currently published Effective Giving & Careers records into D1, retaining source/status semantics, stable IDs, content hashes, first/last-seen timestamps, and duplicate tests.
  - [x] Expose reconciled D1 totals and recent grants on the homepage with a primary-source coverage note. Verified locally on 2026-08-29: 79 grants, $46,721,803, 51 recipients; two successive API reads returned the same totals.
  - [x] Automate the Effective Giving & Careers snapshot from Coefficient's public Algolia search index. The refresh command validates all records, fails closed on truncation or duplicate source IDs, reports additions/updates/removals, and is a no-op when unchanged. Verified 2026-08-29 against the rendered fund page and index: 79 records, $46,721,803, 51 recipients.
  - [x] Discover and snapshot Coefficient's complete public grant index across every currently listed fund. Verified 2026-08-29: 2,893 unique source records, $4,920,357,709 in published amounts, 1,133 exact recipient names, 14 current fund lenses, and 36 preserved focus-area tags. The year-partitioned refresh also captures undated records and fails closed on truncation, duplicates, or mass removal.
  - [x] Publish a source-linked fund market with unique-record totals, non-additive fund aggregates, missingness, overlapping-tag, publication-status, and future-date caveats. Seven records currently carry multiple listed-fund tags and 43 carry no currently listed-fund tag.
  - [x] Import the full public index into D1 and add a grant/fund explorer; preserve legacy and sub-area tags while preventing double-counting across the many-to-many fund taxonomy. Verified locally on 2026-08-29: 2,893 idempotently materialized records; fund, year, text, sort, and pagination interactions reconcile to the snapshot; desktop and 390 px mobile layouts have no console errors or horizontal overflow.
- [x] **MFI-004 — Build the GiveWell opportunity importer.** Import current Top Charities, grants spreadsheet rows, cost per outcome, evidence notes, location, and rolling room-for-more-funding decisions. Preserve estimate date and model version.
  - [x] Snapshot and normalize all 541 rows in GiveWell's public grant table, retaining stable source-record hashes, recipients, dates, links, topics, explicit funders, countries, and published-grant semantics. The importer fails closed on schema, row-count, total, date, amount, truncation, and duplicate drift.
  - [x] Preserve the source discrepancy instead of hiding it: exported row amounts total $2,625,949,864, exactly $3 above Airtable's displayed $2,625,949,861 aggregate.
  - [x] Encode the four September 2025 Top Charities with evidence notes, native delivery units, historical 2022–2024 reported cost-per-life averages, geography, current public model links and versions, limitations, and non-inferred rolling funding-room states.
  - [x] Materialize 541 grants and four assessments idempotently into D1 and publish a donor-facing GiveWell market. Verified locally on 2026-08-30: two successive API reads returned 541 grants, $2,625,949,864, 129 recipients, four assessments, and no foreign-key violations; tests, lint, build, desktop browser rendering, and fresh migration chain passed.
- [ ] **MFI-005 — Ship organization and grant detail pages.** Add stable URLs, source citations, grant timeline, evaluator comparisons, metric provenance, and data freshness.
  - [x] Publish stable detail routes for all current Coefficient, GiveWell, and RenPhil grant records plus organization profiles for canonical ledger organizations. Profiles separate received, advised, and originated roles; expose current assessments, published-amount missingness, source coverage, and newest grant timelines. Verified on 2026-08-29 against a fresh migrated D1 database: representative Coefficient, GiveWell, and RenPhil grant routes and Malaria Consortium/Coefficient Giving profiles returned 200; an unsupported source returned the record-not-found 404. Relationship queries use verified funder/recipient indexes. Organization rollups use only current source rows and suppress the known 79-row Coefficient subset overlap; the adviser profile reconciles to 2,893 rather than 2,972 records.
  - [x] Add auditable many-to-many grant/organization roles and source-name aliases. Coefficient’s complete index now links all 2,888 published recipient mentions across 2,885 records to 1,132 conservative normalized identities; the three two-recipient grants link both named organizations, while eight records with no published recipient remain unlinked. The graph records 6,536 unique cross-source roles and 1,312 source aliases, including one reviewed punctuation alias for Good Judgment Inc.; unchanged current snapshots self-backfill after migration and reconcile idempotently. Verified on 2026-08-29 with seven fresh D1 migrations, no foreign-key violations, indexed role queries, two identical materializations, working multi-recipient grant/profile routes, and the known 79-row Coefficient subset still suppressed from organization rollups.
  - [ ] Populate cross-evaluator comparisons as ACE, Giving Green, and Founders Pledge assessments enter the ledger.
- [ ] **MFI-006 — Replace homepage aggregates with database queries.** Make every displayed count and funding total traceable to accepted ledger rows; show coverage and last-refresh status.

## Next — cross-evaluator market

- [ ] **MFI-007 — GiveDirectly benchmark layer.** Encode which comparisons genuinely use cash transfers as a baseline, the welfare assumptions behind them, and incompatibility warnings.
- [ ] **MFI-008 — Animal Charity Evaluators pipeline.** Import the 2025 recommended-charity set, native metrics, evaluation status/year, and room-for-more-funding capacity such as The Humane League’s stated 2026–27 capacity.
- [ ] **MFI-009 — Giving Green pipeline.** Import 2025–26 top nonprofits, strategy tags, grant announcements, evaluation narratives, and funding-need language.
- [ ] **MFI-010 — Founders Pledge research matrix.** Map recommendations by cause, including education, climate, global health, and catastrophic risks; expose when estimates are relative to GiveDirectly.
- [ ] **MFI-011 — AI safety ecosystem map.** Build an organization taxonomy spanning technical safety, governance, field-building, evaluations, biosecurity overlap, and effective careers. Seed it from Coefficient Giving grants, then reconcile other disclosed funders.
- [ ] **MFI-012 — Evaluator comparison view.** For any cause, show agreement, disagreement, date, decision criteria, and funding status across GiveWell, Coefficient Giving, ACE, Giving Green, and Founders Pledge.
- [ ] **MFI-022 — Renaissance Philanthropy grant pipeline.** Inventory public fund and grant portfolios, beginning with the 2025 AI for Math awards. RenPhil declares 29 first-round awards but currently exposes 28 linked project records; preserve that coverage gap alongside fund, named donor, project, team or recipient, source URL, announcement period, and missing award amounts. Never substitute fund commitments or application ranges for row-level grant amounts. Keep catalyzed, directly raised, and unlocked/matchmade capital signals separate from grants.
  - [x] Snapshot the 28 currently linked AI for Math projects and their detail pages, while recording the unresolved gap against RenPhil's stated 29 awards, two missing project descriptions, all missing row-level amounts/dates, and source update timestamps.
  - [x] Add an hourly fail-closed source check; changed project membership, page content, duplicates, or completeness invariants require review before refresh.
  - [x] Materialize the portfolio idempotently into D1 and publish the donor-facing fund/grant view. Verified locally on 2026-08-30: two successive API reads returned 28 awards, 28 missing amounts/dates, two missing descriptions, and the declared-versus-linked gap of one; the ledger contains one source row set with no non-null award amount and no foreign-key violations. A fresh database also served RenPhil before Coefficient without changing Renaissance Philanthropy's cross-source identity or breaking either API. The reveal-all interaction exposes all 28 source links in the browser.
  - [ ] Expand the source inventory across RenPhil's other public funds and grant portfolios.

## Then — decision quality

- [ ] **MFI-013 — Comparable-impact model v0.1.** Store native outcome units first; add optional QALY/WELLBY/$CG/cash-benchmark conversions with explicit assumptions, sensitivity ranges, and versioned formulas.
- [ ] **MFI-014 — Room-for-more-funding curve.** Model marginal tranches rather than one organization-level number: size, time window, use, confidence, marginal cost-effectiveness, and likely counterfactual funder.
- [ ] **MFI-015 — Grant-flow explorer.** Visualize funder → grant → recipient → intervention → cause, with year, geography, stage, restriction, and status filters. Prevent double-counting across advised and originating funders.
- [ ] **MFI-016 — Data-quality dashboard.** Publish coverage, refresh latency, conflicts, missing amounts, missing dates, retractions, grouped grants, and private-grant caveats.
- [ ] **MFI-017 — Donor portfolio builder.** Let donors express cause weights, risk tolerance, minimum evidence, geography, liquidity, and time horizon; return an explainable portfolio, not a black-box score.

## Local impact — San Francisco

- [ ] **MFI-018 — SF opportunity ontology.** Define locally meaningful outcomes: housing stability, unsheltered days avoided, overdose deaths, mental-health stabilization, food security, educational attainment, violence reduction, and economic mobility.
- [ ] **MFI-019 — SF public-funding baseline.** Ingest city budgets, departmental grants/contracts, homelessness plans, and public health indicators so private gifts are evaluated against existing public spend.
- [ ] **MFI-020 — SF nonprofit discovery and diligence.** Combine public contracts, audited filings, GiveWell-style interviews, outcome evidence, capacity, and marginal funding plans. Clearly separate measured outcomes from modeled QALYs/WELLBYs.
- [ ] **MFI-021 — SF first recommendation slate.** Publish a small, deeply researched set of opportunities with downside cases, funding gaps, and follow-up milestones.

## Operating tracks

- [ ] Add automatic hourly source-change detection and human review queues; GitHub now checks the full Coefficient public grant index and EGC subset hourly, no-ops when unchanged, and fails closed into review on changes or suspicious removals, but other evaluators still need coverage.
- [ ] Add source snapshots and diffs so historical claims remain auditable; the complete Coefficient snapshot now retains stable source IDs, canonical grant URLs, exact award dates, publication timestamps, all focus-area tags, and a content hash. D1 now preserves full-index first/last-seen timestamps and leaves records absent from a later snapshot in history; human-readable historical snapshot diffs remain next.
- [ ] Add a corrections policy, conflicts disclosure, methodology changelog, and research red-team template.
- [ ] Interview one Coefficient Giving researcher, one GiveWell-style evaluator, one large foundation staffer, and three AI-company donors; convert findings to issues.
- [ ] Maintain accessibility, mobile, performance, citation, and data-freshness checks in CI.

## Definition of done for a data PR

1. Every material claim has a primary-source URL, publication date, retrieval timestamp, and verbatim field or bounded transformation.
2. Amount semantics are explicit: paid, committed, recommended, announced, influenced, budgeted, or unknown.
3. Native impact units are retained; any conversion is versioned and uncertainty is visible.
4. Imports are idempotent and duplicates are tested.
5. UI totals reconcile to accepted records and disclose coverage gaps.
