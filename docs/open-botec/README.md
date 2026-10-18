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

The PR classifier (section 5) also routes to a human any PR that moves a record's simulated median more than 3x, or narrows its p10–p90 range, without adding a source. Planned CI additions: check source URLs resolve and retrieval dates aren't in the future, and diff universal-parameter overrides.

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

### 5. Pull request pipeline

Merging to main deploys to production through Cloudflare, so auto-merge is auto-publish. Every PR goes through three separate jobs. Only the last can merge, and it decides with fixed rules, not AI judgment.

| Job | Workflow | Runs PR code? | Token and secrets | Does |
|---|---|---|---|---|
| 1. Gate | [`pr-gate.yml`](../../.github/workflows/pr-gate.yml) (`pull_request`) | Yes | Read-only; no secrets | Runs `check.test.mjs`, `scripts/research-effort.test.mjs` and the triage unit tests, then the path classifier taken from main |
| 2. Reviewer | [`pr-triage.yml`](../../.github/workflows/pr-triage.yml) `review` job (`workflow_run`) | No: checks out main and reads the PR as data | Read-only; `ANTHROPIC_API_KEY` only | Adversarial audit (section 3) by Claude via `anthropics/claude-code-action`, with tools limited to Read, Glob, Grep, WebFetch and WebSearch |
| 3. Merger | `pr-triage.yml` `label`, `publish` and `merge` jobs | No | Write, no AI | Labels, posts the review as a comment, sets status `pr-triage/ready`, and enables auto-merge or asks for a maintainer |

**Classifier** ([`scripts/pr-triage/classify.mjs`](../../scripts/pr-triage/classify.mjs)). A PR is `auto-eligible` only if every changed file is in `docs/open-botec/{parameters,estimates,templates}/`, `docs/open-botec/registry.json`, `docs/research-drafts/` (`.md`, `.json`, `.csv`, `.txt`), or is an additive-only change to `data/research-effort.json`. Everything else is `needs-human`: `app/`, `lib/`, `scripts/`, workflows, schemas, `tools/`, package files, and any `CLAUDE.md`, `AGENTS.md`, `.claude/` or other dot-path. Inside the eligible paths these also need a human: deleting or renaming a file, editing a template or parameter file in place, raising a tier or changing audits, rewriting existing lines of the drafts index, and the median and range moves in section 1. The gate fails outright when a record is above `draft` without an independent passing audit, when a PR edits a recipe, template, parameter file or draft that another GitHub account added (supersede it instead), or when a new record reuses an existing id.

**Reviewer.** Runs automatically only for auto-eligible PRs that passed the gate and whose author is on the allowlist, which bounds API spend. A maintainer can run it on any PR from Actions → PR triage → Run workflow. The PR title, body and files are copied out of git under neutral names (`untrusted/files/NNN-head.txt`) so that no PR file can act as agent instructions or settings, and the prompt ([`scripts/pr-triage/review-prompt.md`](../../scripts/pr-triage/review-prompt.md)) treats them as data. It re-fetches cited sources and checks figures and units, checks the counterfactual and additionality, flags guessed EINs, and flags p10/p90 narrowing or median moves above 3x without new sources. It returns a structured verdict. [`review.mjs`](../../scripts/pr-triage/review.mjs) turns that into the final verdict with fixed rules: any blocking finding, suspected prompt injection or malformed output counts as blocking. The review is posted as a comment, never an approval.

**Merger.** Enables GitHub auto-merge (squash, pinned to the reviewed commit) only when all of these hold:

- repository variable `PR_AUTOMERGE` is `on` (the kill switch: anything else, including unset, stops all auto-merges);
- the PR is `auto-eligible` and not a draft;
- the gate passed and the AI verdict is `pass`, both for the current head commit;
- the author is on `PR_AUTOMERGE_ALLOWLIST` (default `Rhys-Lindmark`);
- fewer than `PR_AUTOMERGE_DAILY_CAP` (default 5) PRs were auto-merged or queued for auto-merge today (UTC).

Otherwise it keeps one triage comment up to date with the reasons and asks @Rhys-Lindmark to review. It never merges `needs-human` PRs. If a new commit arrives, the status `pr-triage/ready` for that commit is missing or pending until it is reviewed again, so a queued auto-merge cannot land unreviewed code, and the bot turns off any auto-merge it had enabled when the commit no longer qualifies.

A merge means CI passed and the PR follows [agents.md](agents.md). It does not mean the estimate is endorsed; only the tier says that. GiveBetter maintainers (currently Rhys Lindmark and his coding agents, per [AGENTS.md](../../AGENTS.md)) can still merge any PR by hand.

#### Settings the maintainer turns on

The workflows do nothing harmful until these are set, and none of them is set by the workflows.

1. **Secret** `ANTHROPIC_API_KEY` (Settings → Secrets and variables → Actions). Use a key in a workspace with a spend limit.
2. **Allow auto-merge** (Settings → General → Pull Requests).
3. **Branch protection or a ruleset for `main`:** require a pull request; require status checks `gate` (from the PR gate workflow) and `pr-triage/ready`, with GitHub Actions as the expected source; block force pushes. Leave "require branches to be up to date" off, or auto-merge stalls whenever main moves. Coding agents that push to main directly per [AGENTS.md](../../AGENTS.md) then need a bypass for Rhys's account, or should switch to PRs.
4. **Variables** (same page, Variables tab): `PR_AUTOMERGE=on` when ready; optionally `PR_AUTOMERGE_ALLOWLIST` (comma-separated logins; add agent bot accounts such as `claude[bot]` only if their invocations are limited to maintainers), `PR_AUTOMERGE_DAILY_CAP` and `PR_REVIEW_MODEL`.
5. **Fork PR approval:** keep "Require approval for first-time contributors" on (Settings → Actions → General).

Limits: workflows triggered by `workflow_run` only run once they are on main. Dependabot PRs get a read-only token in `workflow_run`, so their triage labels fail; they are `needs-human` anyway. Merges made with the Actions token do not trigger other Actions workflows; Cloudflare Workers Builds listens through its own GitHub app, so check the first auto-merge actually deploys.

### Open questions for the maintainer

- The repository has no license file. Outside contributions need one; consider CC BY 4.0 for data and MIT for tools.
- Should the ~300 legacy GiveBetter models be factored into templates (most effort, most coverage) or left as bespoke records linked from `links.legacyModel`?
- Should `transferred-judgment` become its own basis that automatically widens distributions?
