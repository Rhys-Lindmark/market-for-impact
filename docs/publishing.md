# Publishing GiveBetter

## Current status

Cloudflare is production as of 18 October 2026. GitHub main automatically builds and deploys the GiveBetter Worker. Both Claude Opus and Codex can publish checked changes by pushing main; no Codex chat, local machine, or separate Sites publication is required.

## Existing routing

- Public URL: https://ai.rhyslindmark.com/givebetter/.
- DNS CNAME for ai.rhyslindmark.com: rhyslindmark-website.pages.dev.
- Authoritative DNS nameservers: ns-cloud-d1/d2/d3/d4.googledomains.com.
- Pages project: rhyslindmark-website, source https://github.com/Rhys-Lindmark/rhyslindmark-website.
- Its functions/_middleware.js maps /givebetter to https://givebetter.rhyslindmark.workers.dev and strips the prefix. Other AI applications have separate mappings.
- Worker: givebetter; D1: givebetter, fef36523-34e5-45f4-8fba-13c8ff9cc21c.
- Previous Sites project retained for rollback: appgprj_6a938448e31c81918e35da08d93d95fd, public audience.
- Application source: https://github.com/Rhys-Lindmark/market-for-impact, main.

The cutover changed only GiveBetter’s upstream. DNS, nameservers, www, and other AI applications remain on their existing configuration.

## Shared development and deployment

Both Claude Opus and Codex may push reviewed changes. Fetch and integrate current main before pushing; never force-push. Each agent works in its own checkout. Research provenance and existing release requirements still apply.

Cloudflare Workers Builds is connected to Rhys-Lindmark/market-for-impact, production branch main. The host builds and publishes without relying on either agent being online. Credentials belong in Cloudflare’s integration, not in source or chat. After pushing, check Workers & Pages → givebetter → Deployments for a successful build of the exact commit, then check the changed public page. Do not manually deploy from a second publisher while a build is active.

Commands (Node 22.13 or newer, using package-lock.json):

```sh
npm ci
node --test scripts/research-effort.test.mjs scripts/cloudflare.test.mjs
npm run build:cloudflare
npm run db:migrate:cloudflare
npm run deploy:cloudflare
```

The last two commands target the remote database/Worker and require account authorization. Build selects the direct Cloudflare profile, skips the Sites plugin, and emits dist/server/wrangler.json. Deploy consumes that generated configuration and refuses a different Worker or database. Normal npm run build retains the existing Sites profile during migration.

Configured build command: node --test scripts/research-effort.test.mjs scripts/cloudflare.test.mjs && npm run build:cloudflare. Deploy command: npm run db:migrate:cloudflare && npm run deploy:cloudflare. NODE_VERSION=22. The build token has successfully deployed both D1 migrations and the Worker. Branch previews are not configured; isolate their resources before allowing preview writes.

The default direct-build asset prefix is https://ai.rhyslindmark.com/givebetter. Workers Builds sets GIVEBETTER_ASSET_ORIGIN=https://givebetter.rhyslindmark.workers.dev so the Worker can be checked independently; the existing Pages middleware rewrites that origin to the public subpath. Never publish a build containing a localhost asset origin.

## Verified cutover

- Main commit 6b3c2c8e6e8382133c1bd177668141f063b81f77 automatically deployed successfully in build 6db5de94-2e74-4c0b-b2f0-7018ac120ea4; Worker version 95f41c9d-5e73-4d08-806f-48bfc910aee7.
- Routing commit 61a5f5ca52fc87511df196d5d058be2d443e9cc4 in rhyslindmark-website deployed successfully as Pages deployment eaa4dbec-4daf-42f9-ba00-649de04b5c38 at 17:19 UTC.
- All 14 schema migrations applied to the dedicated D1. Six public API summaries match the previous Sites deployment, including accepted grants, GiveWell, Coefficient, geography, SF outcomes, and SF public funding.
- City Theory publicly renders “What we learned from 295 reports.” Canonical tablet rendering has no horizontal overflow and loads its styles. The routing middleware passed 16 checks, including subpath rewriting and unchanged routes/security behavior.
- Further checks and operational receipts: docs/cloudflare-migration-20261018.md.

## Rollback

Keep the old Sites deployment and its database until cutover is accepted. Restore the previous /givebetter upstream mapping in rhyslindmark-website to route back to Sites. Worker code rollback does not roll back D1 data. Do not deploy older Sites snapshots over a newer production release.
