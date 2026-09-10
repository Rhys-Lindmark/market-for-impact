# Research-time and AI-model provenance

Every organization report uses a concise research-time summary near its title and phase bullets when expanded. Measured intervals stay in the original registry. Cost-effectiveness model versions are separate from AI model identities and appear in the report footer.

Rhys requested average-based estimates for older reports on September10. The separate data/research-effort-historical-estimates.json freezes the80 published organization names,13 available organization totals, their17.689724-minute arithmetic mean, and the user-supplied historical GPT-5.6 Sol Medium assumption. Missing older records display approximately18min with a tilde and a short estimate note. This is not a recovered timestamp or measured total; do not manufacture sessions to fill gaps. Recorded partial totals use a compact plus sign rather than lengthy caveats. New organizations outside that frozen inventory require their own actual records and do not inherit this estimate. Future model names should include the verified reasoning level when available; do not infer it from another worker.

## Future research

1. Before focused work, run `node scripts/research-session.mjs start --organization "Exact report heading" --worker "stable worker/session ID" --phase research --evidence "auditable research artifact reference" --model-id "verified runtime ID" --model-name "verified display name" --model-evidence "runtime metadata reference"`. Omit all model flags only if identity cannot be verified; record null, never infer it from the current UI or another worker.
2. Persist the printed start record in the task's isolated artifact using apply_patch. Start separate records for author research, modeling and independent source audits. Use stable worker IDs across organizations.
3. Before switching organizations, pausing, waiting idle or doing integration/testing/deployment, finish with `node scripts/research-session.mjs finish --record /absolute/path/to/start-record.json`; persist the closed record. Restart a new interval when research resumes. Do not time several organizations under one record or apportion a batch duration.
4. The root owner validates and adds closed sessions to `data/research-effort.json`, keyed by the exact organization heading. Preserve IDs to prevent duplicate imports. Record `coverage: "partial"` unless all research contributing to that report is captured, including earlier versions.
5. Preserve actual timestamps and the AI model that did that interval. Model changes require a new interval. A display name without evidence is not provenance. Evidence references must be safe to publish; do not expose private session logs, credentials or unrelated conversations.

Time means summed dedicated researcher wall-clock intervals, including ordinary source/tool work, not measured CPU time or proof of continuous attention. Parallel researchers contribute separate researcher-minutes, which can exceed elapsed clock time. Display truncates to one decimal; underlying timestamps retain precision. This is not a quality score. Revisions add new intervals; they do not overwrite or double-count old work.

## Historical backfill

Accept only records that tie an organization to actual research start/end timestamps and a model identity. General project work logs, commit dates, file modification times, a request to spend an hour, and the user's example “20min with GPT-6 Astra” do not establish research duration. Keep partial history visibly partial. Unknown old work remains unknown even after a newly recorded revision.

## Release checklist

- Every report has the shared header disclosure.
- Each newly researched report includes the available closed sessions and evidence, with explicit unknown fields where recovery was impossible.
- Run the research-effort validator/tests; check no researcher interval overlaps itself across reports.
- Check the header on phone/tablet; do not change report count or cost-effectiveness findings for provenance-only changes.
