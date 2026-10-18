// node --test scripts/pr-triage/classify.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { classify, areaOf, appendOnly, effortAdditive } from './classify.mjs';

const E = 'docs/open-botec/estimates/us-il-chicago/';
const record = (over = {}) => ({
  id: 'slug:org/p/a/us-il-chicago/2025/v1',
  status: { tier: 'draft', since: '2026-10-18', ...over.status },
  inputs: over.inputs ?? { x: { sources: [{ url: 'https://a.example' }] } },
  qalyLayer: { pricePer10Qalys: { p10: 1000, p50: 4000, p90: 16000, ...over.price } },
  provenance: { sessions: [], audits: over.audits ?? [] },
});
const effort = (orgs) => JSON.stringify({ version: 1, timeBasis: 't', organizations: orgs });
const session = (id) => ({ id, workerId: 'w', phase: 'research', startedAt: '2026-10-18T10:00:00Z', endedAt: '2026-10-18T10:10:00Z', model: null });

function pr(files, { base = {}, head = {}, owners = {}, author = 'Rhys-Lindmark' } = {}) {
  return classify({
    files,
    author,
    readBase: (p) => base[p] ?? null,
    readHead: (p) => head[p] ?? null,
    listBase: (prefix) => Object.keys(base).filter((p) => p.startsWith(prefix)),
    originalAuthor: async (p) => owners[p] ?? null,
  });
}

test('paths outside the open-botec data, drafts and effort registry need a human', async () => {
  for (const p of ['app/page.tsx', 'lib/open-botec.ts', 'scripts/x.mjs', '.github/workflows/x.yml', 'docs/open-botec/botec.schema.json', 'docs/open-botec/tools/evaluate.mjs', 'docs/open-botec/agents.md', 'package.json', 'docs/research-drafts/x/CLAUDE.md', 'docs/research-drafts/x/.claude/settings.json', 'docs/research-drafts/x/page.html']) {
    assert.equal(areaOf(p), null, p);
    const r = await pr([{ status: 'A', path: p }]);
    assert.equal(r.label, 'needs-human', p);
  }
});

test('a new research draft plus additive research-effort entries is auto-eligible (PR #390 shape)', async () => {
  const before = effort({ A: { coverage: 'partial', sessions: [session('1')] } });
  const after = effort({ A: { coverage: 'partial', sessions: [session('1')] }, 'Salvation Army': { coverage: 'partial', sessions: [session('2')] } });
  const r = await pr([
    { status: 'M', path: 'data/research-effort.json' },
    { status: 'M', path: 'docs/research-drafts/README.md' },
    { status: 'A', path: 'docs/research-drafts/salvation-army-20261018/research.md' },
    { status: 'A', path: 'docs/research-drafts/salvation-army-20261018/research-session.json' },
  ], { base: { 'data/research-effort.json': before, 'docs/research-drafts/README.md': '# Drafts\n- a\n' }, head: { 'data/research-effort.json': after, 'docs/research-drafts/README.md': '# Drafts\n- a\n- salvation army\n' } });
  assert.deepEqual(r, { label: 'auto-eligible', eligible: true, violations: [], humanReasons: [], notes: [] });
});

test('research-effort.json edits that change existing data need a human', () => {
  const base = effort({ A: { coverage: 'partial', sessions: [session('1')] } });
  assert.equal(effortAdditive(base, effort({ A: { coverage: 'partial', sessions: [session('1'), session('2')] } })), null);
  assert.match(effortAdditive(base, effort({ A: { coverage: 'partial', sessions: [{ ...session('1'), endedAt: '2026-10-18T11:00:00Z' }] } })), /changes or removes session 1/);
  assert.match(effortAdditive(base, effort({})), /removes organization/);
  assert.match(effortAdditive(base, effort({ A: { coverage: 'complete', sessions: [session('1')] } })), /coverage/);
  assert.match(effortAdditive(base, JSON.stringify({ ...JSON.parse(base), timeBasis: 'x' })), /timeBasis/);
  assert.match(effortAdditive(base, effort({ A: { coverage: 'partial', sessions: [session('1')] }, B: { sessions: [session('1')] } })), /repeats session id/);
});

test('draft index edits must be append-only', () => {
  assert.ok(appendOnly('a\nb\n', 'a\nnew\nb\nmore\n'));
  assert.ok(!appendOnly('a\nb\n', 'a\nB\n'));
});

