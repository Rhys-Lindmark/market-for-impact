import {evaluate,scenarios,VERSION} from './glide-calibrated-model.mjs';
export const version=VERSION;
const r=evaluate(),money=x=>x===null?'No finite positive price':'$'+(x/1e6).toFixed(2)+'M';
export const summary={
 intro:'GLIDE Foundation provides meals, housing assistance, family support and access to health services in San Francisco. Its health team connects people to public-partner treatment, testing and practical support. This report examines a donation to the Foundation, keeping its separate Church and partner services distinct.',
 reasons:['Practical services can reach people facing several barriers to food, housing and treatment at the same time.','Connections to medication treatment and housing stabilization offer plausible, concrete health pathways.','Household relief from food, rent and childcare can matter in addition to clinical health, and published financial disclosures allow scrutiny of costs.'],
 reservations:['Additional completed services attributable to another donation are not established by reported activity counts.','The outcome and household-income assumptions are judgments rather than measured GLIDE-specific causal effects.','Owner, taxpayer, benefit-cliff, policy and other portfolio effects remain unquantified; the calculation is not a verified funding offer.'],
 cost:'Our conditional estimate is '+money(r.bay.donorPer10HealthyYears)+' per better life in the Bay Area. A $100,000 comparison models additional rescue support, treatment access, food, housing and family courses, with separate health and signed household-resource effects. Native course costs and donor response are assumptions; these are not services a donor can buy at a guaranteed price.'
};
export const markdown=`## Summary

${summary.cost}

## What GLIDE does

GLIDE offers food, health access, family support and housing assistance. The current HEAT page describes same-day medication treatment through San Francisco public street-medicine partners, wound care and vaccines through UCSF partners, testing and navigation. It also describes contingency-management groups and gift-card incentives. Its peer hepatitis C navigation program remains paused. Those distinctions matter: an old program description is not proof that the same service is currently delivered or that additional donations expand it.

The Walk-In Center describes help with back rent, deposits, benefits applications and employment referrals. The family center describes licensed childcare and family support. Daily meals meet an immediate need; the value of a meal is not automatically the restaurant price, a medical treatment effect or a lifetime mortality gain. The newer young-adult center has named public and private support, but we do not assign its entire activity to the next donor.

Our recipient is GLIDE Foundation, EIN 94-1156481. The Church has a separate giving route. Foundation-only tax returns and a consolidated audit are different boundaries; property, Church and partner activity cannot be treated as if it all belongs to one additional Foundation gift.

## Spending breakdown

Selected passages from the latest three posted Foundation returns show functional expenses of $30,700,742, $28,329,199 and $28,937,817 for fiscal years 2023, 2024 and 2025. Adding revenue-netted event costs once, and the 2023 inventory cost once, gives arithmetic total spending of $32,024,748, $29,068,187 and $29,443,117. The fiscal-year figures and sources are retained in the financial appendix. These are annual accounting totals, not prices per additional client.

The fiscal 2025 return reports $17,533,149 of program spending and $10,963,932 of government grants. The inherited consolidated audit reports $30,766,602 of expenses across its broader entity boundary. That total must not be substituted silently for Foundation-only costs. The financial index's operating budget ended in June 2026; it is not current evidence of a funding gap or available cash. Selected financial passages were freshly inspected, not every schedule or a complete audit.

The comparison allocates the full donation, including common operations, policy and affiliate work. Illustrative shares include 10% rescue support, 10% housing, 22% meals, 3% medication-treatment access and smaller family and clinical pathways. These are hypothetical marginal allocations, not observed program budgets. Actual donation restrictions, staff capacity, public contracts and the activities displaced by another gift need confirmation.

## Monitoring and information sharing

Delivery records should distinguish visits, doses, meals, unique people, completed courses and sustained outcomes. The inherited impact report lists 620,513 meals, $965,254 of housing assistance and 317 reported people, plus 56 medication-treatment enrollees. Fresh access to that impact PDF failed; these remain inherited figures, not newly verified outcomes. None can be multiplied directly by a survival gain or a lifetime earnings benefit.

For treatment access, the important sequence is additional eligible people, completed care, retention and outcomes compared with existing accessible treatment. For housing assistance, it is a payment's effect on stability and household resources compared with other public or private help. For childcare, displaced fees and employment changes must be separated. Shared recipients need deduplication across programs rather than one family multiplier per service.

We would especially value current program-level costs, public-partner responsibilities, unique recipient records, household cash-before-payment distributions and credible no-donation comparisons. These would change the estimate more than another aggregate activity count. Public descriptions show plausible operating mechanisms, but do not identify the marginal capacity or causal effect required for a large donation decision.

## Clinical evidence and transfer

Original medication-treatment research supports a possible mortality pathway. The observational overdose-survivor study reports a buprenorphine adjusted all-cause hazard ratio of 0.63; it does not identify GLIDE's effect. A randomized emergency-department initiation study reports higher treatment engagement at 30 days, not GLIDE-specific mortality or long-term retention. Public referral options, retention and local delivery therefore remain separate assumptions.

The rescue and treatment comparison uses exclusive rescue-only, medication-only and shared cohorts, avoiding duplicate opioid and all-cause deaths. Hazard changes apply only during funded active care. Afterwards, equal hazards preserve a remaining survival gap without creating continuing treatment exposure, and a ten-year ceiling limits extrapolation. The new reference uses a 0.0025 rescue hazard reduction and 25% donor additionality, versus the old 0.005 and 40%. These are reconsidered judgments, not newly measured coefficients.

An original hepatitis C trial supports better care completion from colocated treatment, but ordinary referral is not its intervention arm. The paused GLIDE peer program receives no specific effect. Food research does not establish a disease or mortality effect from ordinary meals: the intensive diabetic food trial did not show a clear between-group HbA1c improvement. The model retains only short selected symptom relief. Parenting, women's support, depression and other utility conversions remain inherited weak priors, not newly reread trials or measured local QALYs.

Negative utility and explicit side effects are retained in full. Positive distinct-health discounts do not attenuate harms. Null clinical response, shorter active exposure and adverse outcomes are executable alternatives, not caveats without numerical consequences.

## What do you get for your dollar?

GiveBetter sees plausible value in helping people receive food, stable housing and effective care when existing options do not meet their needs. We estimate ${money(r.bay.donorPer10HealthyYears)} per better life in the Bay Area and ${money(r.sf.donorPer10HealthyYears)} for San Francisco recipients under a conditional partial-portfolio scenario. A better life here is ten combined health and income-welfare-equivalent years. Economic equivalents are not measured clinical QALYs or DALYs.

For $100,000, illustrative native prices are $500 per annual rescue-support package, $10,000 per housing episode including cash assistance, $1,080 per 90-meal course and $13,000 per half-year childcare course. A $16,000 annual medication-access budget unit has additional public clinical resources. These costs were reconsidered as delivery units but remain priors; ratios between annual spending and reported clients do not establish marginal prices. A double-cost diagnostic shows what happens if these assumed native units are too cheap.

The reference health ledger produces approximately ${r.bay.healthQaly.toFixed(5)} Bay health years. Housing cash, displaced food and childcare purchases, employment and participant costs separately produce approximately ${r.bay.economicHealthyYearEquivalent.toFixed(5)} signed income-equivalent years before cross-domain overlap. A positive-only overlap adjustment then yields ${r.bay.combinedKnownHealthyYearEquivalent.toFixed(5)} combined years. This is the subtotal of specified routes, not the full portfolio or an empirically identified expected value.

### Household resources, not gross output

Housing assistance conditionally frees consumption resources in half the modeled cases; alternatives occupy the other half. A $3,045 transfer is not automatically $3,045 of new welfare: rent arrears, deposits, alternative assistance and owner surplus matter. A $30 participant burden remains in either state. Meals free cash only when they replace a purchase: the scenario uses 90 meals at $3 household purchase cost, not GLIDE's delivery cost, in 25% of cases, with $10 access burden.

For childcare, fee replacement and new employment are exclusive states. The scenario assigns 25% to $3,000 displaced fees, 20% to employment, and the remaining 55% to no distinct cash improvement. Employment starts with $3,000 gross wages and subtracts $600 uncovered care, $200 travel and $300 taxes. The $100 course burden remains. These probabilities and amounts are judgments. The employment case does not also receive the fee-saving benefit, and ordinary earnings merely from surviving are excluded.

Within each state, cash costs are combined before the nonlinear welfare conversion, then states are probability-weighted. We do not take a logarithm of an average payment. Positive independence applies only to gains; adverse wages and costs remain fully debited. A $15,000 annual pre-payment cash baseline is an explicit prior, not a measured GLIDE income distribution. One household welfare recipient per course avoids an automatic family multiplier; shared-household and alternative reporting-unit scenarios test that assumption.

Owner net surplus, public displacement, benefits cliffs, contingency-management incentives, policy and other household flows remain unknown and can have either sign. Public tax receipts are not automatically positive taxpayer welfare. Positive-only health/resource overlap is a separate sensitivity; it does not erase negative components. Unknown routes produce explicitly incomplete specified-burden diagnostics, not proof that missing benefits are zero.

## Funding and previous grants

The full donor gift stays in the cost numerator. Public clinical delivery, volunteers and partner resources enter a separate gross associated resource boundary. A rental transfer is excluded once from gross resource cost, but never from the donor's cash cost. Gross resource spending is not the same as induced net social cost: some care would have been funded without this gift.

The $100,000 scale and absorbable-capacity ceiling are assumptions, not a documented tranche. Public contracts, existing donors and fixed staff capacity may replace or limit additional delivery. A larger gift is fully costed even when output is capped. Neither historical cash nor annual contribution totals establish room for more funding. A designated workstream, executable budget and unique additional outcomes would be required to identify a marginal offer.

## Qualitative assessment

GLIDE's practical service access and partnerships are reasons to investigate, particularly for people facing several barriers at once. Its disclosures allow some scrutiny of financial and operational boundaries. That is different from evidence that the next unrestricted dollar produces the modeled portfolio.

The strongest disconfirmation is that another gift mostly replaces existing support, while outcomes remain unchanged. Other material risks include incomplete treatment retention, household assistance that does not free resources, duplicate recipients, poor transfer of clinical evidence and unmodeled public or owner costs. The named pathways are not a comprehensive valuation of community, policy or institutional benefits; their unquantified value is not proven absent.

## Revision record and model appendix

The previous clinical center was approximately $4.89M per better life in the Bay Area. The current reference changes donor additionality, rescue-risk reduction and extrapolation horizon; preserves full negative clinical burdens; and adds signed cash-state welfare with overlap. The resulting deterioration is not evidence that GLIDE became less effective. It reflects changed modeling judgments and scope. Neither the old nor new number should be treated as measured precision.

Complete old report results, twenty original worlds, five diagnostics and the separate historical list-adapter worlds are frozen. Current unweighted scenarios include weak and favorable delivery, zero gift/funding/capacity, unknown routes, adverse clinical and cash effects, full positive overlap, local-credit exclusions, shared households, finite durations, reporting units, double costs and gross-only resources. They are not confidence intervals or a probability distribution. No weighted expectation or verified funding offer is supplied. Financial and source details remain below, and actual research intervals are separate from integration, testing and publication.
`;
