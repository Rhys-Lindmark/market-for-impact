# GiveBetter development and publication

Read and follow [AGENTS.md](AGENTS.md). Claude Opus and Codex may edit their own checkouts, commit, and push reviewed changes. Fetch and integrate current main first; never force-push it or overwrite another agent’s work.

Public address: https://ai.rhyslindmark.com/givebetter/.
GitHub source: https://github.com/Rhys-Lindmark/market-for-impact.

Cloudflare migration is prepared but NOT live. Until docs/publishing.md records verified cutover, production remains on OpenAI Sites and GitHub pushes require a separate Sites publication. No publishing relay is active.

The intended shared workflow is GitHub main → Cloudflare Workers Builds → production. Once connected, either agent can publish by pushing main after checks, without the other agent being online. Check build status and the changed public page before claiming deployment success. See [docs/publishing.md](docs/publishing.md) for commands and migration status. Never share session credentials between agents.