test('editing another contributor\'s recipe or draft fails; editing your own is allowed', async () => {
  const path = `${E}org.recipe.json`;
  const theirs = await pr([{ status: 'M', path }], { owners: { [path]: 'someone-else' } });
  assert.equal(theirs.violations.length, 1);
  assert.match(theirs.violations[0], /supersedes/);
  const mine = await pr([{ status: 'M', path }], { owners: { [path]: 'rhys-lindmark' } });
  assert.equal(mine.label, 'auto-eligible');
  const unknown = await pr([{ status: 'M', path }]);
  assert.equal(unknown.label, 'needs-human');
  const draft = await pr([{ status: 'M', path: 'docs/research-drafts/x/a.md' }], { owners: { 'docs/research-drafts/x/a.md': 'outsider' } });
  assert.equal(draft.violations.length, 1);
});

test('template and parameter edits and deletions always need a human', async () => {
  const t = 'docs/open-botec/templates/naloxone-distribution.v1.json';
  const p = 'docs/open-botec/parameters/us-il-chicago/naloxone-distribution.json';
  const owners = { [t]: 'Rhys-Lindmark', [p]: 'Rhys-Lindmark' };
  for (const f of [{ status: 'M', path: t }, { status: 'M', path: p }, { status: 'D', path: `${E}org.recipe.json` }]) {
    const r = await pr([f], { owners });
    assert.equal(r.label, 'needs-human', f.path);
  }
  assert.equal((await pr([{ status: 'A', path: 'docs/open-botec/templates/naloxone-distribution.v2.json' }])).label, 'auto-eligible');
});

test('a tier above draft needs an independent passing audit, and any promotion needs a human', async () => {
  const path = `${E}org.json`;
  const noAudit = await pr([{ status: 'A', path }], { head: { [path]: JSON.stringify(record({ status: { tier: 'agent-reviewed' } })) } });
  assert.match(noAudit.violations.join(), /above draft without an independent passing audit/);
  const selfAudit = await pr([{ status: 'A', path }], { head: { [path]: JSON.stringify(record({ status: { tier: 'agent-reviewed' }, audits: [{ independent: false, verdict: 'pass' }] })) } });
  assert.equal(selfAudit.violations.length, 1);
  const audited = await pr([{ status: 'A', path }], { head: { [path]: JSON.stringify(record({ status: { tier: 'agent-reviewed' }, audits: [{ independent: true, verdict: 'pass' }] })) } });
  assert.deepEqual(audited.violations, []);
  assert.equal(audited.label, 'needs-human');
});

test('large median moves and narrowed ranges without new sources need a human', async () => {
  const path = `${E}org.json`;
  const base = { [path]: JSON.stringify(record()) };
  const moved = await pr([{ status: 'M', path }], { base, head: { [path]: JSON.stringify(record({ price: { p50: 400 } })) } });
  assert.match(moved.humanReasons.join(), /median moved/);
  const narrowed = await pr([{ status: 'M', path }], { base, head: { [path]: JSON.stringify(record({ price: { p10: 3000, p90: 6000 } })) } });
  assert.match(narrowed.humanReasons.join(), /narrowed/);
  const sourced = await pr([{ status: 'M', path }], { base, head: { [path]: JSON.stringify(record({ price: { p50: 400 }, inputs: { x: { sources: [{ url: 'https://new.example' }] } } })) } });
  assert.equal(sourced.label, 'auto-eligible');
  assert.match(sourced.notes.join(), /new source/);
});

test('a superseding record is compared with the record it replaces; id reuse fails', async () => {
  const old = `${E}org.json`;
  const base = { [old]: JSON.stringify(record()) };
  const v2 = `${E}org-v2.json`;
  const sup = await pr([{ status: 'A', path: v2 }], { base, head: { [v2]: JSON.stringify({ ...record({ price: { p50: 40000 }, status: { supersedes: record().id } }), id: 'slug:org/p/a/us-il-chicago/2025/v2' }) } });
  assert.match(sup.humanReasons.join(), /median moved 10/);
  const clash = await pr([{ status: 'A', path: v2 }], { base, head: { [v2]: JSON.stringify(record()) } });
  assert.match(clash.violations.join(), /reuses id/);
});
