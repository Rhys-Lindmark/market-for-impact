# GiveBetter development and publication

Read and follow [AGENTS.md](AGENTS.md). Claude Opus and Codex may edit their own checkouts, commit, and push reviewed changes. Fetch and integrate current main first; never force-push it or overwrite another agent’s work.

Public address: https://ai.rhyslindmark.com/givebetter/.
GitHub source: https://github.com/Rhys-Lindmark/market-for-impact.

Cloudflare is production. OpenAI Sites is retained only for rollback; do not publish routine releases there.

The shared workflow is GitHub main → Cloudflare Workers Builds → production. Either agent can publish by pushing main after checks, without the other agent being online. Cloudflare runs the build, D1 migrations, and deployment automatically. Check build status and the changed public page before claiming deployment success. See [docs/publishing.md](docs/publishing.md) for commands and the verified cutover receipt. Never share session credentials between agents.
