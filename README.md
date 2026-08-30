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

The Effective Giving & Careers snapshot comes from the public search index used by Coefficient Giving's fund page. The committed search credential is the publisher's browser-visible, search-only key; it cannot modify the index.

```bash
npm run data:coefficient:check   # exits 0 when the committed snapshot is current
npm run data:coefficient:refresh # review and write a changed snapshot, then normalize it
```

The refresh validates completeness, source IDs, amounts, dates, fund membership, and duplicate identities. It fails closed on suspicious truncation. Published records remain explicitly distinct from paid or committed grants, and Coefficient's stated publication-lag and coverage caveats are retained with every snapshot.

GitHub also runs the non-writing check hourly. A changed or suspicious snapshot fails the check and enters the human/Codex review queue; the workflow never accepts upstream data changes on its own.
