# HSC independent implementation acceptance

October1,2026. **Accept the current wrapper's equations and declared scenarios: no material calculation or causal-ledger discrepancy against the final proposal found. This is implementation acceptance only, not publication acceptance.** Read root-only `AGENTS.md` and `docs/research-effort.md`; no checkout edits, broad source hunt, nested agents, installs or servers. Space Saver/Token Saver workflows reused existing source/runtime.

Reviewed `lib/hearing-calibrated-model.mjs` and `scripts/hearing-calibrated.test.mjs` against `/private/tmp/hsc-calibration-20261001.md`, plus the crosswalk constants and frozen hearing engine. Independently ran the new test file with existing Node24.18.0: PASS. Root reports frozen3 tests pass; that result is inherited, not rerun here.

Verified:

- Central uses health.012 and explicit provisional net income0, donor1500/resource2100, price$1,250,000/$1,750,000. No positive economic central is invented.
- Completed household incidence is funding additionality×pre-fitting completion×nonoverlap. Health clinical transfer is absent from earnings. One household per fitted adult is the declared stress unit; baseline50000 is a reference, not a measured income distribution.
- Annual income exposure is independently supplied and end-year discounted: [.515]/1.03=.5. It is not automatically the health engine's effectiveYears. One-off loss is discounted at receipt.25year, without annual exposure multiplication or donor cash double charge.
- Earnings+.05 in.1 of funded completions gives income.0004879016416943202/price$1,201,162.57; −.05 gives−.0005129329438755054/$1,305,816.35. Acquisition6/50000 gives−.000023824730379897534/$1,252,486.68. Signs and logarithmic asymmetry agree with proposal.
- Nonoverlap scales the shared clinical component and income, while donor-specific health harm remains. Funding/completion/portfolio-null cases suppress recipient income; independent donor harm persists under funding0. Nonpositive total returns null price with cost retained.
- SF/Bay scalar shares are applied to each local health/income component and local price, with SF≤Bay validation. Conditional SF-resident geography1/1 is a judgment about the commissioned cohort, not all HSC's clients.
- Existing frozen clinical outputs are retained under zero income; the wrapper exposes historicalHealthOnly separately. The favorable four-year health case having only a one-year default income schedule is bounded income credit, not missing padded income years.

An additional independent arithmetic challenge varied nonoverlap=.25, Bay=.8,SF=.3,shared harm=.001,donor harm=.002. Expected health=.000875 and income=.00012197541042358005 agreed; funding0 canceled shared harm/income while retaining−.002 independent donor harm. This directly checks the funding/assignment/geography interactions beyond the root's main scenario prices.

**Integration remains outstanding.** Current page `app/charities/hearing-and-speech-center/page.tsx` and API `app/api/sf-hearing-model/route.ts` still call frozen `hearingAccessModel`; root also identifies the current ranking path as unwired. New wrapper/tests do not establish public recalibration. Before publication, wire page/API/ranking and label combined welfare years distinctly: the wrapper's compatibility `netQalys` field equals total health+income, while `healthYears` is clinical QALYs. Reports must retain the conditional marginal scope, geographic assumption, financial/recipient gaps, zero-income judgment and signed diagnostics. No published count/status should be changed based on this audit alone.

Dedicated helper provenance is returned separately; interval covers modeling audit after required instruction reads and is partial. GPT-6.1 Sol identity is recorded as explicitly provided by the root delegated assignment; reasoning level not supplied. Initial source/instruction read precedes the helper start and is not assigned fabricated time.
