# Handoff to Codex: PR triage bot (PR #391) and PR #390

Written 2026-10-18 by Claude Opus 5.5. Rhys ran out of Claude usage, so Codex is taking over. Read AGENTS.md and CLAUDE.md first.

## Goal

Rhys wants a bot that manages incoming PRs. It tests them, reviews them adversarially and merges only the safe ones. Merging to main auto-deploys to production through Cloudflare, so auto-merge means auto-publish. The bot's first real case is PR #390, the Salvation Army research draft. **Do not merge #390 by hand; the bot should merge it.**

## State

- **PR #391** (`claude/pr-triage-pipeline`): https://github.com/Rhys-Lindmark/market-for-impact/pull/391. It is open and not merged. Its `gate` check passed. CodeQL flagged 5 high alerts in `scripts/pr-triage/review.mjs` (incomplete HTML sanitization and table escaping). The last commit on the branch fixes them; confirm CodeQL is green on the new head.
- **PR #390**: open, still a **draft**, mergeable, existing checks green. Run locally, the gate tests pass (17/17) and the classifier says `auto-eligible` with no violations.
- **Repo settings, all still unset:** no `ANTHROPIC_API_KEY` secret, auto-merge not allowed, no branch protection or ruleset on main, no `PR_*` variables.

## Files in #391

| File | Role |
|---|---|
| `.github/workflows/pr-gate.yml` | Job 1 (`pull_request`, read-only, no secrets): open-BOTEC + research-effort tests, triage unit tests, then the classifier. Both the tests and the classifier come from the base branch. |
| `.github/workflows/pr-triage.yml` | Jobs 2–3 (`workflow_run` after "PR gate", checks out main only, never runs PR code). `classify`, then `label`, then `review` (claude-code-action pinned to the v1.0.252 SHA, read-only token, `ANTHROPIC_API_KEY` only), then `publish` (posts a COMMENT review, sets labels and the `pr-triage/ready` status), then `merge` (fixed rules, `gh pr merge --auto --squash --match-head-commit`). |
| `scripts/pr-triage/classify.mjs` (+ `.test.mjs`) | Path classifier: `auto-eligible` vs `needs-human`, plus violations that fail the gate (tier above draft without an independent audit, edits to another account's record, reused ids). |
| `scripts/pr-triage/review.mjs` (+ `.test.mjs`) | Bundles PR files as untrusted data under neutral names, and derives the final verdict deterministically. Also renders the comments. |
| `scripts/pr-triage/review-prompt.md`, `verdict.schema.json` | Reviewer prompt (the README §3 audit) and its structured-output schema. |
| `docs/open-botec/README.md` §5, `docs/open-botec/agents.md` | Pipeline docs and the settings checklist. |

The merger enables auto-merge only when all of these hold: `PR_AUTOMERGE=on` (the kill switch; unset means off), the PR is auto-eligible and not a draft, the gate passed, the AI verdict is pass for the current head, the author is on `PR_AUTOMERGE_ALLOWLIST` (default `Rhys-Lindmark`), and the daily cap (`PR_AUTOMERGE_DAILY_CAP`, default 5) isn't reached.

## Next steps

1. Check the CodeQL result on #391's latest head. If it is still red, fix `review.mjs` and run `scripts/run-guarded.sh -- node --test scripts/pr-triage/classify.test.mjs scripts/pr-triage/review.test.mjs`.
2. Get Rhys's OK, then merge #391 to main. Per AGENTS.md: fetch main first, never force-push.
3. Rhys does these himself. Agents must not change repo settings.
   1. Add the secret `ANTHROPIC_API_KEY`.
   2. Turn on Settings → General → Allow auto-merge.
   3. Add a ruleset or branch protection on `main`: required checks `gate` and `pr-triage/ready` (source: GitHub Actions); block force pushes; leave "require up to date" off. Agents that push main directly will then need a bypass for Rhys's account.
   4. Set the variable `PR_AUTOMERGE=on`.
4. Mark #390 Ready for review. That fires PR gate, then PR triage, then the AI review, then auto-merge. If it was already marked ready before #391 merged, switch it back to draft and then to ready again.
5. Verify: #390 gets the `auto-eligible` and `ai-review-pass` labels, the review comment, and a `pr-triage/ready` success status, then merges. After that, check that Cloudflare Workers Builds deployed it. Merges made with the Actions token don't trigger other Actions workflows, but Cloudflare uses its own GitHub app.
6. If the review blocks: read its comment on #390, fix the draft on #390's branch, and push. The pipeline re-runs on the new commit.

## Known gaps

- The `workflow_run` half has never run, because it only fires once it's on main. Expect first-run fixes. The likeliest problems: claude-code-action's `structured_output` with `--json-schema`, artifact download across runs, and `gh pr merge --auto` failing while auto-merge is off.
- actionlint and shellcheck were not available. The YAML structure and every `run:` block were checked with `bash -n` only.
- Dependabot PRs get a read-only token under `workflow_run`, so their label job fails. They're needs-human anyway.
- The repo has no LICENSE file yet.

## Codex continuation (2026-10-18)

- Verified all checks, including CodeQL, passed on `763d9fba`; the PR-ref CodeQL API returned zero open alerts. New commits must pass again before merge.
- Fixed the review decision's `DRAFT:` shell command by moving it into the step environment. Executed the actual decision script for all 64 combinations of eligibility, gate, draft, allowlist, event and manual-review input; all passed.
- Made the review depend on labeling, so a late label job cannot overwrite the final review status with pending or remove its labels.
- Validate every field against the verdict schema before deciding pass. Malformed nested findings and sources now block and render a usable error comment.
- Enforce estimate-record ownership for modifications/deletions, and route all existing tier/audit changes to a human, including draft/retracted transitions.
- Validation: triage tests 13/13; BOTEC and research-effort tests 17/17; actionlint 1.7.12 passed both workflows; every shell block passed `bash -n`; patched classifier still reports #390 head `3e994c16` auto-eligible with no violations or human reasons. End-to-end AI review remains untested until the workflow is on main and the secret exists.
- No PRs merged, comments posted, or repository settings changed. #390 remains a draft. Next: latest-head checks, Rhys's explicit merge OK for #391, then Rhys's settings checklist above.
- Resource baseline: 28 GiB disk available; workspace 396 MiB; Codex family 125 processes / 3529 MiB RSS (RSS excludes compression/swap); system compressor about 5.4 GiB, swap 3.1 GiB, reported free-memory percentage 47–49%. Used one source-only worktree (117 MiB), existing Node 24, sequential tests with a 1 GiB watchdog, and a small temporary AJV/actionlint install. No servers or browser sessions started. Keep below the Space Saver task/family budgets (5/10 GiB) and recovery thresholds; remove temporary tooling after verification.
