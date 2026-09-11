# Legal Link independent audit

Final decision: ACCEPT for transparent exploratory **partial-health, full-historical-cost** publication; HOLD any giving recommendation. No coefficient retuning requested. Author corrected both renderer/content issues below; independently verified before acceptance.

## Independently verified

- [Four-state evaluation](https://legallink.org/wp-content/uploads/2026/01/J.-Teufel-Legal-Link-4-State-Evaluation-of-Legal-First-Aid-December-2025-1.pdf), printed pp1–3: 336 pre/post participants; legal capability 54→76, 91% improved and 8% declined. The 13,734 clients are estimated prior-30-day/pretest caseload, not incremental beneficiaries. Immediate perceived capability is not client health, successful resolution or a controlled causal effect. The model correctly does not use this count or score change as a health denominator.
- [Annual report](https://legallink.org/wp-content/uploads/2026/04/2025-Impact-Report-Legal-Link-1.pdf), printed pp4–7: 586 annual certifications, 195 California; 244 consultations; 58 SF staff across 11 organizations with Tipping Point support. Cumulative 4,207 and estimated 20,000+ reach are not substituted for annual marginal throughput. Bay-within-California remains a judgment, not measured residence. The national expansion plan makes fixed geography an uncertain transfer.
- [July 2026 hiring document](https://legallink.org/wp-content/uploads/2026/07/2026-Legal-Empowerment-Advocate-Job-Description-Legal-Link.pdf), pp1,3: first direct-client team member, SF, $60–75K salary, two-year MOHCD grant through June 2028, target October/November 2026 start, August 28 deadline. This is publicly described funded capacity, not an unfunded donor vacancy. Hiring completion and executed city contract were not independently verified; report appropriately does not claim them.
- [Filed 990](https://projects.propublica.org/nonprofits/full_text/202620499349300032/IRS990): expense $765,831 = $515,395 program + $180,776 administration + $69,660 fundraising; revenue $818,902; government grants $252,832, program revenue $257,292; unrestricted net assets $450,300. Compiled/reviewed yes, audited no. Full expense is retained; revenues are not subtracted as if donated care were free.

## Arithmetic and assumptions

Ran `/private/tmp/mfi-legal-link-model.test.mjs`: seven tests passed. Independently executed model: weighted Bay QALY 0.21675930628934123; $4,613,412.070368732 per10; SF $10,255,136.989434794. Central Bay QALY 0.01360193734364619; $73,518,938.86403802. Favorable contribution 0.9972924677424321 of signed expectation; without favorable, renormalized price $1,618,721,791.6241288. These agree with report rounding.

Central 18.3644 additional training equivalents → 88.149 unique case equivalents nationally; additional resolution, health relevance and finite utility are separate gates. Benefit begins one year later and lasts at most two years across declared scenarios, discounted 3%; no mortality/family/lifetime-worker multiplier. All conversion values and probabilities are judgments, not validated health evidence. The favorable world dominates almost completely; numerical rank must not imply robust expected effectiveness.

Null and signed harm worlds are retained. Funding zero gives no modeled service harm; health-null has zero net health; adverse world is negative rather than an attractive negative price. Additional partner labor, legal care and downstream services remain unknown resources, with complete societal and verified marginal costs explicitly null. Overlap with partner charities is disclosed. Default input bounds reject NaN/Infinity/negative/excess gifts and malformed/null worlds. No dependencies or Site execution required.

## Required integration corrections sent to author

1. Initial JSON omitted `evidence`. Shared renderer requires it and calls `.map`. First attempted repair used claim/evidence/limitation fields; actual schema is `key`, `design`, `population`, `result`, `transfer`. Require nonempty entries in the correct shape before integration.
2. Step text said new direct service remains costed. The historical fiscal-year baseline ends June 2025, before the planned October/November 2026 hire. Replace with an explicit distinction: historical activities remain costed; future grant-funded direct service receives no additional benefit credit, and its future cost is not included in this historical baseline. The already disclosed fiscal/calendar output mismatch remains. No arithmetic change needed.

Nonblocking robustness suggestion: custom worlds can have duplicate/renamed scenario names, while favorable-tail diagnostics identify one exact name. For any future editable API, enforce unique nonempty names and a stable favorable identifier (or disallow custom-world input). Default declared-world results are unaffected; not a reason to retune or delay a static report after the two content fixes.

## Provenance

Observed wall interval 2026-09-11 07:06:17–07:09:41 UTC (3m24s). Final verification: three nonempty evidence entries each have key/design/population/result/transfer; future-cost wording explicitly excludes the later direct-service hire from historical costs. Seven model tests re-run and pass, exact snapshot unchanged. Parent-confirmed gpt-6-astra / low. Active effort not independently measured. Outside-Site only, no outreach, installs, nested workers or previews. Existing runtime/checkouts reused under Space Saver.
