# Market for Impact

Market for Impact is an open, source-grounded market of philanthropic opportunities and funding flows. It starts from a simple donor question: **what can the next dollar accomplish?**

The product connects recommendations to grants and keeps unlike outcomes visibly unlike. It tracks evidence, native impact metrics, marginal funding room, evaluator judgments, uncertainty, and source freshness across global health, AI safety, animal welfare, climate, education, San Francisco, and other cause areas.

## Product principles

- Marginal impact over organizational prestige.
- Primary sources over unsourced aggregation.
- Native outcome units before synthetic scores.
- Ranges and assumptions over false precision.
- Funding provenance that prevents double-counting advised grants.
- Explicit coverage gaps and publication lag.

## Local development

The project uses the OpenAI Sites/Vinext scaffold with a Cloudflare D1 schema.

```bash
npm install
npm run dev
```

See [BACKLOG.md](BACKLOG.md) for the prioritized roadmap and data-PR definition of done.

## Coefficient Giving refresh

The grant snapshots come from the public search index used by Coefficient Giving's fund pages. The committed search credential is the publisher's browser-visible, search-only key; it cannot modify the index.

```bash
npm run data:coefficient:check   # exits 0 when the committed snapshot is current
npm run data:coefficient:refresh # review and write a changed snapshot, then normalize it
npm run data:coefficient:all:check   # checks every public grant record
npm run data:coefficient:all:refresh # writes the full snapshot and market summary
```

The full refresh partitions the index by award year so it can retrieve all records beyond the search service's 1,000-result window, then separately retrieves records with no award year. It validates completeness, stable source IDs, amounts, dates, fund membership, and duplicate identities, and fails closed on suspicious truncation. Missing fields remain missing rather than being inferred.

The normalized market summary counts each source record once overall. Its 14 fund rows are intentionally non-additive because Coefficient's focus-area tags are many-to-many; legacy and sub-area tags remain available in the raw snapshot. Published records remain explicitly distinct from paid or committed grants, and Coefficient's stated publication-lag and coverage caveats are retained with every snapshot.

The complete snapshot is materialized idempotently into D1 on the first request to `/api/coefficient-grants/all`. Each source record keeps its source ID, URL, post ID, exact recipient list, full focus-area and current-fund tag sets, publication status, content hash, and first/last-seen timestamps. The endpoint supports paginated recipient/purpose search plus fund, award-year, and recent/largest sorting. Missing recipients, amounts, and dates remain null; fund filtering uses tag membership and never duplicates an overlapping grant in the overall ledger.

GitHub runs both non-writing checks hourly. A changed or suspicious snapshot fails the check and enters the human/Codex review queue; the workflow never accepts upstream data changes on its own.
