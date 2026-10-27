# Stop repeated organization completeness scans

Unchanged Coefficient, Coefficient EGC, GiveWell, Giving Green, and RenPhil snapshots now return after the existing indexed source URL/content-hash lookup. They no longer count organization roles and source aliases on every page/API request. The importer writes its content hash only after organization graph reconciliation succeeds; new, changed, or invalidated snapshots retain the existing import and reconciliation path. No schema or production-data changes are required.

This removes the repeated completeness scans, not the database reads needed to display grants and organizations. It does not reset an already exhausted daily account allowance. If stored relationships require administrative repair, invalidate the affected source's content hash and reimport it; an unchanged hash intentionally no longer triggers an automatic graph audit. Any future graph-schema migration must likewise invalidate affected completion markers.

## Verification

- 15 isolated SQLite regression cases execute the actual TypeScript importers and SQL against the repository's migrations. They cover all five importers, repeated requests, cold module initialization, invalidated imports, failed reconciliation, and retry. Repeated calls execute exactly one source lookup per importer and no completeness counts.
- 36 focused checks pass: snapshot read paths, organization identity, grant-flow contract, research effort, and Cloudflare deployment guards.
- Direct Cloudflare production build passes using existing dependencies.

## Resource record

Reused the existing clean ranked-source checkout and dependency symlink; fast-forwarded from 4c2a408 to current main 0fc00f5 before edits. Initial checkout size 160 MiB, available filesystem space 51 GiB. Physical RAM 16 GiB, system memory free percentage 51%, compressor about 5.25 GiB, swap 2.88 GiB; relevant Codex/Node processes about 3.27 GiB RSS across 91 processes, largest about 1.05 GiB RSS (RSS excludes compressed/swapped memory). Tests and build ran sequentially through scripts/run-guarded.sh with a 2 GiB process-group limit. No dependency installs or extra checkouts.
