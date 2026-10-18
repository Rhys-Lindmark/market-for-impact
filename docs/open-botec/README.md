# Open BOTEC repository

An open, agent-writable collection of back-of-the-envelope cost-effectiveness estimates (BOTECs) for nonprofits, served at https://ai.rhyslindmark.com/givebetter/agents and https://ai.rhyslindmark.com/givebetter/llms.txt.

**The bet:** a few hundred intervention archetypes, each with local parameters, can cover most nonprofits. Scaling then means localizing templates, not doing bespoke research per organization. The first [localization test](localization-test.md) supports the mechanics: going from SF to Chicago took about 2 minutes. It does not yet support the evidence: only costs actually changed between cities. Read it before trusting the bet.

| File | What it is |
|---|---|
| [botec.schema.json](botec.schema.json) | One estimate record: key, native outcome, optional QALY layer, distributions, cited inputs, margin flag, funding room, provenance, conflicts, status tier |
| [template.schema.json](template.schema.json), [templates/](templates/) | Intervention archetypes with universal and local parameters (naloxone distribution, lifestyle diabetes prevention, tai chi fall prevention) |
| [parameters.schema.json](parameters.schema.json), [parameters/](parameters/) | Local values per geography (San Francisco, Chicago) |
| [estimates/](estimates/) | Recipes (`*.recipe.json`, hand-written) and generated records |
| [registry.json](registry.json) | Generated bundle the site serves; never edit by hand |
| [tools/evaluate.mjs](tools/evaluate.mjs), [tools/check.test.mjs](tools/check.test.mjs) | Evaluator and CI gate. No dependencies beyond the repo's ajv |
| [agents.md](agents.md) | Contribution protocol and read API |
| [localization-test.md](localization-test.md) | SF → Chicago test and where it broke |

## Governance and anti-gaming

Anyone, including any agent, can open a pull request. The design assumes some contributors will be wrong, some careless, and some motivated to make a particular organization look good.

### 1. CI validation (automatic, every PR)

`node --test docs/open-botec/tools/check.test.mjs` enforces:

- Every template, parameter file and record validates against its schema. Observed, derived or transferred inputs need cited sources with retrieval dates. Judgments need a rationale. Local and org parameters cannot have template defaults.
- Every committed record equals what the evaluator produces from its recipe, and `registry.json` is current. Nobody can hand-edit a headline number.
- Each template still reproduces the published SF central estimate it was factored from.
- Self-submitted or conflicted records cannot be above `draft`. Any record above `draft` must carry an independent passing audit.

Planned CI additions: flag any PR that moves a record's simulated median more than 3x without a new source; flag p10/p90 narrowing without new evidence; check source URLs resolve and retrieval dates aren't in the future; and diff universal-parameter overrides.

### 2. Status tiers

| Tier | Means | How to get there |
|---|---|---|
| `draft` | CI-valid only | Merge |
| `agent-reviewed` | At least one independent adversarial agent audit passed with no unresolved blocking finding | Audit record in `provenance.audits` with `independent: true` |
| `human-reviewed` | A named human with no conflict accepted it | Maintainer review |
| `retracted` | Kept for history; excluded from search and allocation | Maintainer |

Every API response and the MCP server return the tier with every price. `allocate` refuses drafts.

### 3. Adversarial audit agents

An auditor is a separate agent session that did not author the record and gets only the committed files, never the author's transcript. Its job is to try to break the estimate:

- Re-fetch every cited source and check that the quoted figure supports the value and unit (the Chicago test caught a kit-versus-dose mismatch this way).
- Re-derive the two or three inputs that drive the price (largest elasticity) from independent sources.
- Check the counterfactual: who else funds or provides this service, and does `additionality` reflect it?
- Look for double counting across the organization's other records, and for structural disagreement with existing models of the same organization. The repo's population-based CRA model gives a price about 130x the template's, which an auditor must surface rather than average away.

Audit findings go in a publishable file referenced by `findingsRef`. Blocking findings keep the record at `draft` until resolved by a new `modelVersion`. Audit sessions are timed and model-attributed like research sessions.

### 4. Nonprofits submitting about themselves

Organizations are the best source of their own outputs, budgets and funding gaps, and the most motivated to inflate them. So:

- Self-submission is welcome and labeled: `conflictOfInterest.selfSubmitted: true`, `authorRelationship: "self-submitted-by-org"`. The record shows on the site and API as **self-reported draft**.
- An organization may supply `org` parameters and funding-room evidence. It may not set `universal` parameters, and `local` judgments it supplies are treated as claims to verify.
- A self-submitted record leaves `draft` only when an independent contributor re-derives it in a separate record (same key, new `modelVersion`, `supersedes` set) and that record passes audit. The organization's version stays visible for comparison.
- Funding room stated by the organization is `org-stated`, never `verified`, until a third party confirms the priced plan.
- Competitor submissions (`grantee-competitor`) follow the same path: allowed, labeled, and never promoted on their own.

### 5. Maintainers and merges

GiveBetter maintainers (currently Rhys Lindmark and his coding agents, per [AGENTS.md](../../AGENTS.md)) merge PRs to main, which deploys through Cloudflare. A merge means CI passed and the PR follows [agents.md](agents.md). It does not mean the estimate is endorsed; only the tier says that.

### Open questions for the maintainer

- The repository has no license file. Outside contributions need one; consider CC BY 4.0 for data and MIT for tools.
- Should the ~300 legacy GiveBetter models be factored into templates (most effort, most coverage) or left as bespoke records linked from `links.legacyModel`?
- Should `transferred-judgment` become its own basis that automatically widens distributions?
