# Season of Sharing independent audit

## Decision

ACCEPT for transparent exploratory publication; requested evidence and validation corrections are complete. Final independent rerun: 19/19 tests PASS, including unchanged exact saved output. HOLD a giving recommendation. Do not present the $7.541M price as a complete whole-organization health valuation: it charges the whole cash expense while quantifying only housing-related health. A ranking may include it only with that component boundary visible; it does not establish that total health impact is worse than another organization, because food health is omitted. Omission is neither proof of zero benefit nor a formal upper bound once omitted harms/resources are considered.

## Verified boundaries

- Primary FY2025 audited accounts reconcile $15,130,343 expense to $14,799,462 excluding $330,881 donated advertising. Sponsor-paid administration/fundraising remain charged; the resource-inclusive sensitivity is appropriate, while unpriced partner casework remains incomplete. Family/housing grants sum to $11,179,746; $32,059 provider grants are excluded from grant-equivalent throughput, not whole costs. Food allocation $2,162,002 stays in costs. These are fiscal-year amounts, not an incremental funding quote.
- Nine-county delivery supports Bay scope; 97–100% benefit-location scenarios are judgments, not measured migration. Reserves and public/partner overlap are disclosed without inventing a current gap. The official giving page resolves publicly.
- Trial Table 2 supports the .038 absolute risk anchor, not a relative percentage or QALY. Author corrected report/source ledger to identify the pre-pandemic cohort and expose measured homeless-days versus assumed duration. The health utility and effective household multiplier remain unvalidated, and no mortality/lifetime benefit is credited.
- Six worlds retain independent funding/health nulls and signed harm; expectation is calculated before the cost ratio. Favorable share is 96.2808%, making the average highly fragile. No modeled world passes $1M/10 Bay QALYs; this is scenario mass, not an empirical probability statement about total health.

## Exact verification

`node --test /private/tmp/mfi-sos-model-v1.test.mjs`: initial 18/18 PASS, including full deep equality with saved results. Independently checked NaN/Infinity/negative infinity/zero gifts reject. Default weighted Bay QALYs = 0.013260718850430987 per $10,000; Bay cost/10 = 7541069.313655639; all-beneficiary cost/10 = 7538779.290221152. Derived overflow, duplicate IDs, malformed worlds and missing/nonfinite coefficients are guarded.

Material validation issue fixed by author and independently retested: top-level primitive/array options were silently coerced to defaults. The model now requires a non-null, non-array object (undefined default allowed), with regression tests and unchanged default snapshot. No coefficients changed.

Renderer JSON has nonempty required arrays and evidence entries with `key/design/population/result/transfer`; explicit new `housing_trial_duration` row was inspected. No Site checkout was edited; the existing renderer source was not located in this local checkout during this pass, so this is canonical-schema validation, not an integration/build claim. Remove draft/audit-pending wording only after root accepts final packet.

## Primary sources inspected

- [FY2025 audited accounts](https://seasonofsharing.org/wp-content/uploads/2025/12/Chronicle-Season-of-Sharing-Fund-AUD-6-30-25-FS.pdf), statements and notes.
- [Phillips–Sullivan trial manuscript](https://sites.nd.edu/james-sullivan/files/2023/04/SCC_homelessness_prevention-8-1.pdf), Tables 2/A6 and study scope. The model's untransferred risk×duration implies 6.94 days per offer versus 2.5 recorded days within six months; this does not establish a matching health-duration bridge. The author now states the mismatch without retuning.
- [Official giving route](https://seasonofsharing.org/ways-to-give/).

The NBER source remains abstract-only in the author packet; I do not certify a full-text reading. It is not used to supply a numeric utility estimate.

## Timing and footprint

Observed audit interval 2026-09-11 07:29:22–07:31:46 UTC (2m24s wall time). Parent-confirmed gpt-6-astra/low dispatch, not runtime introspection. Active effort unmetered. Space Saver and Token Saver read; filesystem had 66GiB available. Reused existing Node/artifacts, no dependencies, media, Site changes, outreach, or nested workers.
