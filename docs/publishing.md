# Publishing GiveBetter

## Current status

Migration preparation only: Cloudflare is not serving GiveBetter yet. The database ID in wrangler.cloudflare.jsonc is deliberately a placeholder; deploy and remote migration commands refuse to use it. No automatic publishing relay exists.

## Existing routing

- Public URL: https://ai.rhyslindmark.com/givebetter/.
- DNS CNAME for ai.rhyslindmark.com: rhyslindmark-website.pages.dev.
- Authoritative DNS nameservers: ns-cloud-d1/d2/d3/d4.googledomains.com.
- Pages project: rhyslindmark-website, source https://github.com/Rhys-Lindmark/rhyslindmark-website.
- Its functions/_middleware.js maps /givebetter to https://market-for-impact.rhyslindmark.chatgpt.site and strips the prefix. Other AI applications have separate mappings.
- Existing Sites project: appgprj_6a938448e31c81918e35da08d93d95fd, public audience.
- Application source: https://github.com/Rhys-Lindmark/market-for-impact, main.

Keep the public URL and change only GiveBetter’s upstream after validating the new Worker. No nameserver or www website migration is required.

## Shared development and deployment

Both Claude Opus and Codex may push reviewed changes. Fetch and integrate current main before pushing; never force-push. Each agent works in its own checkout. Research provenance and existing release requirements still apply.

The intended production integration is Cloudflare Workers Builds connected to GitHub main. Once configured, the host builds and publishes without relying on a Codex chat or local computer being awake. Credentials belong in Cloudflare’s integration, not in source or chat.

Commands (Node 22.13 or newer, using package-lock.json):

```sh
npm ci
node --test scripts/research-effort.test.mjs scripts/cloudflare.test.mjs
npm run build:cloudflare
npm run db:migrate:cloudflare
npm run deploy:cloudflare
```

The last two commands target the remote database/Worker and require account authorization. Build selects the direct Cloudflare profile, skips the Sites plugin, and emits dist/server/wrangler.json. Deploy consumes that generated configuration and refuses a different Worker or database. Normal npm run build retains the existing Sites profile during migration.

Cloudflare Workers Builds should use npm run build:cloudflare as the build command and npm run db:migrate:cloudflare && npm run deploy:cloudflare as the deployment command, after the real database and account are verified. Verify integration permissions for both Workers deployment and D1 migrations. Configure branch previews with isolated resources before allowing preview writes; this change does not configure previews.

The default direct-build asset prefix is https://ai.rhyslindmark.com/givebetter. For independent pre-cutover testing, set GIVEBETTER_ASSET_ORIGIN to the temporary Worker origin at build time. Never publish a build containing a localhost asset origin.

## Remaining migration steps

1. Restart Codex to load the authenticated Cloudflare MCP connection. The official skills are installed under ~/.agents/skills and the server is registered in ~/.codex/config.toml.
2. Inspect the authenticated account, existing Pages project, Worker plan limits, and any existing givebetter resource before creating anything. Reuse matching resources. Do not upgrade a paid plan without explicit approval.
3. Create an account-owned GiveBetter D1 database and replace the placeholder ID. Inspect the live Sites database before deciding how to populate it. The application contains source snapshots and lazy seed routines, but this does not prove there are no unique live rows. Reconcile/export any unique data; never discard it silently.
4. Deploy the current integrated GitHub source to a temporary Worker address. Run migrations against the new database only. Exercise all database-backed ledgers, APIs, representative reports, navigation, images, and phone/tablet layouts; reconcile key counts and current research content against the source/old deployment.
5. Connect GitHub main to Workers Builds and verify that a pushed commit produces a successful deployment. Keep only one production publisher active.
6. Fetch the latest rhyslindmark-website middleware and change only /givebetter’s upstream to the verified Worker origin. Test its existing middleware suite and subpath asset/link rewriting. Use the latest file SHA so concurrent changes cannot be overwritten. Let Pages deploy.
7. Verify the canonical public URL, asset loading, client navigation, APIs, and City Theory heading. Record source SHA, Worker deployment ID, database ID, Pages commit, checks, and timestamp. Then update these instructions to mark Cloudflare as production.

## Rollback

Keep the old Sites deployment and its database until cutover is accepted. Restore the previous /givebetter upstream mapping in rhyslindmark-website to route back to Sites. Worker code rollback does not roll back D1 data. Do not deploy older Sites snapshots over a newer production release.
