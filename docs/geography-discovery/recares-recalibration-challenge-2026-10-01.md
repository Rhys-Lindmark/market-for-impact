# ReCARES candidate: independent challenge

October 1, 2026. **ACCEPT arithmetic as an inspectable diagnostic; HOLD publication as an accepted recalibration or replacement central price.** Independent GPT-6.1 Sol challenge of `recares-recalibration-2026-10-01.md`, its `.mjs`, and `scripts/recares-recalibration.test.mjs`. No product data, model judgments or prices changed by this reviewer. Five candidate tests pass; 40 separately expanded recipient/health/income/total checks across both scopes and all five scenarios also pass.

## Fresh original financial extraction

Direct in-memory HTTP retrieval returned 200 for all three original reconstructed IRS Forms 990-EZ. Browser extraction could not open the original full-text URLs, so this review fetched their HTML with existing Node 24.18.0 and read original labels, values and checkbox attributes. Links identify the exact inspected submissions:

| Original field | [FY2023](https://projects.propublica.org/nonprofits/full_text/202401359349201805/IRS990EZ) | [FY2024](https://projects.propublica.org/nonprofits/full_text/202501339349200530/IRS990EZ) | [FY2025](https://projects.propublica.org/nonprofits/full_text/202621259349200012/IRS990EZ) |
| --- | ---: | ---: | ---: |
| Line 9 revenue | $88,930 | $106,933 | $196,772 |
| Line 13 professional fees / contractors | $67,957 | $96,634 | $54,640 |
| Line 14 occupancy | $8,359 | $8,332 | $9,938 |
| Line 15 printing / postage / shipping | $3,071 | $2,851 | $2,435 |
| Line 16 other expense | $3,360 | $3,388 | $5,570 |
| Line 17 total expense | $82,747 | $111,205 | $72,583 |
| Line 18 surplus / deficit | $6,183 | −$4,272 | $124,189 |
| Line 20 other net-asset changes | $942 | $0 | $360 |
| Line 21 ending net assets | $192,805 | $188,533 | $313,082 |
| Line 22 ending cash / savings / investments | $168,011 | $176,715 | $253,225 |
| Line 25 ending assets | $198,036 | $193,740 | $313,257 |
| Line 26 ending liabilities | $5,231 | $5,207 | $175 |
| Line 32 program service expense | $73,668 | $103,400 | $69,412 |
| Recipient narrative | 8,934 | More than 9,770 | More than 11,000 |
| Checked accounting-method flag | **Cash** | **Cash** | **Accrual** |
| Amended-return checkbox | Unchecked | Unchecked | Unchecked |

The four expense buckets reconstruct all three totals. Net-asset identities also agree, including the two nonoperating changes. **The accounting-method change is material:** these are not three demonstrably comparable cash-spending periods. A naive three-year mean is $88,845, but it mixes cash and accrual and should be labeled a diagnostic, not a reconciled cash-cost estimate. The FY2025 expense fall is concentrated in contractors; it does not establish improved operating efficiency or unchanged paid capacity. Recipient counts remain reported equivalents, not deduplicated recipients or outcomes.

No inspected submission marks itself amended. That is narrower than proving no later amendment exists. The browser [organization index](https://projects.propublica.org/nonprofits/organizations/943213876) showed 2024 as newest, while the directly fetched API listed data only through 2023; both are incomplete relative to the directly available 2025 return. **Do not check off an exhaustive subsequent-amendment check.** The three exact submissions and their flags are verified; index freshness remains a limitation.

## Cost scope and equations

The old marginal illustration is internally coherent: a $10,000 gift divided by `$72,583 / 11,000` reported-recipient-equivalent accounting cost gives a bounded throughput starting point; scenario throughput and unique-recipient factors then reduce it. It does not charge the entire annual cost while pricing an unspecified gift. The candidate correctly preserves that marginal construction, and separately asks what annual work costs before the extra-gift response factor.

Independent reconstruction used `N = 11,000 × uniqueFraction` annually, or `N = 11,000 × uniqueFraction × $10,000 / $72,583 × throughput` marginally. Health is `N × [Σ(deviceShare × unmet × safeUse × utility × years) − harmPerUnique] × BayShare`. Income is `0.5 × affectedPeople × ln(1 + netSaving / baselineIncome) × BayShare`. The healthy-year comparison coefficient is reproduced from [Coefficient Giving's published logarithmic method and $50,000 / $100,000 reference values](https://coefficientgiving.org/research/cost-effectiveness/). That is a welfare-equivalent comparison, not a clinical QALY measurement.

The annual central health-only price is $37,360.17 versus marginal $74,720.34; this factor-of-two difference is entirely removal of central throughput `.5`, not new observed effectiveness. The annual signed health-only price is $75,359.82 versus marginal $107,774.46; differing scenario throughput factors mean it is not a uniform multiplier. Annual work still requires alternative-access, deduplication and safe-use judgments, and its causal attribution to the recipient's historical expense remains exploratory.

Candidate central marginal price with savings is $66,068.88; signed weighted is $99,381.45. Central annual price with savings is $33,034.44; signed weighted $69,816.13. Lower-clinical marginal central is $180,413.95. Applying −$20 net income loss to every recipient in every scenario produces marginal central $90,559.18. Zero-income reconstruction matches the old health model exactly. These are arithmetic outputs for declared scenarios, not confidence intervals or accepted replacement headlines.

## Economic incidence and overlap challenge

The proposed purchaser group may coherently be disjoint from otherwise-unmet recipients: someone who would buy equivalent equipment can save cash without also receiving the modeled health gain for newly obtained equipment. The aggregate constraint `purchaseShare + Σ(deviceShare × unmet) ≤ 1` makes such a disjoint construction possible. It **does not empirically establish group membership**, equivalent equipment, adequate timing, individual device mix, actual replacement purchasing or realized cash saving. No reviewed operations page supplies the 30% purchase share, $50 net saving or $20,000 baseline income. Those remain unsourced sensitivity judgments. The otherwise-unmet service description is also compatible with many people who would never purchase equipment, whose sticker-price saving is zero.

The function handles negative net saving across every unique recipient, as the narrative intends, while positive saving is limited to the purchaser share. This asymmetric exposure is a declared adverse diagnostic, not a bug. Purchaser/use/return/safety attrition for savings is not separately evidenced; positive savings must either already mean net realized saving after those failures and acquisition costs, or include an explicit realization factor. Merely saying “net” does not supply empirical support.

Recipient savings can be a transfer or redistribution, with counterparty losses and donated-equipment opportunity cost. Foregone insurer reimbursement is not automatically household consumption, and avoided retail revenue is not necessarily a dollar-for-dollar social loss. Neither conclusion can be assumed without incidence analysis. Donor expenditure already appears in the cost numerator and should not also be subtracted as an unexplained duplicate welfare penalty. Volunteer labor, donated-device opportunity cost and travel remain unresolved resource/benefit boundaries. Zero-incidence credit and adverse acquisition-cost cases are necessary alongside positive purchaser scenarios.

Income is assigned in conjunction with health scenario labels and subjective weights. A health-null scenario can still have household savings, or health-positive distribution can create none. The present paired scenarios do not span that independent uncertainty. Publication acceptance requires a separate income bridge/sensitivity family, including health-null/income-positive, health-positive/income-zero, negative net saving and plausible incidence offsets; do not use shared labels to suggest empirical correlation or calibrated probability.

## Publication gates

1. Keep 30% / $50 / $20,000 as a **parameterized exploratory savings case**, or obtain evidence and an explicit defensible central judgment. It cannot become a public measured-effect point estimate by passing arithmetic tests. A fully disclosed judgment central may ultimately be acceptable after independent evidence challenge and signed sensitivity review, but this packet alone does not settle that choice.
2. Reassess clinical utility and duration with the existing controlled-evidence memo `docs/recares-utility-evidence.md`. It records null quality-of-life findings in relevant walking-aid trials, not proof of zero utility. This challenge reused that memo; it did not newly review all clinical full texts. The lower family is diagnostic, not an empirically identified substitute either.
3. Disclose cash-to-accrual comparability; preserve resource-cost stresses and actual source-period spending categories. Verify current marginal funding and recipient capacity separately from historic surplus or ratio.
4. Decide and justify a consistent central-versus-signed-weighted ranking convention. Neither subjective scenario weights nor a central row is an empirically identified expected value. Existing research-index selection does not overrule the earlier audit's preferred statistic without an explicit documented policy.
5. Root accepts the final economic/clinical bridge, then synchronizes report, summary, list, top four and API with appropriate tests and actual timing. **This review leaves public prices unchanged and accepts no new completed-recalibration count.**

Actual independently clocked challenge interval: **2026-10-01 16:36:14–16:38:32 UTC (2m18s)**, GPT-6.1 Sol. Packet reading before the start and memo writing afterward are not included or reconstructed. This was bounded arithmetic/financial/source scrutiny, not a claim of a full fresh clinical research pass. Space Saver and Token Saver applied: existing checkout/runtime, no dependencies, downloads to disk, servers or product edits; only this challenge memo created.
