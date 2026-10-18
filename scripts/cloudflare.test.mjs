import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

// Test release refusals in an isolated fixture: no credentials, network, or
// production resources are touched, and no Wrangler executable is installed.
function attempt(config, built, action = 'deploy') {
  const dir = mkdtempSync(join(tmpdir(), 'givebetter-deploy-guard-'));
  try {
    mkdirSync(join(dir, 'scripts'));
    mkdirSync(join(dir, 'dist/server'), { recursive: true });
    writeFileSync(join(dir, 'scripts/cloudflare.mjs'), readFileSync(new URL('./cloudflare.mjs', import.meta.url)));
    writeFileSync(join(dir, 'wrangler.cloudflare.jsonc'), JSON.stringify(config));
    if (built) writeFileSync(join(dir, 'dist/server/wrangler.json'), JSON.stringify(built));
    return spawnSync(process.execPath, [join(dir, 'scripts/cloudflare.mjs'), action], { encoding: 'utf8' });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('remote commands refuse an unconfigured database before launching Wrangler', () => {
  const config = { name: 'givebetter', d1_databases: [{ binding: 'DB', database_id: '00000000-0000-4000-8000-000000000000' }] };
  for (const action of ['deploy', 'migrate']) {
    const result = attempt(config, null, action);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Create the GiveBetter D1 database/);
    assert.doesNotMatch(result.stderr, /Cannot find module/);
  }
});

test('deployment refuses artifacts built for a different Worker or database', () => {
  const config = { name: 'givebetter', d1_databases: [{ binding: 'DB', database_id: 'fixture-new-database' }] };
  for (const built of [
    { ...config, name: 'old-sites-worker' },
    { ...config, d1_databases: [{ binding: 'DB', database_id: 'fixture-old-database' }] },
  ]) {
    const result = attempt(config, built);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Build configuration is stale or belongs to another host/);
    assert.doesNotMatch(result.stderr, /Cannot find module/);
  }
});
