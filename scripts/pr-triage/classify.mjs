#!/usr/bin/env node
// Deterministic PR classifier for the triage pipeline (docs/open-botec/README.md, "Pull request pipeline").
//
//   node scripts/pr-triage/classify.mjs --base <sha> --head <sha> --author <login> --repo <owner/name> [--out file.json]
//
// Reads the PR only as data (git blobs and the GitHub API); it never runs PR code.
// Result: label "auto-eligible" or "needs-human", plus violations. Violations exit 1 and fail the gate.
import { execFileSync } from 'node:child_process';
import { writeFileSync, appendFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';

const OB = 'docs/open-botec/';
const DRAFTS = 'docs/research-drafts/';
const EFFORT = 'data/research-effort.json';
const DRAFT_EXT = /\.(md|json|csv|txt)$/;
// Files an agent session may load as instructions or config if they reach a checkout.
const AGENT_CONFIG = /(^|\/)(CLAUDE\.md|AGENTS\.md|agents\.md|\.mcp\.json|\.claude|\.codex|\.cursor|\.github)(\/|$)/i;
const TIERS = ['draft', 'agent-reviewed', 'human-reviewed'];

export function areaOf(path) {
  if (AGENT_CONFIG.test(path) || path.split('/').some((s) => s.startsWith('.'))) return null;
  if (path === `${OB}registry.json`) return 'registry';
  if (/^docs\/open-botec\/estimates\/[a-z0-9-]+\/[a-z0-9-]+\.recipe\.json$/.test(path)) return 'recipe';
  if (/^docs\/open-botec\/estimates\/[a-z0-9-]+\/[a-z0-9-]+\.json$/.test(path)) return 'record';
  if (/^docs\/open-botec\/parameters\/[a-z0-9-]+\/[a-z0-9-]+\.json$/.test(path)) return 'parameters';
  if (/^docs\/open-botec\/templates\/[a-z0-9.-]+\.json$/.test(path)) return 'template';
  if (path.startsWith(DRAFTS) && DRAFT_EXT.test(path)) return path.slice(DRAFTS.length).includes('/') ? 'draft-dir' : 'draft-index';
  if (path === EFFORT) return 'effort';
  return null;
}

const parse = (text) => { try { return JSON.parse(text); } catch { return undefined; } };
const lines = (text) => text.split('\n');
// True when every line of `before` survives, in order, in `after`.
export function appendOnly(before, after) {
  const b = lines(before), a = lines(after);
  let i = 0;
  for (const line of a) if (i < b.length && line === b[i]) i++;
  return i === b.length;
}

// data/research-effort.json may only gain organizations or sessions; nothing existing may change.
export function effortAdditive(before, after) {
  const b = parse(before), a = parse(after);
  if (!b || !a) return 'is not valid JSON';
  for (const k of new Set([...Object.keys(b), ...Object.keys(a)])) if (k !== 'organizations' && !isDeepStrictEqual(a[k], b[k])) return `changes top-level "${k}"`;
  const seen = new Set();
  for (const org of Object.values(a.organizations ?? {})) for (const s of org.sessions ?? []) {
    if (seen.has(s.id)) return `repeats session id ${s.id}`;
    seen.add(s.id);
  }
  for (const [name, org] of Object.entries(b.organizations ?? {})) {
    const next = a.organizations?.[name];
    if (!next) return `removes organization "${name}"`;
    for (const k of new Set([...Object.keys(org), ...Object.keys(next)])) if (k !== 'sessions' && !isDeepStrictEqual(org[k], next[k])) return `changes "${name}".${k}`;
    for (const s of org.sessions ?? []) if (!next.sessions?.some((n) => isDeepStrictEqual(n, s))) return `changes or removes session ${s.id} of "${name}"`;
  }
  return null;
}

const median = (r) => r?.qalyLayer?.pricePer10Qalys?.p50 ?? r?.nativeOutcome?.costPerOutcome?.p50;
const spread = (r) => { const d = r?.qalyLayer?.pricePer10Qalys ?? r?.nativeOutcome?.costPerOutcome; return d?.p10 > 0 ? d.p90 / d.p10 : undefined; };
const sourceUrls = (r) => new Set(Object.values(r?.inputs ?? {}).flatMap((i) => (i.sources ?? []).map((s) => s.url)).filter(Boolean));
const passingAudit = (r) => r?.provenance?.audits?.some((a) => a.independent === true && String(a.verdict).startsWith('pass'));

/**
 * @param {object} pr
 * @param {{path:string,status:string,from?:string}[]} pr.files  status is git's A/M/D/R/C/T letter
 * @param {string} pr.author  GitHub login of the PR author
 * @param {(path:string)=>string|null} pr.readBase  file text at the merge base, or null
 * @param {(path:string)=>string|null} pr.readHead  file text at the PR head, or null
 * @param {(prefix:string)=>string[]} pr.listBase  paths under prefix at the merge base
 * @param {(path:string)=>Promise<string|null>} pr.originalAuthor  login that added the file on main, or null if unknown
 */
export async function classify({ files, author, readBase, readHead, listBase, originalAuthor }) {
  const violations = [], human = [], notes = [];
  const owner = async (path) => {
    const who = await originalAuthor(path);
    if (!who) { human.push(`${path}: could not determine who added it, so edits cannot be checked against its owner`); return null; }
    return who;
  };
  const notOwner = async (path, what) => {
    const who = await owner(path);
    if (who && who.toLowerCase() !== author.toLowerCase()) {
      violations.push(`${path}: edits ${what} added by @${who}. Do not edit other contributors' records; add a new record with a new modelVersion and status.supersedes.`);
      return true;
    }
    return !who;
  };
  if (!files.length) human.push('PR changes no files');

  for (const f of files) {
    const area = areaOf(f.path);
    const fromArea = f.from ? areaOf(f.from) : area;
    if (!area || !fromArea) { human.push(`${f.path}: outside the auto-eligible paths`); continue; }
    if (f.status === 'D' || f.status === 'R' || f.status === 'C') {
      human.push(`${f.from ?? f.path}: ${f.status === 'D' ? 'deleted' : 'renamed or copied'}`);
      if (['recipe', 'template', 'parameters', 'draft-dir'].includes(fromArea) && f.status !== 'C') await notOwner(f.from ?? f.path, 'a file');
      continue;
    }
    if (f.status !== 'A' && f.status !== 'M') { human.push(`${f.path}: unsupported change type ${f.status}`); continue; }
    if (f.status === 'M') {
      if (area === 'recipe' || area === 'template') await notOwner(f.path, area === 'recipe' ? 'an estimate recipe' : 'a template');
      if (area === 'parameters' && !(await notOwner(f.path, 'a parameter file'))) human.push(`${f.path}: edits shared parameters, which move every record that uses them`);
      if (area === 'template') human.push(`${f.path}: edits a template in place; publish a new template version instead`);
      if (area === 'draft-dir') await notOwner(f.path, 'a research draft');
      if (area === 'draft-index' && !appendOnly(readBase(f.path) ?? '', readHead(f.path) ?? '')) human.push(`${f.path}: removes or rewrites existing lines`);
      if (area === 'effort') { const why = effortAdditive(readBase(f.path) ?? '', readHead(f.path) ?? ''); if (why) human.push(`${f.path}: not additive-only (${why})`); }
    }
    if (area === 'record') checkRecord(f, { readBase, readHead, listBase, violations, human, notes });
  }
  const label = violations.length || human.length ? 'needs-human' : 'auto-eligible';
  return { label, eligible: label === 'auto-eligible', violations, humanReasons: human, notes };
}

function checkRecord(f, { readBase, readHead, listBase, violations, human, notes }) {
  const rec = parse(readHead(f.path) ?? '');
  if (!rec) { violations.push(`${f.path}: not valid JSON`); return; }
  const prev = f.status === 'M' ? parse(readBase(f.path) ?? '') : undefined;
  const tier = rec.status?.tier;
  if (!['draft', 'retracted'].includes(tier)) {
    if (!passingAudit(rec)) violations.push(`${f.path}: tier "${tier}" is above draft without an independent passing audit`);
    if (!prev || prev.status?.tier !== tier || !isDeepStrictEqual(prev.provenance?.audits, rec.provenance?.audits)) human.push(`${f.path}: sets tier "${tier}" or changes audits; a maintainer must confirm the audit is independent`);
  } else if (prev && TIERS.indexOf(prev.status?.tier) > 0 && tier === 'retracted') human.push(`${f.path}: retracts a reviewed record`);

  // Compare with the earlier version of the same record, or the record it supersedes.
  let base = prev;
  if (!base && rec.status?.supersedes) {
    const hit = listBase(`${OB}estimates/`).filter((p) => p.endsWith('.json') && !p.endsWith('.recipe.json')).map((p) => parse(readBase(p) ?? '')).find((r) => r?.id === rec.status.supersedes);
    if (!hit) human.push(`${f.path}: supersedes unknown record ${rec.status.supersedes}`);
    base = hit;
  }
  if (f.status === 'A') {
    const clash = listBase(`${OB}estimates/`).filter((p) => p.endsWith('.json') && !p.endsWith('.recipe.json')).find((p) => parse(readBase(p) ?? '')?.id === rec.id);
    if (clash) violations.push(`${f.path}: reuses id ${rec.id} of ${clash}; bump key.modelVersion and set status.supersedes`);
  }
  if (!base) return;
  const newSources = [...sourceUrls(rec)].filter((u) => !sourceUrls(base).has(u));
  const [m0, m1, s0, s1] = [median(base), median(rec), spread(base), spread(rec)];
  if (m0 > 0 && m1 > 0 && Math.max(m1 / m0, m0 / m1) > 3 && !newSources.length) human.push(`${f.path}: simulated median moved ${(m1 / m0).toFixed(2)}x with no new source`);
  if (s0 && s1 && s1 < s0 * 0.9 && !newSources.length) human.push(`${f.path}: p10–p90 range narrowed (p90/p10 ${s0.toFixed(1)} → ${s1.toFixed(1)}) with no new source`);
  if (newSources.length) notes.push(`${f.path}: ${newSources.length} new source URL(s) for the reviewer to re-fetch`);
}

// ---- CLI: read the PR through git and the GitHub API ----
function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 2) out[argv[i].replace(/^--/, '')] = argv[i + 1];
  return out;
}
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
const blob = (sha, path) => { try { return git('show', `${sha}:${path}`); } catch { return null; } };

