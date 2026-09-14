# GiveBetter geographic expansion

Authorized September 13, 2026. This is new work, superseding the old SF-only stop rule.

## Outcome and scope

Preserve GiveBetter x SF at https://ai.rhyslindmark.com/givebetter/san-francisco, with its complete local research at /san-francisco/all. The homepage redirects to /givebetter/all, the city/region directory. Build eleven additional editions: California, USA and nine other US cities. Every edition gets 100 evidence-informed discovery candidates, 25 published alpha organization reviews, ten accepted beta revisions and a donor-ready top-four landing page. Use /<location> for each shortlist and /<location>/all for its full research list, with shared SF styling. Keep average annual expenses in lists but put fiscal-year evidence in report appendices. There are 275 target edition reviews and 110 beta revisions, not necessarily 275 unique nonprofits. Existing SF work remains complete: 112 published reports, ten deeper reviews and 81/91 Bay expense averages.

The user confirmed nine metro editions: New York City, Los Angeles, Chicago, Houston, Denver, Seattle, Boston, Atlanta and Detroit. Denver replaces Philadelphia. Lock official MSA definitions and exact county/FIPS boundaries before accepting city discovery candidates; do not mix city-proper, MSA and CSA geography. California covers the state; USA uses 50 states plus DC, with any territorial effects reported separately. Advance California and USA while the city boundary register is prepared.

