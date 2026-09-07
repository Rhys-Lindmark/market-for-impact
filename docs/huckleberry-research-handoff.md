# Huckleberry — next research slice

Prepared 2026-09-07. Research handoff, not a completed cost-effectiveness model or funding recommendation.

## Scope

Evaluate adolescent anxiety/depression counseling, not the organization's entire youth-service portfolio. The FY2025 audit describes 228 SF counseling clients aged 12–24, but does not isolate counseling expenditure. The $1,226,730 Youth Health Center line is a broader bundle: do not divide it by 228 and call the result marginal counseling cost.

- [FY2025 audited financial statements](https://www.huckleberryyouth.org/wp-content/uploads/2026/02/101052_Huckleberry-Youth-Program_6.30.25-YE-FINAL-FS.pdf), printed page 7 for program description; retrieved 2026-09-07.
- [Organization outcomes](https://www.huckleberryyouth.org/our-mission-in-action/), retrieved 2026-09-07: the 516 mental-health recipients and 63% Outcome Rating Scale improvement describe a different aggregate. They are not a causal local counseling effect or a QALY conversion.
- [FY2025–26 TAY service objectives](https://media.api.sf.gov/documents/FY25-26_TAY_SOC_Standardized_Objectives_V2Apr2026.pdf), retrieved 2026-09-07: distinguish engagement targets from delivered adolescent counseling.

## Strongest external lead

[Lynch et al., JAMA Network Open (2021)](https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2777443), DOI 10.1001/jamanetworkopen.2021.1778: randomized 185 participants to brief behavioral treatment versus assisted referral. The reported incremental HUI2 endpoint is 0.026 QALYs over 32 weeks (95% CI 0.009–0.046). Delivery comprised 8–12 weekly 45-minute sessions; the $1,183 delivery cost is in 2014 dollars and includes training/supervision.

The mean age was 11.3, unlike Huckleberry's broader 12–24 population. Verify age, diagnosis, comparator, analysis population and delivery match from the full paper before choosing transfer assumptions. A direct measured QALY endpoint is preferable to converting service counts or satisfaction. The paper's favorable societal cost result includes other-service costs; it does not imply that a donor can buy counseling for a negative price. Keep gross donor cost distinct from healthcare or family savings.

## Model to construct

`USD per 10 QALYs = 10 × local marginal course cost / (0.026 × program/population transfer × donor additionality)`.

The 0.026 already integrates utility over follow-up. Do not multiply by duration, completion, or retention a second time unless a clearly separate estimand requires it. Separate wage-year conversion from uncertainty in local staffing and supervision. Include failed engagement costs in the cost per offered course, not only successful completers.

Even at full transfer/additionality, a sub-$100,000 result requires course cost below $260. That is a useful falsification threshold, not a reason to assume cheap delivery. Preserve youth benefits not captured by the short health horizon as excluded benefits rather than automatically adding them.

Next acceptance: primary-source reconciliation, explicit three-scenario model and null boundary, independent review, dedicated canonical report/API, model tests, mobile tests, lint/build, PR merge and canonical deployment. Current marginal capacity and public/private substitution remain unverified; no organization outreach has occurred.
