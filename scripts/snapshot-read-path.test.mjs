import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const root = new URL('../', import.meta.url);
const importers = [
  ['coefficient-all', 'ensureAllCoefficientSnapshot'],
  ['coefficient', 'ensureCurrentSnapshot'],
  ['givewell', 'ensureGiveWellSnapshot'],
  ['giving-green', 'ensureGivingGreenSnapshot'],
  ['renphil', 'ensureRenPhilSnapshot'],
];
const graphCount = /SELECT COUNT\(\*\) AS count FROM (grant_organization_roles|organization_source_names)/;

// Run the actual import SQL against an isolated, migrated SQLite database.
// The adapter implements only the D1 methods used by these importers; it never
// connects to Cloudflare or touches a production database.
function fixture(t) {
  const sqlite = new DatabaseSync(':memory:');
  t.after(() => sqlite.close());
  for (const name of readdirSync(new URL('drizzle/', root)).filter(name => name.endsWith('.sql')).sort()) {
    sqlite.exec(readFileSync(new URL(`drizzle/${name}`, root), 'utf8'));
  }
  const queries = [];
  let failValidation = false;
  const DB = {
    prepare(sql) {
      let params = [];
      return {
        bind(...values) { params = values; return this; },
        async first() {
          queries.push(sql);
          if (failValidation && graphCount.test(sql)) return { count: -1 };
          return sqlite.prepare(sql).get(...params) ?? null;
        },
        async all() { queries.push(sql); return { results: sqlite.prepare(sql).all(...params) }; },
        async run() { queries.push(sql); sqlite.prepare(sql).run(...params); return { success: true }; },
      };
    },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try {
        const results = [];
        for (const statement of statements) results.push(await statement.run());
        sqlite.exec('COMMIT');
        return results;
      } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
  };
  const modules = new Map();
  function load(relative) {
    if (modules.has(relative)) return modules.get(relative).exports;
    if (relative.endsWith('.json')) return JSON.parse(readFileSync(new URL(relative, root), 'utf8'));
    const source = readFileSync(new URL(relative, root), 'utf8');
    const compiled = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
      reportDiagnostics: true,
    });
    assert.equal(compiled.diagnostics.length, 0, relative);
    const module = { exports: {} };
    modules.set(relative, module);
    const require = id => {
      if (id === 'cloudflare:workers') return { env: { DB } };
      assert.ok(id.startsWith('@/'), `Unexpected dependency: ${id}`);
      const path = id.slice(2);
      return load(path.endsWith('.json') ? path : `${path}.ts`);
    };
    vm.runInThisContext(`(function(module,exports,require){${compiled.outputText}\n})`, { filename: relative })(module, module.exports, require);
    return module.exports;
  }
  return { sqlite, queries, load, failValidation(value) { failValidation = value; } };
}

for (const [name, exported] of importers) {
  test(`${name}: repeated reads skip completeness counts, including after a cold start`, async t => {
    const f = fixture(t);
    const ensure = f.load(`db/${name}.ts`)[exported];
    const imported = await ensure();
    assert.ok(f.queries.some(sql => graphCount.test(sql)), 'new imports still validate relationships');
    const marker = f.sqlite.prepare('SELECT content_hash FROM sources WHERE id = ?').get(imported.sourceId).content_hash;
    assert.ok(marker, 'only a completed import receives its content hash');
    f.queries.length = 0;
    for (let request = 0; request < 3; request++) {
      const result = await ensure();
      assert.equal(result.sourceId, imported.sourceId);
      assert.equal(result.retrievedAt, imported.retrievedAt);
    }
    assert.equal(f.queries.length, 3);
    for (const sql of f.queries) assert.match(sql, /^SELECT id, content_hash, retrieved_at FROM sources WHERE url = \?$/);
    // Loading a fresh module graph must not reintroduce counts. Correctness does
    // not depend on an isolate-local cache surviving between requests.
    const cold = fixture(t);
    const snapshot = f.sqlite.prepare('SELECT * FROM sources WHERE id = ?').get(imported.sourceId);
    cold.sqlite.prepare('INSERT INTO sources (id, publisher, title, url, retrieved_at, content_hash) VALUES (?, ?, ?, ?, ?, ?)')
      .run(snapshot.id, snapshot.publisher, snapshot.title, snapshot.url, snapshot.retrieved_at, marker);
    await cold.load(`db/${name}.ts`)[exported]();
    assert.equal(cold.queries.length, 1);
    assert.equal(graphCount.test(cold.queries[0]), false);
  });

  test(`${name}: an invalidated snapshot is reimported and validated`, async t => {
    const f = fixture(t);
    const ensure = f.load(`db/${name}.ts`)[exported];
    const imported = await ensure();
    f.sqlite.prepare('UPDATE sources SET content_hash = NULL WHERE id = ?').run(imported.sourceId);
    f.queries.length = 0;
    await ensure();
    assert.ok(f.queries.some(sql => graphCount.test(sql)));
    assert.ok(f.sqlite.prepare('SELECT content_hash FROM sources WHERE id = ?').get(imported.sourceId).content_hash);
  });

  test(`${name}: failed reconciliation leaves no completion marker and can be retried`, async t => {
    const f = fixture(t);
    const ensure = f.load(`db/${name}.ts`)[exported];
    f.failValidation(true);
    await assert.rejects(ensure(), /organization graph failed reconciliation/);
    const marked = f.sqlite.prepare("SELECT COUNT(*) AS count FROM sources WHERE content_hash IS NOT NULL AND url IN (SELECT url FROM sources WHERE id IN (SELECT source_id FROM grants))").get();
    assert.equal(marked.count, 0);
    f.failValidation(false);
    const imported = await ensure();
    assert.ok(f.sqlite.prepare('SELECT content_hash FROM sources WHERE id = ?').get(imported.sourceId).content_hash);
  });
}
