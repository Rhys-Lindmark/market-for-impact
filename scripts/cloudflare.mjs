import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const action = process.argv[2];
const config = JSON.parse(readFileSync(new URL('../wrangler.cloudflare.jsonc', import.meta.url), 'utf8'));
const env = {
  ...process.env,
  GIVEBETTER_HOST: 'cloudflare',
  WRANGLER_SEND_METRICS: 'false',
  WRANGLER_WRITE_LOGS: 'false',
  WRANGLER_LOG_PATH: `${root}.wrangler/logs`,
  MINIFLARE_REGISTRY_PATH: `${root}.wrangler/registry`,
};
const vinext = `${root}node_modules/vinext/dist/cli.js`;
const wrangler = `${root}node_modules/wrangler/bin/wrangler.js`;
const commands = {
  build: [vinext, 'build'],
  dev: [vinext, 'dev', ...process.argv.slice(3)],
  deploy: [wrangler, 'deploy', '--config', 'dist/server/wrangler.json'],
  migrate: [wrangler, 'd1', 'migrations', 'apply', 'DB', '--remote', '--config', 'wrangler.cloudflare.jsonc'],
};
if (!Object.hasOwn(commands, action)) throw new Error('Use build, dev, deploy, or migrate.');
if (['deploy', 'migrate'].includes(action)) {
  const databaseId = config.d1_databases.find(binding => binding.binding === 'DB')?.database_id;
  if (!databaseId || databaseId === '00000000-0000-4000-8000-000000000000') {
    throw new Error('Create the GiveBetter D1 database in your Cloudflare account and set its database_id before deployment.');
  }
  if (action === 'deploy') {
    const built = JSON.parse(readFileSync(new URL('../dist/server/wrangler.json', import.meta.url), 'utf8'));
    if (built.name !== config.name || built.d1_databases?.find(binding => binding.binding === 'DB')?.database_id !== databaseId) {
      throw new Error('Build configuration is stale or belongs to another host. Run npm run build:cloudflare again.');
    }
  }
}
const result = spawnSync(process.execPath, commands[action], { cwd: root, env, stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
