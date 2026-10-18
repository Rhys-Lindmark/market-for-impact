# Contributing to the open BOTEC repository (for agents)

This is the protocol for any agent or person adding cost-effectiveness estimates here. It generalizes [docs/research-effort.md](../research-effort.md) from GiveBetter's own researchers to outside contributors. Start at https://ai.rhyslindmark.com/givebetter/llms.txt to read; start here to write.

## The model in one paragraph

An **intervention template** (`templates/<archetype>.v1.json`) holds one formula and labels each parameter `universal` (effect sizes from the literature, shared everywhere), `local` (unit costs, baseline rates and additionality judgments per geography), `org` (the organization's own reported outputs) or `convention` (discount rate, horizon). A **parameter file** (`parameters/<geoId>/<archetype>.json`) supplies the local values for one city. A **recipe** (`estimates/<geoId>/<slug>.recipe.json`) names the organization, picks a template and parameter files, and adds org inputs, provenance and conflicts. `tools/evaluate.mjs` turns recipes into **estimate records** (`botec.schema.json`) and rebuilds `registry.json`, which the site serves. You never write estimate records or the registry by hand.

## What to contribute, cheapest first

1. **Estimate for an organization in a city that already has parameters.** Write a recipe and run the evaluator. Most of the effort goes into finding the org's outputs (doses, enrollments, budget).
2. **A new city for an existing template.** Write a parameter file. Look up every `local` parameter using the template's `lookup.preferredSources`. If you copy another city's judgment, say "transferred unchanged from <geoId>" in `rationale`. The [localization test](localization-test.md) shows why this matters: copied judgments make cities look more different only in cost than they really are.
3. **A new template.** It must reproduce the central estimate of an existing published model (add the case to `tools/check.test.mjs`), or cite a published CEA it reproduces. Local and org parameters must not have defaults, so a missing lookup fails loudly instead of silently inheriting San Francisco.

## Rules every contribution must follow

- **Distributions, not points.** Every input has p10/p50/p90. Set `basis: "analyst-scenarios"` when the three are pessimistic/central/optimistic judgments rather than calibrated quantiles. A fixed value uses `shape: "fixed"`.
- **Cite or explain.** `basis` of `observed`, `derived` or `transferred` requires at least one source with URL and retrieval date. `judgment` requires a rationale. The schema enforces both.
- **Never guess identifiers.** Use `us-ein:<9 digits>` only after verifying the EIN from IRS or ProPublica. Otherwise use `slug:<org-name>`.
- **Marginal, not average.** Set `margin.basis` honestly. Average cost divided by average outputs is `average`. It becomes `average-adjusted-to-marginal` only through named inputs such as `marginalYieldRetention` or `fundingAdditionality`.
- **Funding room.** `verified` requires evidence of an unfunded, priced plan. Organization statements are `org-stated`. Otherwise use `unverified` or `none`. The MCP `allocate` tool ignores anything below `verified`.
- **Null boundary.** Templates state when benefit is zero. Do not hide it by narrowing distributions.
- **Do not change universal parameters in a parameter file or recipe** unless you set `overrideReason`. The evaluator records the override, and the record cannot leave `draft` until an independent auditor accepts it.

## Provenance (same rules as GiveBetter's own research)

- Record each closed research interval in `provenance.sessions` with actual start/end timestamps, a stable `workerId`, `role`, and the verified runtime model (`id`, `name`, `evidence`). If you cannot verify the model, set `model: null`. Never infer it from UI settings or another agent.
- Time one organization per interval. Stop the clock before switching organizations, testing, integrating or waiting. Never split a batch duration across records. Unknown time stays `null`. It is never reconstructed.
- Author, modeling and audit sessions are separate entries. An auditor who saw the author's private reasoning is not independent.
- `evidence` must be safe to publish: no private logs, credentials or unrelated conversations.

## Conflicts of interest

Set `conflictOfInterest.declared: true` if you, or the principal you act for, has a financial, employment, board, grant or family relationship with the organization or a direct competitor for the same funds. If the organization (or an agent it runs) wrote the record, also set `selfSubmitted: true` and `authorRelationship: "self-submitted-by-org"`. CI keeps such records at `draft`. See [README.md](README.md) for how they are promoted.

## Workflow

```bash
git clone https://github.com/Rhys-Lindmark/market-for-impact && cd market-for-impact && npm ci
# add or edit files under docs/open-botec/{templates,parameters,estimates}
node docs/open-botec/tools/evaluate.mjs docs/open-botec/estimates/<geoId>/<slug>.recipe.json   # preview
node docs/open-botec/tools/evaluate.mjs --all                                                   # regenerate records + registry.json
node --test docs/open-botec/tools/check.test.mjs                                                # must pass
```

Open one pull request per organization or per city parameter file. In the description, list each lookup that failed and what you substituted. Do not edit other contributors' records. Supersede them with a new `modelVersion` and `status.supersedes`.

## Formula grammar

Template expressions may use numbers, parameter and `derived` names, `+ - * / ^ ( ) ,`, and `exp`, `log`, `min`, `max`. Nothing else is evaluated. Derived expressions run in order, before the formulas.

## Read API

| Surface | Address | Notes |
|---|---|---|
| llms.txt | `/givebetter/llms.txt` | Plain-text entry point; lists every estimate |
| Registry / search | `/givebetter/api/open-botec?geo=&cause=&archetype=&q=` | Summaries with p10/p50/p90 price and native cost |
| Full record (JSON twin) | `/givebetter/api/open-botec/estimate?id=<id>` | Exactly the committed estimate record |
| Compare | `/givebetter/api/open-botec/compare?ids=a,b` | Sorted by simulated median; warns on mixed archetypes, drafts and unverified room |
| Templates / schema | `/givebetter/api/open-botec/templates`, `/schema?name=botec\|template\|parameters` | |
| MCP | `POST /givebetter/api/mcp` | Stateless Streamable HTTP. Tools: `search_estimates(geo, cause, archetype, q)`, `get_botec(id)`, `compare(ids)`, `list_templates()`, `allocate(amount, geo)` |

All JSON responses send `Access-Control-Allow-Origin: *` and are cached for five minutes.

### Not yet built

- A JSON twin linked from each human report page (`<link rel="alternate" type="application/json">`). The ~300 legacy reports first need to be factored into templates.
- Write tools over MCP. Contributions go through GitHub pull requests so CI and review apply.
- Room-capped allocation. `allocate` gives everything to the single cheapest eligible record until records carry room amounts.
