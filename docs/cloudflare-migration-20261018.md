# Cloudflare migration checkpoint — 18 October 2026

## Objective and authorization

Rhys requested moving GiveBetter to Cloudflare so Claude Opus and Codex can both publish through GitHub. Keep https://ai.rhyslindmark.com/givebetter/ and preserve other sites. Rhys explicitly approved Cloudflare MCP’s broad persistent account access in this chat. No scheduled Codex relay was created. Use the in-app browser, not the user’s Chrome, for subsequent browser work.

## Account setup

Followed https://developers.cloudflare.com/agent-setup/prompt.md. Installed 19 official skills under /Users/rhyslindmark/.agents/skills; registered https://mcp.cloudflare.com/mcp in /Users/rhyslindmark/.codex/config.toml. Codex OAuth CLI reported successful login. Installed the upstream migrate-to-vinext skill under ~/.codex/skills. Do not repeat authorization or inspect stored credentials. Restart Codex to load the new MCP tool catalog; this running session has no Cloudflare tools. Optional cf CLI was not installed; this existing application already uses pinned Wrangler.

## Routing evidence

DNS resolves ai.rhyslindmark.com as a CNAME to rhyslindmark-website.pages.dev. Authoritative nameservers are Google-hosted. The rhyslindmark-website GitHub repository’s functions/_middleware.js maps /givebetter to the existing Sites origin. Existing Cloudflare dashboard account observed: f53f66cf5f3fa18577e91e87b5100136. Verify the authenticated account and Pages ownership before mutation; another account named Roote is also present. No DNS, routing, database, or remote Worker changes have been made.

## Source and verification

Checkout: /Users/rhyslindmark/Documents/ChatGPT/GiveBetter/source, branch codex/cloudflare-deployment. GitHub main advanced concurrently; integrated origin/main 47fa388, preserving the featured-unit-card changes. The migration adds an opt-in direct Cloudflare build, guarded deployment/migration commands, a pull-request build check, and shared agent instructions. Existing Sites builds remain available until cutover. Database ID remains a placeholder and remote commands refuse it.

Evidence before integrating the concurrent featured-unit changes: native Cloudflare build passed; all 14 local SQL migrations passed; City Theory rendered 295 reports; 18 phone/tablet tests passed (sf-city-theory and top-four-captions); seven local APIs returned 200 with valid JSON, including D1-backed ledgers and SF public funding. Release guard and research provenance tests: 13 passed. Vinext compatibility scan: 100%, 9 supported, no partials or issues. A fresh production build is run after integrating current main; see PR validation for its result. Database tests used a new isolated local D1 only, never the live Sites database. Full live data reconciliation and temporary hosted runtime checks remain required.

## Next steps

Follow docs/publishing.md. Inspect account resources and plan limits; provision/reuse a dedicated GiveBetter D1; reconcile the live Sites database; replace placeholder; deploy a temporary Worker; verify application, data, subpath links/assets, APIs and responsive views; configure Workers Builds from GitHub main; test a push; change only /givebetter’s middleware upstream; verify canonical production and record receipt. Keep Sites available for rollback. Do not claim setup alone enables automatic production publication.

## Space Saver

Disk baseline: 21 GiB available, 95% used. Source clone 143 MiB. Reused a lockfile-identical dependency installation through per-package links; local Vite cache paths avoid writing shared dependencies. One production build directory (~48 MiB) and isolated local D1 state (~17 MiB) are regenerable. No browser installation or duplicate dependency installation. The task’s local preview on port 3118 was stopped after tests; no server needs to remain running. Production archives were not created. Keep concise evidence; clean local test traces after retaining outcomes.
