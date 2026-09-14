import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

// Install in scripts/; run from the repository root. The explicit packet mode
// verifies pending integration without pretending it is the published registry.
const root = process.env.GIVEBETTER_REPO_ROOT || process.cwd();
const {reportPrice, expenseAverage} = await import(pathToFileURL(resolve(root, 'lib/geography-reports.mjs')));
const rows = JSON.parse(readFileSync(resolve(root, 'data/geography-reports.json'))).reports;
const get = (edition, slug) => {
  const matches = rows.filter(r => r.edition === edition && r.slug === slug);
  assert.equal(matches.length, 1, `${edition}/${slug}: unique registry entry required`);
  return matches[0];
};
const close = (actual, expected, label = '') => {
  assert.ok(Number.isFinite(actual) && Number.isFinite(expected), label);
  assert.ok(Math.abs(actual - expected) <= 1e-10 * Math.max(1, Math.abs(expected)), `${label}: ${actual} != ${expected}`);
};
const input = (r, name) => {
  const x = r.model.inputs.find(x => x.name === name);
  assert.ok(x, `${r.slug}: missing ${name}`);
  return x;
};
const series = (n, start = 1, rate = .03) => Array.from({length:n}, (_,i) => (1 + rate) ** -(start + i)).reduce((a,b) => a+b, 0);
function parameters(s) {
  if (s.assumptions.startsWith('{')) return JSON.parse(s.assumptions.slice(0, s.assumptions.indexOf('}') + 1));
  // Read only primitive scenario inputs. Never use supplied Y/B/Q/shift outputs.
  return Object.fromEntries([...s.assumptions.matchAll(/\b([A-Za-z]+)=(-?\d+(?:\.\d+)?)/g)].map(m => [m[1], Number(m[2])]));
}
function checkScenarios(r, calculate, expectedCost) {
  let zero = false, adverse = false;
  for (const s of r.model.scenarios) {
    const p = parameters(s);
    const q = calculate(p);
    close(s.costUSD, expectedCost(p,s), `${r.slug}/${s.id} cost`);
    close(s.allPopulationQalys, q, `${r.slug}/${s.id} all-population`);
    close(s.editionQalys, q*p.g, `${r.slug}/${s.id} resident health`);
    const centralClone = {...r, model:{...r.model, scenarios:[{...s,id:'central'}]}};
    if (q > 0) close(reportPrice(centralClone), 10*s.costUSD/(q*p.g));
    else assert.equal(reportPrice(centralClone), null);
    zero ||= q === 0; adverse ||= q < 0;
  }
  assert.ok(zero && adverse, `${r.slug} must retain zero and downside`);
}

test('Shatterproof: navigation conversion, retention, resources and downside', () => {
  const r = get('usa', 'shatterproof');
  close(input(r,'f').value, 1961/29613);
  checkScenarios(r, p => p.b*(p.U*p.f*p.o*p.e*p.t*(p.d*p.q+p.w)-p.h), p => p.C);
  close(input(r,'C').value, 52809073);
  close(r.model.scenarios.find(s=>s.id==='cash-like').costUSD, 52809073-31286172);
  assert.match(r.model.costScope, /donat|in-kind/i);
  assert.equal(input(r,'e').basis, 'judgment');
});

test('FRAC: finite child-years, historical transport, recipient-only budget', () => {
  const r = get('usa', 'food-research-and-action-center');
  checkScenarios(r, p => p.N*p.z*p.T*p.p*p.a*p.b*(p.life/p.exposure)*p.utility*p.transport/(1+p.discount)**p.lag-p.b*p.h, (_,s) => s.id==='three-year-cost-mean' ? 2*(9720220+14821886+21482914+14674)/3 : 2*(21482914+14674));
  assert.equal(input(r,'C').basis, 'judgment');
  assert.match(r.model.costScope, /exclud.*Action Council/i);
  assert.equal(input(r,'WIC marginal enrollment').value, null);
  assert.match(input(r,'exposure').rationale, /linear.*assumption/i);
  assert.match(input(r,'lag').rationale, /lumped approximation/i);
  assert.equal(r.donationUrl, 'https://frac.org/ways-to-donate');
  assert.ok(r.sources.some(s=>s.url==='https://secure.everyaction.com/KsIAFphfDEeLdwPGWes50Q2'));
});

