# GiveBetter report design — September 8

Scope: user requests 1–3. Keep research/model estimates unchanged. User explicitly authorized resuming the 115-organization research goal after this release is verified.

- [x] Remove the requested homepage paragraph and inherit the GiveBetter font for x SF.
- [x] Apply one reading-first template to all 45 indexed reports (43 direct, two through ClinicalPathwayReport). Also covers the three nonindexed regional food-bank reports sharing the renderer.
- [x] Summary, numbered program/evidence/qualitative/cost/funding/source sections and working contents links; replace dashboard grids with paragraphs/lists, expandable inspectable assumptions. No random tables.
- [x] Use existing font stacks: Adelle/Georgia body, Avenir/Arial headings. Licensed webfont assets are still not supplied; do not redistribute third-party font kits.
- [x] Donate buttons: retain existing destinations and wire 11 additional repository-sourced general giving routes. Unresolved recipients lead to an explicit local funding explanation, not an invented payment URL. General giving is not a verified restricted funding offer.
- [x] Research table: whole-number compact prices, Organization, $ per better life. Sort continues to use unrounded model values.
- [x] Local 45-route phone check: all sections, donation affordance, expandable inputs, 16px body, no horizontal overflow. Homepage font and research price tests pass.
- [x] 287 unit tests pass. Lint passes with two existing urban-policy warnings. Build passes. Full phone suite initially: 71/84 pass; nine changed-copy/selector assertions subsequently updated and pass. Four unrelated archive/D1-dependent checks cannot load their local database-backed content in this fresh worktree; no corresponding route code changed. All 45 report routes pass the dedicated layout sweep.
- [ ] PR merge, exact-source public deployment, canonical verification.

Reference: https://www.givewell.org/charities/malaria-consortium — page structure and reading hierarchy, not its program claims or donation funnel. Our heading 5 describes funding/previous grants without implying GiveBetter made grants.

No data files or ranking calculations changed. This is not an increment to the research count. After release, return to preserved SPUR/whole-organization work and the research workers, per Rhys's explicit resumption instruction.
