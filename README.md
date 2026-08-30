# Market for Impact

Market for Impact is a source-traceable market of philanthropic opportunities and funding flows. It starts with a donor question: **what can the next dollar accomplish?**

The product connects evaluator recommendations to disclosed grants while preserving evidence, native impact metrics, marginal funding room, model versions, uncertainty, and source freshness. The intended audience includes individual donors, foundation staff, researchers, and people at AI companies deciding where to give.

Live site: [market-for-impact.rhyslindmark.chatgpt.site](https://market-for-impact.rhyslindmark.chatgpt.site/)

## Product principles

- Compare marginal impact, not organizational prestige.
- Prefer primary sources and retain a path back to every material claim.
- Keep native outcome units before adding synthetic scores or conversions.
- Show ranges, assumptions, model dates, and missingness instead of false precision.
- Distinguish paid, committed, recommended, announced, influenced, published, and unknown amounts.
- Preserve originating-funder and advising-funder provenance to prevent double-counting.
- Keep unlike outcomes visibly unlike until a defensible, versioned conversion exists.

This is research infrastructure, not financial, tax, or individualized giving advice.

## What is implemented

- A cross-cause opportunity market with source links and native evaluator metrics.
- Coefficient Giving’s complete public grant index: 2,893 unique source records across 14 current fund lenses, plus a searchable D1-backed explorer.
- A separate 79-record Coefficient Effective Giving & Careers ledger used for detailed reconciliation.
- GiveWell’s 541-row public grant export and four current Top Charities, including evidence levels, delivery costs, historical reported cost per life saved, geography, model versions, and non-inferred funding-room status.
- A versioned GiveDirectly comparison layer that keeps GiveWell’s 1× welfare anchor, 3–4× standard-program estimate, and 6× funding bar separate, with model-population, welfare-weight, currency-basis, and incompatibility warnings stored in D1.
- Animal Charity Evaluators’ 10 current Recommended Charities, including five 2025 reviews and five retained 2024 recommendations, with 28 program-level native metrics, evaluation vintages, uncertainty ranges, annual funding capacity, and incremental room for more funding preserved in D1.
- Renaissance Philanthropy’s 28 currently linked 2025 AI for Math awards, reconciled against its stated 29-award portfolio with one explicit coverage gap and no inferred row-level amounts.
- Stable grant detail URLs across all current Coefficient, GiveWell, and RenPhil ledgers, plus organization profiles that separate received, advised, and originated funding roles and display evaluator evidence when available.
- Auditable many-to-many grant/organization roles and source-specific name aliases, including all named recipients in Coefficient’s three multi-recipient records without splitting or duplicating grant amounts.
- A database-backed homepage whose displayed grant counts, funding totals, fund-lens aggregates, missingness, opportunity assessments, and freshness states come from accepted current D1 rows. It does not substitute bundled numbers when the ledger is unavailable, sum the overlapping Coefficient EGC subset, or imply that cross-publisher exports are additive.
- Content-addressed raw and normalized snapshots, idempotent D1 materialization, source caveats, and fail-closed import checks.

The prioritized roadmap is in [BACKLOG.md](BACKLOG.md). It covers ACE, Giving Green, Founders Pledge, AI safety, comparable-impact modeling, funding-room curves, organization pages, and a San Francisco giving market.

## Architecture

The site uses React 19 and the Vinext/OpenAI Sites runtime. Cloudflare D1 stores normalized sources, organizations, grants, and assessments.

```text
publisher source
  → committed raw snapshot + retrieval metadata
  → source-specific validator/normalizer
  → committed normalized snapshot + content hash
  → idempotent D1 materialization
  → API reconciliation
  → donor-facing view with citations and caveats
```

Important paths:

- `data/`: committed source snapshots and normalized outputs.
- `scripts/`: importers, refresh checks, and data-integrity tests.
- `db/schema.ts`: canonical source, organization, grant, and assessment schema.
- `db/`: source-specific D1 materializers and query functions.
- `app/api/`: public read APIs used by the site.
- `app/page.tsx`: current donor-facing market view.
- `app/grants/` and `app/organizations/`: source-traceable grant and organization detail routes.
- `drizzle/`: ordered D1 migrations.
- `.github/workflows/`: scheduled upstream-change checks.

Raw source semantics remain source-specific. Generic fields such as topics, funders, and countries are additive; an importer must not force a publisher’s taxonomy into another publisher’s meaning.

Organization identity is conservative. `organization_source_names` preserves each publisher’s exact display name and the basis for linking it to a canonical organization. `grant_organization_roles` records every recipient, adviser, and originating funder relationship without forcing a single recipient onto a multi-recipient grant. Exact Unicode-normalized source names merge automatically; other cross-source aliases require an explicit reviewed mapping. Amounts remain attached to grants and are never divided across recipient links.

## Local development

Requirements:

- Node.js 22.13 or newer
- npm or pnpm
- a local D1-compatible Sites development environment

```bash
npm install
npm run dev
```

The production checks are:

```bash
npm test
npm run lint
npm run build
```

Data changes should also be verified against a fresh database and a database migrated through every existing migration. The UI should be checked at desktop and mobile widths, including API-backed loading, filtering, error states, console errors, and horizontal overflow.

## Data refresh workflows

### Coefficient Giving

Coefficient’s snapshots use the public search index behind its fund pages. The browser-visible credential is search-only and cannot modify the publisher’s index.

```bash
npm run data:coefficient:check
npm run data:coefficient:refresh
npm run data:coefficient:all:check
npm run data:coefficient:all:refresh
```

The full refresh partitions results by award year to avoid the search service’s 1,000-result window, separately captures undated records, and validates source IDs, amounts, dates, fund membership, duplicates, and suspicious removals. Overall totals count each source record once. Fund totals are intentionally non-additive because tags are many-to-many.

### GiveWell

GiveWell Top Charity research is recorded in `data/givewell/top-charities.json`. The public grant table currently requires a reviewed Airtable **Download CSV** export; its public share exposes no documented unattended export endpoint.

1. Open the [GiveWell public grants table](https://airtable.com/appaVhon0jdLt1rVs/shrixNMUWCSC5v1lh/tblykYPizxzYj3U1L/viwJ3DyqAUsL654Rm).
2. Export the displayed view as CSV.
3. Review its displayed row count and aggregate against `data/givewell/grants-source.json`.
4. Import and normalize it:

```bash
npm run data:givewell -- --input /absolute/path/to/export.csv
npm test
```

The importer fails on unexpected headers, malformed dates or amounts, duplicate identities, record-count drift, or exported-row-total drift. It preserves the known snapshot discrepancy: exported row amounts total $2,625,949,864, which is $3 above Airtable’s displayed $2,625,949,861 aggregate.

GiveWell’s headline cost-per-life figures are labeled as reported averages for 2022–2024 GiveWell-directed funding. They are not presented as current location-specific model outputs. A numeric organization-wide room-for-more-funding gap remains null unless GiveWell publishes one for the current decision period.

The GiveDirectly layer uses three distinct comparison objects. Since November 2025, GiveWell’s 1× benchmark is a normalized consumption-welfare anchor rather than GiveDirectly itself. GiveWell currently estimates the standard Cash for Poverty Relief program at 3–4× that anchor and uses 6× as its livelihoods funding bar. Donation pass-through, GiveDirectly’s claimed local-economic multiplier, and estimates for separate cash pilots are retained as incompatible units rather than presented on the same scale.

### Renaissance Philanthropy

The RenPhil refresh reads the official AI for Math winners index and each linked project page, retaining compact project-purpose excerpts, structured team names where the prose supports them, whether team text is present, source-update metadata, and missingness.

```bash
npm run data:renphil:check
npm run data:renphil:refresh  # review before committing changed upstream data
```

RenPhil states that its first round contained 29 awards, while the current winners page exposes 28 linked project records. The snapshot imports those 28 and records one unresolved coverage gap. The $18M first-round commitment, later $13.5M commitment, application caps, and field-building allocations remain fund-level signals; none is divided across or summed from the grant rows. GitHub checks the source hourly and fails into review when the portfolio or project pages change.

### Animal Charity Evaluators

The ACE snapshot preserves the current 2025 recommendation set and links every record to its official charity review. Funding capacity and incremental room are separate annual fields; the displayed $12.456M room total spans two overlapping cohorts and is not a single-period portfolio target.

```bash
npm run data:ace:check
npm run data:ace:refresh  # review upstream changes before committing
```

ACE’s selected-program estimates remain in their native units: animals helped or affected, meals replaced, people reached, research outputs, and suffering-adjusted days (SADs). They are stored as multiple program metrics rather than one organization score. ACE explicitly warns that 2025 SAD estimates are not directly comparable with earlier ACE estimates or other organizations’ SAD estimates, so Market for Impact does not rank across those model vintages. GitHub checks the live recommendation links hourly and fails into review when the set changes.

## Data and citation rules

Every data pull request should satisfy the definition of done in [BACKLOG.md](BACKLOG.md):

1. Record the publisher URL, publication or model date, retrieval timestamp, and bounded transformation.
2. State amount semantics explicitly.
3. Preserve native impact units and version any conversion.
4. Make imports idempotent and test duplicates and truncation.
5. Reconcile UI totals to accepted records and disclose coverage gaps.

Missing values stay missing. Publication does not imply payment. A recommendation does not imply an unrestricted organization-level funding gap. Historical estimates do not become current estimates merely because they are the newest public headline.

The complete Coefficient index publishes 2,888 recipient mentions across 2,885 of 2,893 records. All named recipients now link through explicit many-to-many roles, including three records with two recipients each. Eight records publish no recipient name and remain unlinked rather than receiving an invented identity.

Organization rollups count only records current in each source snapshot. Coefficient’s 79-record Effective Giving & Careers ledger is a fully overlapping subset of the complete 2,893-record public index, so adviser-level totals suppress those duplicates while recipient profiles retain the smaller ledger’s canonical links.

## GitHub and worktree workflow

`BACKLOG.md` is the persistent roadmap. Each coherent item should normally have one GitHub issue and one focused pull request.

1. Sync the latest remote base branch and inspect uncommitted work.
2. Create a dedicated Git worktree and feature branch for the backlog item.
3. Implement one reviewable improvement without mixing unrelated changes.
4. Inspect the diff; validate source files, migrations, tests, lint, build, and affected browser interactions.
5. Update `BACKLOG.md` with completion evidence and the next actionable item.
6. Commit, push, and open or update the pull request. Do not merge over failing CI.
7. Remove a worktree only after its branch is safely pushed and no longer needed.

When the ready queue drops below five items, replenish it from the research tracks in the backlog. Scheduled source checks should create a review signal on upstream drift; they should not silently accept changed philanthropic data.

## Deployment

The public site is hosted with OpenAI Sites. Deploy only a commit that has passed the full validation sequence, and deploy that exact commit to the configured Sites source repository. Preserve the existing public URL and access settings; do not change domains, repository visibility, credentials, billing, or destructive settings as part of routine releases.

Current production URL: [market-for-impact.rhyslindmark.chatgpt.site](https://market-for-impact.rhyslindmark.chatgpt.site/)

## Contributing

Start with a ready item in [BACKLOG.md](BACKLOG.md), use the issue and pull-request templates, and keep claims source-linked. A small, auditable improvement is more useful than a broad import whose semantics cannot be explained.