Tracking source: docs/geography-progress.json. Human dashboard: docs/geography-progress.html. Candidate packets: docs/geography-discovery/. [Expansion issue #333](https://github.com/Rhys-Lindmark/market-for-impact/issues/333). Boundary register: docs/geography-boundaries.json, extracted from Census July2023/OMB23-01 official MSA definitions. Method audit: docs/geography-method-audit.md.

## Models and research budgets

| Stage | Required worker model | Output |
| --- | --- | --- |
| Discovery and comparative selection | GPT-6 Astra Medium; gpt-6-astra / medium | 100 sourced candidates; reasoned top25 selection |
| Alpha | GPT-6 Astra Light; gpt-6-astra / low | About 15 actual researcher-minutes per organization |
| Beta | GPT-6 Astra Medium; gpt-6-astra / medium | About 30 additional actual researcher-minutes per selected organization |
| Integration and publication | Root Site owner | Shared batches, proportionate verification and explicit time accounting |

These are budgets, not timers to fill. No sleeping, fabricated research durations, or splitting a batch's time across organizations. Follow AGENTS.md and docs/research-effort.md; capture verified model/effort and dedicated per-organization intervals separately from general discovery, integration and audits. Existing low-effort workers cannot be relabeled Medium: create stage-appropriate workers. Preserve unknown historical time.

## Execution order and ownership

September 13 checkpoint: California and USA each have 10 accepted alpha reports prepared for the access-batch release (eight each currently live until deployment). Los Angeles has 100 accepted discovery candidates and 25 selected priorities; its alpha and beta counts remain zero. NYC and Denver comparative packets await independent acceptance. Root is integrating while three workers continue bounded research; actual per-organization intervals remain separate from integration time.

Root is manager and sole Site owner. Three workers run independent useful research in parallel with stage-appropriate settings; no nested agents. Refill completed slots promptly when ready work remains. Workers browse/analyze and return isolated artifacts only: no Site edits, builds, servers, installs, deployment, outreach or credentials. Reuse shared evidence, entity identity and financial history across editions.

1. Foundation and California/USA discovery in parallel.
2. Complete and challenge their 100-candidate pools, then select 25 each. A source-screened seed is not an alpha report.
3. Research alpha packets in small parallel batches; root integrates batches rather than deploying each report.
4. Begin confirmed city discovery as slots open, while advancing CA/USA beta and publishing. Finish complete editions without starving the remaining ones.
5. For each completed 25, freeze the top ten beta priorities using cost-effectiveness, evidence quality, donor readiness and mechanism diversity. Explain exclusions and any policy/systemic inclusion; do not force weak quota picks.
6. Complete beta, re-rank, then choose four genuinely donor-ready recommendations. A weak result may remain research-only and a documented replacement may enter beta; no forced endorsement.
7. Final cross-edition audit and handoff. Further cohorts require user direction.

Stall interval: 20 active minutes without an accepted artifact/evidence milestone. Diagnose the bottleneck, narrow the task or switch to independent ready work. Do not repeatedly poll unchanged failed sources. Never restart completed cohorts.

## Acceptance checklist

- [x] G0a: User confirms nine cities and metro-area scope; Denver replaces Philadelphia.
- [x] G0b: Record authoritative MSA boundary versions and county/FIPS memberships before city discovery acceptance (nine metros, 102 county memberships; Census July2023/OMB23-01).
- [x] G1: Persist finite plan, model split, edition counters and phase acceptance.
- [x] G2: Update existing hourly heartbeat, preserving cadence and explicit pause control.
- [x] G3a: Eleven additive edition overview/research-progress routes, edition hub, scoped progress API and responsive checks. No premature reports or recommendations; existing SF preserved.
- [x] G3b: Edition-specific organization report data, comparison table and reusable report templates pass focused tests. HRS and NCHH are the first accepted packets; per-report research-time headers, scoped APIs and financial disclosures verified on phone/tablet/desktop. Deployment remains a separate release gate.
- [ ] G4: All eleven editions pass D100, A25, B10 and P4 below.
- [ ] G5: Final count, cross-geography arithmetic, sources, photos, mobile and canonical deployment audit.

For each edition:
- D100: 100 distinct real candidate organizations with checked primary-source lead, outcome mechanism, geographic reach, why plausibly high EV, major disqualifier, overlap identity and selection rationale. Deduplicate programs under the same organization. Hypothetical ventures do not count as organizations. Evaluate breadth and alternatives, not just famous/largest charities.
- S25: 25 selected after side-by-side comparison of plausible cost per incremental QALY, evidence/transferability, scale/changeability, marginal funding path and downside. No fabricated precise forecasts at discovery.
- A25: 25 published reports with realistic organization-level gift allocation, explicit costs and beneficiary geography, formulas, source-grounded assumptions, central/scenario estimates where defensible, counterfactual and attribution, native units, uncertainty, funding-room status, sources and measured provenance. A justified not-estimable review is valid; preserve null geographic estimates rather than inventing shares or precision. A terminal ineligible/closed screen is not a published researched organization; choose a replacement.
- B10: Ten accepted published beta revisions drawn from A25. Re-audit causal evidence, utility, mortality/survival, duration, attribution, displacement/overlap, full cost and marginal capacity; check latest three available original 990s/appropriate accounts and current operations; preserve before/after reasons. Negative or worse findings are valid. More time is allowed only for a concrete unresolved material issue.
- P4: Four photo-backed qualified picks selected after beta and donor-readiness review. A low speculative model number alone is insufficient. Explain recommendation basis, practical donation route and funding reservations; retain conditional research-lead labeling when funding readiness is unverified. Never imply a verified marginal opportunity when absent. If four do not qualify, report the shortfall rather than force endorsements.

Membership evidence lives in edition-specific ledgers with canonical organization IDs, boundary versions, source artifacts, accepted discovery IDs, frozen alpha cohort IDs, accepted beta IDs and top-pick IDs. Enforce P4 subset of B10 subset of A25 subset of D100. Counters alone do not prove acceptance. Provisional seed counts are separate from accepted discovery. If a published alpha organization becomes ineligible, retain its historical report but explicitly replace its active cohort membership before beta selection; total historical publications and the active 25-member cohort remain separate.

## Geographic accounting and reuse

CA estimates count benefits to people in California. USA estimates count US-resident benefits, not a charity's headquarters or worldwide work. City estimates count the defined metro/city population. Store both all-population impact and edition-attributable impact, with explicit allocation evidence and spillovers. No inherited Bay-only dilution on CA or USA pages; no population-share shortcut presented as observed allocation.

A shared organization record can support several edition-specific reports, but each denominator, marginal donor pathway and impact-share bridge must be accepted independently. Count unique entities globally and edition reviews separately. Reused SF reports start at zero for a new edition until accepted for that scope. Beta revisions add zero alpha/unique entities. Do not sum nested metro, state and national benefits as independent impact.

Whole-organization realistic unrestricted gift is default, with full costs and material program allocation. If only one program's health effects are quantified, clearly distinguish that partial-health perspective from whole-organization expected return. Restricted-program research requires an actual restriction pathway. Non-health effects and policy spillovers may be modeled with explicit causal assumptions, without asserting QALYs from advocacy counts alone.

## Website contract

September 14 priority correction: published cost-effectiveness rows should have a reasoned central estimate, using transparent judgment inputs when direct measurement is missing. Do not leave the central value null merely because a marginal conversion rate is unknown while a defensible conditional model exists. Explain the chosen prior, retain zero/adverse and broad sensitivity cases, and label partial-health scope. Never turn a threshold into a forecast without causal assumptions or invent supporting evidence. If genuinely nonpositive, report that result instead of a fictional finite positive price. Expense approximations must be distinguished from verified comparable three-year averages.

Current release checkpoint, September 14: California 14/25 initial reports, USA 25/25, Los Angeles 18/25, and New York City, Chicago, Houston, Denver, Seattle, Boston, Atlanta and Detroit each 0/25. USA has 1/10 accepted in-depth reviews (End Overdose); the other ten editions have 0/10. No new-edition picks qualify yet. NYC and Seattle discovery each have 100 accepted and 25 selected. Older checkpoint paragraphs record history, not current counts. Root is publishing independently audited batches while three workers advance city research and acceptance.

Published route contract (September 14):

- /givebetter/ redirects to /givebetter/all, the editions directory.
- /givebetter/san-francisco and /givebetter/san-francisco/all.
- /givebetter/california and /givebetter/california/all.
- /givebetter/usa and /givebetter/usa/all.
- /givebetter/<city-slug> and /givebetter/<city-slug>/all.
- Legacy /research, /editions and /cities links redirect to the corresponding current route.
- Edition-specific report routes beneath each edition, backed by shared organization identity/evidence rather than copied SF assumptions.

Reuse GiveBetter x SF design, fonts, responsive behavior, left desktop contents and concise summaries. Landing pages show top four with photos and a link to all reports once recommendations qualify; do not manufacture four picks for unfinished editions. Tables use Organization, $ per better life, and Avg. annual expenses (3 years). Fiscal-year details, sources and accounting scope live in each report's annual-expenses appendix, not list-row dropdowns. Remove repetitive readiness lines from the lists while retaining substantive scope and evidence in reports. Use integer thousands, one decimal millions.

Reports follow the accepted GiveWell-style structure: three-sentence what they do; three substantive strengths; three reservations; concrete services per dollar and their health connection; monitoring disclosure; qualitative assessment; funding; annual spending breakdown; sources and model metadata at bottom. Version labels belong only in expandable provenance. Do not copy GiveWell's endorsement language where our evidence does not justify it. Do not invent photos, finances, recommendations or tracking data.

## Verification and publication

Preserve unrelated work and the existing public SF page/archive. Each coherent item uses its own branch/worktree from current main; root-only integration. Reuse compatible dependencies, avoid copying generated directories, and stop root-created preview servers after checks. Baseline September13: 62 GiB free; existing residual worktree 66 MB; no install or server needed for planning.

For content/code publication: inspect diff; parse changed data; run relevant model, geography/count/provenance tests, lint/type checks, production build and responsive interactions. Commit/push to Rhys-Lindmark/market-for-impact, push the exact same commit to Sites, deploy exact source and verify canonical /givebetter routes/APIs. Preserve domain/access/routing/billing. Documentation-only planning changes do not need a redundant Site deploy.

Record actual run start/end and separate researcher versus integration effort; append measured shared work log. No email or outreach. Respect user pause immediately.

## Updates

Every update lists all eleven editions' published alpha x/25 and accepted beta x/10, plus discovery x/100 while relevant. Also report changed artifacts, material findings, blockers and next action concisely. Totals are backed by accepted artifacts, not aspirations. City names, metro scope and official county memberships are recorded. Do not count prior SF work toward new totals without edition-specific acceptance.

## First checkpoint and next dispatch

Latest September 13 checkpoint: California 6/25 and USA 6/25 prepared for publication, all beta 0/10. Western Center and WorkSafe retain unestimated marginal returns with transparent policy thresholds. The four preceding clinical reports are live via PR340. Continue the remaining accepted CA/USA cohort and independent metro selection; the older paragraphs below are historical checkpoints.

September 13 batch checkpoint: ten edition alpha reports are accepted for publication (California 4, USA 6), with zero beta and picks. This batch adds Homeless Health Care Los Angeles, Surgery on Sunday, The Headstrong Project and Dental Lifeline Network; acceptance evidence is in geography-alpha-batch-two-acceptance.md. Publication remains a separate release gate. Legal Action Center and California End Overdose remain numerically unestimated. California policy reports, USA direct-service reports and metro discovery continue in parallel. Historical checkpoint paragraphs below describe earlier states, not current counts.

Foundation packet: 40 provisional seeds (20 California, 20 USA), nine official MSA definitions/102 county memberships, stage/counting validation and local dashboard. Seeds are deliberately not accepted D100 or alpha reports: many retrievals are search excerpts and legal-recipient/EIN verification remains incomplete. Preserve these limitations. Shared source-retrieval intervals are not full report effort.

Current checkpoint: California100/100 and USA100/100 accepted discovery;25 research priorities and ten alternates selected per edition after final-wave audits and four replacements. Four historical holds remain outside active pools. See docs/geography-discovery/accepted-cohorts.json and cohort-acceptance.md. Denver40 provisional leads saved; final60, LA and NYC discovery active. No alpha/beta publication. Next: G3b edition report/table surface and Astra Light alpha batches. SelectedAlphaIds are research priorities, while alphaCohortIds count only published accepted reports; do not conflate them. Continue remaining metro discovery without starving report publication. Exact focused research intervals must include reading/thinking/writing, not just tool-call duration; display rounded time and actual model near each report title.
