import {calculate,scenarios} from './hac-calibrated-model.mjs';
export const version='hac-health-resources-2026-10-03';
const r=calculate(),money=x=>x===null?'No finite positive price':'$'+(x/1e6).toFixed(2)+'M';
export const summary={intro:'Housing Action Coalition works on housing production, project assistance and implementation education. Its Developer Pathway Program offers technical support for emerging housing practitioners. This report assesses an explicitly designated charitable gift to the c3 entity, not default membership in its affiliated advocacy entity.',reasons:['Helping viable projects reach occupancy sooner could improve housing conditions and affordability.','Technical assistance provides a more concrete delivery mechanism than treating every policy announcement as additional housing.','Published returns and program descriptions allow scrutiny of organizational boundaries, spending and current activity.'],reservations:['The current Developer Pathway Program is sponsored and applications are closed; an additional funding tranche is not verified.','Project completion, occupancy acceleration and household outcomes attributable to another gift remain judgment assumptions.','Charitable and advocacy finances are not consolidated, and wider institutional benefits and comprehensive costs remain unquantified.'],cost:'Our conditional estimate is '+money(r.donorPriceBay)+' per better life in the Bay Area, including health and signed household-resource effects. An illustrative $100,000 comparison models 0.576 advisory-supported and 1.8 implementation-related accelerated occupied-home equivalents, with finite catchup periods. This is not evidence that those homes or a particular donation opportunity are available.'};
export const markdown=`## Summary

${summary.cost}

## What HAC does and who receives the gift

Housing assistance, practitioner education and policy implementation can address different obstacles between a permitted project and occupied homes. A project still needs financing, construction and tenants; a permit or workshop alone is not the modeled benefit. The program's possible housing effects extend beyond the people attending training, but that does not identify how much an additional donor causes.

The selected recipient is the c3 entity, EIN 83-1881525. The affiliated c4 has EIN 82-1817943. The current shared donation form describes both routes and says memberships default to c4 unless requested otherwise. This comparison therefore requires explicit c3 designation. It does not transfer c4 advocacy accomplishments or expenses automatically into the charitable calculation. Entity control, related-party transactions and the allocation of shared work remain important unresolved boundaries.

## Whole-organization finances and annual spending

Fresh selected original 2022–24 return passages show c3 functional expenses of $1,062,402, $978,842 and $1,106,820. Revenue-netted event expenses of $179,683, $56,989 and $132,144 give arithmetic gross totals of $1,242,085, $1,035,831 and $1,238,964. These are accrual spending figures, not marginal cash costs per completed project. Do not add those event costs twice or call operating expense cash flow.

The 2025 impact report lists $2,781,459 of mixed c3/c4 support. That is revenue/support, not consolidated expense or a verified funding gap. The c4 return and related-party reconciliation are inherited evidence rather than fresh full-return review; the unresolved reconciliation prevents a clean consolidated trend. The latest official posted c3 filings remain 2022–24. Selected physical pages 1, 9 and 10 were freshly read; no complete financial audit is claimed. Financial years and sources remain in the appendix.

## Delivery, monitoring and the implementation counterfactual

The current Developer Pathway Program is sponsored and applications are closed. Its advertised participant fee and promotional service value do not establish the fully loaded cost of extra advisory delivery. Its coverage includes the nine Bay counties and Sacramento; program eligibility is not proof of recipient residence. An additional donor cannot receive credit for repurchasing already sponsored work.

A useful outcome ledger would connect a specific additional advisory course to project stage, financing, completion probability and occupancy dates with and without that advice. Duplicate projects supported by several organizations must be identified. For policy implementation, the relevant record is remaining administrative work and resulting occupancy beyond enacted and funded plans—not a claim that a new gift caused the entire law. San Francisco's adopted Family Zoning plan is already the baseline.

No reviewed public source supplies a donor-linked occupancy, rent, displacement or household earnings dataset. That does not prove internal records do not exist. It limits the confidence of the current numerical planning comparison and makes staff work plans and project-level alternatives more valuable than another retrospective success story.

## Causal evidence and transfer

Housing supply can affect rents and housing conditions. The freshly read author-repository working-paper abstract supports a nearby rent mechanism, but its multi-city contrast is not a measured HAC dose, local rent saving or clinical coefficient. We do not apply its 5–7% contrast mechanically to every local renter.

Inherited primary affordability and rental-assistance abstracts support a possible mental-health pathway, with substantial transfer limitations and nonsignificant within-person findings in one study. SF-36 score changes are not preference utilities. Our 0.004 annual utility improvement in an affected subset is an independent weak judgment, not a conversion from those scores. The regional zoning forecast of thousands of homes describes the whole reform and cannot be multiplied into a next-gift output claim.

## Whole-gift model and first results

GiveBetter sees a plausible mechanism in helping housing projects become occupied sooner. We estimate ${money(r.donorPriceBay)} per better life in the Bay Area and ${money(r.donorPriceSF)} for San Francisco under the current conditional health-and-resource comparison. Neither figure is an identified expected organizational return or a verified donation offer.

The complete illustrative $100,000 c3 gift remains the numerator. The hypothetical allocation is 40% advisory work, 40% implementation and 20% other unquantified activities—not an observed budget ratio. Advisory work assumes $20,000 of full support per course, two courses, 25 project homes each, a 6-percentage-point completion difference, 30% genuinely additional funding response, 80% Bay residence and 80% non-overlap with policy-supported projects. This yields 0.576 Bay home-equivalents. These distinct counterfactual stages are not repeated generic discounts.

Implementation assumes 400 potentially actionable project homes and a 0.5% attributed occupancy-acceleration effect of the selected funding bundle, with 90% Bay incidence: 1.8 Bay home-equivalents. The 400-home cohort is a planning scenario, not observed HAC throughput. Advisory occupancy starts after four years and lasts three incremental years before comparison projects catch up; implementation starts after six years and lasts two. Together they produce 5.328 undiscounted additional home-years. These are probability/attribution-weighted occupancy equivalents, not fractional houses physically delivered or lifetime building benefits.

Health assumes 2.2 residents per home, 15% materially improved housing conditions and a 0.004 annual utility gain. Separate displacement affects 2% of households per home, with a 0.008 utility loss for two years. Clinical exposure integrates finite survival and discount continuously, including delay; 1% background mortality and 3% discount are generic priors, not a housing-created longevity effect. Broad unspecified nonoccupant clinical spillovers are not added.

Per $100,000, Bay health is ${r.healthBay.toFixed(8)} years and signed household resources are ${r.resourcesBay.toFixed(8)} equivalent years, giving ${r.combinedBay.toFixed(8)} combined years. Ten combined years are the better-life comparison unit; income-welfare equivalents are not measured clinical QALYs.

Household resources use the Coefficient Giving crosswalk: 0.5 times the logarithmic disposable-resource change, multiplied by affected population and discounted duration. For each home-equivalent, ten distinct renter households receive a judged $30 annual rent saving on $40,000 baselines. A separate owner household loses the matching $300 on a $100,000 baseline. The transfer is evaluated by incidence before logarithms, not by treating gross rents or property appreciation as income. Positive renter gains retain 50% for possible financial-stress/health overlap; owner losses are fully charged.

A separate taxpayer household bears a judged $50 per home-year on a $60,000 baseline. Displaced households incur $1,000 of actual relocation costs for one year, separate from health losses. Owners, taxpayers and displaced households are modeled as distinct cohorts; that disjointness is a judgment requiring evidence. Where cohorts overlap, a joint cash baseline is needed. No public grant, loan principal, developer revenue or charity staff wage is credited as recipient income.

Net work income is always considered. Centrally it is zero as an unidentified-sign case, not proof of no employment effect. Positive and negative $500 annual disposable-pay scenarios apply to a 25% worker subset of renter households after their rent saving changes the cash baseline. Taxes, benefit changes and work costs belong in net pay. Earnings stop at the finite occupancy catchup window; ordinary wages of additional survivors are not benefits. All negative pay is fully debited.

Money flows use year-midpoint survival and discount, including fractional final years; this is an approximation distinct from continuous clinical integration. Raw discounted household cash is negative centrally, approximately $243 in the Bay Area per illustrative gift, before welfare conversion. Owner, tax and displacement costs make the resource contribution negative; income was not allocated inside a fixed old health total.

| Assumption test | Bay dollars per better life |
| --- | --- |
${scenarios.filter(([id])=>['central','positiveWork','negativeWork','noTax','shortCatchup','highNative','lowNative'].includes(id)).map(([id,p])=>'| '+id+' | '+money(calculate(p).donorPriceBay)+' |').join('\n')}

These are unweighted assumption tests, not confidence intervals. The finite software gift domain is at most $100,000, not verified funding capacity. Caller-specified complementary institutional costs change only a separate gross-cost diagnostic; no comprehensive economic-cost estimate is identified. Missing wider portfolio value is unknown, not zero.

## Additional funding and alternatives

Current program sponsorship and closed applications weaken a simple claim that new donations purchase new places. Needed evidence includes a current c3 work plan, staff and funding constraints, cost per additional course, remaining implementation bottlenecks and explicit no-gift project timelines. Historical deficits and advertised service values do not supply that evidence.

Other practitioners, public agencies and housing advocates may substitute for or complement HAC's work. Their contributions cannot also be credited in full to this gift. A c3-specific pathway must be distinguished from affiliated advocacy and developer-funded services before making a funding recommendation.

## Organizational assessment and strongest disconfirmation

Named programs and financial disclosures provide useful transparency about activity and organizational boundaries. They do not establish marginal productivity or responsiveness to research questions; no outreach or beneficiary interviews occurred. The strongest opportunity would be a small, genuinely additional intervention unlocking a delayed viable project. The greatest weakness is the lack of a verified joint bridge from charitable funding to occupancy and recipient outcomes.

The current scenario is deliberately conditional. A less favorable number does not prove the institution's wider work is poor, and omitted policy value should not be treated as worthless. Conversely, plausible large leverage is not evidence of a calibrated probability or permission to give a new donor the whole effect of an enacted law.

## Decision and revision record

The previous clinical-only center was $23.31M Bay/$31.66M San Francisco per better life. The revised combined comparison is ${money(r.donorPriceBay)} Bay/${money(r.donorPriceSF)} San Francisco. Independently reconsidered utility, affected residents, actionable projects and finite occupancy windows replace the broad adopted-forecast and spillover assumptions; signed household gains and losses are added separately. The change is in assumptions and coverage, not measured deterioration. All twelve original full worlds, the additional-resource stress and eight original source-byte hashes remain preserved.

## Model input appendix

The calculator exposes all assumptions, native units, component health and signed household flows. Known zero effect or population can establish appropriate absent routes; unavailable numeric-zero placeholders cannot. San Francisco beneficiary shares are advisory 20% and implementation 70%; owner, taxpayer, displacement and independent harm shares are separately modeled. Known beneficiary absence never erases independently allocated negative effects. Original returns were freshly checked only in selected passages; c4 reconciliation, Controller/Planning baseline and clinical abstracts are inherited evidence. No complete audit, empirically identified expected value, additional capacity or comprehensive portfolio valuation is claimed.
`;