export function changedFiles(base, head) {
  const raw = git('diff', '--name-status', '-z', '--no-renames', `${base}...${head}`).split('\0').filter(Boolean);
  const files = [];
  for (let i = 0; i < raw.length;) {
    const status = raw[i++][0];
    if (status === 'R' || status === 'C') files.push({ status, from: raw[i++], path: raw[i++] });
    else files.push({ status, path: raw[i++] });
  }
  return files;
}

function summary(result, author) {
  const list = (xs) => xs.map((x) => `- ${x}`).join('\n') || '- none';
  return `### PR triage: \`${result.label}\` (author @${author})\n\n**Violations (fail the gate)**\n${list(result.violations)}\n\n**Needs a human because**\n${list(result.humanReasons)}\n\n**Notes**\n${list(result.notes)}\n`;
}

async function main() {
  const a = args(process.argv.slice(2));
  for (const k of ['base', 'head', 'author', 'repo']) if (!a[k]) throw new Error(`missing --${k}`);
  const mergeBase = git('merge-base', a.base, a.head).trim();
  const files = changedFiles(mergeBase, a.head);
  const result = await classify({
    files,
    author: a.author,
    readBase: (p) => blob(mergeBase, p),
    readHead: (p) => blob(a.head, p),
    listBase: (prefix) => git('ls-tree', '-r', '--name-only', mergeBase, '--', prefix).split('\n').filter(Boolean),
    originalAuthor: async (p) => {
      try {
        const logins = execFileSync('gh', ['api', '--paginate', `repos/${a.repo}/commits?path=${encodeURIComponent(p)}&sha=${mergeBase}&per_page=100`, '--jq', '.[].author.login // ""'], { encoding: 'utf8' }).trim().split('\n');
        return logins.at(-1) || null;
      } catch { return null; }
    },
  });
  const out = { ...result, author: a.author, base: mergeBase, head: a.head, files };
  if (a.out) writeFileSync(a.out, JSON.stringify(out, null, 2) + '\n');
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary(result, a.author));
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `label=${result.label}\neligible=${result.eligible}\nviolations=${result.violations.length}\n`);
  console.log(summary(result, a.author));
  process.exitCode = result.violations.length ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch((e) => { console.error(e); process.exitCode = 2; });