test('CEH: worker-year frontiers are requirements, not a portfolio prediction', () => {
  const r = get('usa', 'center-for-environmental-health');
  assert.equal(reportPrice(r), null);
  assert.equal(r.model.scenarios.find(s=>s.id==='central').editionQalys, null);
  for (const [id,price,k] of [['frontier-one-million',1e6,.00040451],['frontier-one-hundred-thousand',1e5,.0040451]]) {
    const s = r.model.scenarios.find(s=>s.id===id);
    close(s.costUSD,4045100);
    close(s.editionQalys,100000*k);
    close(s.allPopulationQalys,100000*k);
    close(10*s.costUSD/s.editionQalys,price);
  }
  assert.equal(input(r,'E_USA').value,null);
  assert.equal(input(r,'k').value,null);
  assert.equal(r.model.scenarios.find(s=>s.id==='zero').editionQalys,0);
  close(r.model.scenarios.find(s=>s.id==='adverse').editionQalys,0-10);
});

test('TFF: separate TCE and structurally delayed PFAS streams, harm once', () => {
  const r = get('usa','toxic-free-future');
  close(input(r,'F').value,64.1/15.4);
  close(input(r,'PFASDeaths').value,1300+3700+2000);
  checkScenarios(r, p => (64.1/15.4)*p.m*series(p.T)*p.e*p.a*p.b*p.q + (1300*p.qi+(3700+2000)*p.qa)*p.d*p.mp*(1-1/1.03**2)*p.u*p.pp*p.ap*p.b-p.H, () => 2*2689041);
  assert.equal(input(r,'C').basis,'judgment');
  assert.match(r.summary.reservations[0],/two narrow branches/i);
  assert.match(r.model.uncertainty,/structural approximation/i);
  assert.match(input(r,'u').rationale,/exemption uptake/i);
  assert.match(input(r,'u').rationale,/mitigation/i);
});

test('Farmworker Justice: 52 over twelve years, not annual deaths or all agriculture', () => {
  const r = get('usa','farmworker-justice');
  checkScenarios(r, p => (52/12)*p.f*p.u*p.k*p.e*p.q*series(p.T)*p.p*p.a*p.b-p.H, () => 2*(2202077+53661));
  assert.match(r.sections.qualitative,/individually imprecise/i);
  assert.match(input(r,'g').rationale,/Immigration status alone does not/i);
  assert.equal(input(r,'otherPathways').value,null);
});

test('Earthjustice: alternative mortality estimates, future implementation only', () => {
  const r = get('usa','earthjustice');
  close(input(r,'D').value,(2100+4500)/2);
  checkScenarios(r, p => p.D*p.m*p.q*series(p.L,p.start)*p.p*p.a*p.b-p.H, () => 2*183685874);
  assert.equal(input(r,'C').basis,'judgment');
  assert.match(r.model.counterfactual,/baseline/i);
  assert.match(r.model.costScope,/donated services/i);
  assert.equal(input(r,'otherPathways').value,null);
  assert.match(r.model.geographicAttribution,/not an organization-wide/i);
});

test('All six preserve comparable full-recipient three-year expense means', () => {
  const seriesBySlug = {
    'shatterproof':[16796216,25439567,52809073],
    'food-research-and-action-center':[9720220,14821886,21482914+14674],
    'center-for-environmental-health':[5438516,5130659,4045100],
    'toxic-free-future':[2298941,2790134,2689041],
    'farmworker-justice':[2349230,2205323+31296,2202077+53661],
    'earthjustice':[158385625,165760409,183685874],
  };
  for (const [slug,amounts] of Object.entries(seriesBySlug)) {
    const r = get('usa',slug);
    assert.deepEqual([...r.annualExpenses].sort((a,b)=>a.year-b.year).map(x=>x.amount),amounts);
    close(expenseAverage(r),amounts.reduce((a,b)=>a+b,0)/3,slug);
  }
});

