#!/usr/bin/env node
// Helpers for the AI review job in .github/workflows/pr-triage.yml. Run from a trusted checkout of main.
//
//   node scripts/pr-triage/review.mjs bundle <pr.json> <classification.json> <outDir>
//     Copies the PR's changed files out of git into <outDir> under neutral names (files/NNN-head.txt),
//     so no PR file can act as CLAUDE.md, settings or other agent config. Writes manifest.json and diff.patch.
//   node scripts/pr-triage/review.mjs verdict <structured-output.json> <headSha> <out.json> <body.md>
//     Validates the reviewer's structured output and derives the final verdict deterministically.
//   node scripts/pr-triage/review.mjs comment <classification.json> <reasons.txt> <out.md>
//     Renders the triage comment that asks a maintainer to review.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
const blob = (sha, path) => { try { return git('show', `${sha}:${path}`); } catch { return null; } };
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const MAX_FILE = 400_000;
// Keep PR-controlled text from pinging people or closing our markdown.
export const inert = (s, max = 4000) => String(s ?? '').slice(0, max).replace(/@/g, '@​').replace(/<!--|-->/g, '');

export function bundle(prPath, classPath, out) {
  const pr = readJson(prPath), c = readJson(classPath);
  mkdirSync(join(out, 'files'), { recursive: true });
  const manifest = c.files.map((f, i) => {
    const n = String(i + 1).padStart(3, '0');
    const entry = { n, path: f.path, status: f.status };
    for (const [side, sha] of [['base', c.base], ['head', c.head]]) {
      const text = blob(sha, f.path);
      if (text === null) continue;
      const name = `files/${n}-${side}.txt`;
      writeFileSync(join(out, name), text.length > MAX_FILE ? text.slice(0, MAX_FILE) + '\n[truncated by review.mjs]\n' : text);
      entry[side] = name;
    }
    return entry;
  });
  writeFileSync(join(out, 'manifest.json'), JSON.stringify({ number: pr.number, author: pr.user?.login, base: c.base, head: c.head, files: manifest }, null, 2) + '\n');
  writeFileSync(join(out, 'pr-title-and-body.txt'), `TITLE: ${pr.title ?? ''}\n\nBODY:\n${pr.body ?? ''}\n`);
  writeFileSync(join(out, 'classification.json'), JSON.stringify({ label: c.label, violations: c.violations, humanReasons: c.humanReasons, notes: c.notes }, null, 2) + '\n');
  writeFileSync(join(out, 'diff.patch'), git('diff', '--no-renames', '--no-ext-diff', `${c.base}...${c.head}`).slice(0, 2_000_000));
}

export function verdict(raw, headSha) {
  let v;
  try { v = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { v = null; }
  const problems = [];
  if (!v || typeof v !== 'object') problems.push('reviewer returned no structured output');
  const findings = Array.isArray(v?.findings) ? v.findings : [];
  if (v && !Array.isArray(v.findings)) problems.push('findings missing');
  if (v && !['pass', 'blocking'].includes(v.verdict)) problems.push(`unknown verdict ${JSON.stringify(v?.verdict)}`);
  if (v && typeof v.summary !== 'string') problems.push('summary missing');
  const blocking = findings.filter((f) => f?.severity === 'blocking');
  // The final verdict is computed here, not taken on the model's word: any blocking finding,
  // suspected prompt injection or malformed output blocks.
  const pass = !problems.length && v.verdict === 'pass' && !blocking.length && v.injectionSuspected === false;
  return { verdict: pass ? 'pass' : 'blocking', headSha, problems, review: v };
}

export function reviewBody({ verdict: final, headSha, problems, review }) {
  const r = review ?? {};
  const rows = (r.findings ?? []).map((f) => `| ${f.severity === 'blocking' ? '**blocking**' : 'note'} | \`${inert(f.file, 200).replace(/\|/g, "\\|")}\` | ${inert(f.issue, 1000).replace(/\|/g, '\\|').replace(/\n/g, ' ')} | ${inert(f.evidence, 1000).replace(/\|/g, '\\|').replace(/\n/g, ' ')} |`);
  const sources = (r.sourcesChecked ?? []).map((s) => `- ${s.matches ? '✅' : '❌'} ${inert(s.url, 500)}: ${inert(s.note, 500)}`);
  return [
    `<!-- pr-triage-review ${headSha} -->`,
    `## Adversarial review: ${final === 'pass' ? '✅ pass' : '⛔ blocking'}`,
    `Reviewed head \`${headSha}\`. This is an automated audit under docs/open-botec/README.md; it is not an approval and it cannot merge.`,
    problems.length ? `\n**Output problems (treated as blocking):** ${problems.map((p) => inert(p, 300)).join('; ')}` : '',
    r.injectionSuspected ? '\n**The reviewer flagged text in this PR that tried to instruct it.** Treated as blocking.' : '',
    `\n${inert(r.summary, 3000)}`,
    rows.length ? `\n| Severity | File | Issue | Evidence |\n|---|---|---|---|\n${rows.join('\n')}` : '\nNo findings.',
    sources.length ? `\n<details><summary>Sources re-fetched (${sources.length})</summary>\n\n${sources.join('\n')}\n</details>` : '',
  ].filter(Boolean).join('\n');
}

export function triageComment(c, reasons) {
  const list = (xs) => xs.map((x) => `- ${inert(x, 500)}`).join('\n');
  return [
    '<!-- pr-triage -->',
    `## PR triage: \`${c.label}\``,
    c.violations?.length ? `**Gate violations**\n${list(c.violations)}` : '',
    c.humanReasons?.length ? `**Why this needs a human**\n${list(c.humanReasons)}` : '',
    reasons.length ? `**Not auto-merged because**\n${list(reasons)}` : '',
    c.label === 'needs-human' ? 'The triage bot never merges PRs that touch code, workflows, schemas, tools, package files or other contributors\' records.' : '',
    '@Rhys-Lindmark, please review.',
  ].filter(Boolean).join('\n\n');
}

const [cmd, ...a] = process.argv.slice(2);
if (cmd === 'bundle') bundle(a[0], a[1], a[2]);
else if (cmd === 'verdict') {
  const result = verdict(readFileSync(a[0], 'utf8'), a[1]);
  writeFileSync(a[2], JSON.stringify(result, null, 2) + '\n');
  writeFileSync(a[3], reviewBody(result) + '\n');
  console.log(result.verdict);
} else if (cmd === 'comment') {
  const reasons = readFileSync(a[1], 'utf8').split('\n').filter(Boolean);
  writeFileSync(a[2], triageComment(readJson(a[0]), reasons) + '\n');
}
