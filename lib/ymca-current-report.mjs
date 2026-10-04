import {version,calculate} from './ymca-current-calibrated-model.mjs';
export const modelVersion=version;
export const currentResult=calculate();
export const summary={
 intro:'YMCA of Greater San Francisco provides fitness, mental-health care, family support and youth programs across the Bay Area. Its services also include diabetes prevention, swimming and camps. Community sites and public partnerships connect these programs to children, adults and families.',
 reasons:['Supported exercise and diabetes-prevention courses offer concrete health pathways with relevant trial evidence.','Family support and childcare can improve access to services and potentially relieve household costs or support paid work.','The established local network offers multiple ways to reach people whose circumstances make participation difficult.'],
 reservations:['The next donation’s allocation, additional capacity and fully supported course costs are not measured.','Generic therapy, family-support and earnings benefits need stronger local causal evidence; trial effects cannot simply be assigned to all members.','Cross-program overlap, participant burdens and external resource costs can materially change the comparison.'],
 cost:'Our partial, conditional estimate is about $12.88M per better life in the Bay Area, or $19.82M for San Francisco residents. A better life means ten combined modeled health and income-equivalent years. We model a supported exercise-referral course at $600 and a diabetes-prevention course at $600, not a membership or guaranteed donation purchase. Finite exercise and diabetes-prevention benefits drive this assessed subtotal; net income effects are examined in signed scenarios rather than assumed as a central gain. These are research allowances, not provider quotes or a complete portfolio expected value.'
};
export const markdown=`## Summary
The summary describes the current assessed-channel comparison and its main reservations.

## What they do
YMCA of Greater San Francisco operates fitness, mental-health, family-resource, youth, aquatics and camp programs. The legal entity is Young Men's Christian Association of San Francisco, EIN 94-0997140. Program availability, eligibility and fees vary by site and funding arrangement.

The diabetes-prevention program serves eligible adults and does not require YMCA membership. Family-resource centers offer community support, and mental-health services include publicly supported and sliding-fee pathways. Before- and after-school care can accept subsidies; an existing subsidy does not establish savings or additional services caused by a donation.

## Monitoring and information sharing
Original annual returns and an accessible audit establish organizational scale. Current program descriptions establish operating pathways, not additional participants funded by the next donation, their residence or causal improvements in wellbeing.

A useful marginal funding assessment would identify unique participants and households, supported-course costs, alternative care, attendance, net fees, subsidies, travel, caregiving and actual take-home pay. It would distinguish new access from relief of costs for existing users and reconcile people using multiple programs.

## Clinical evidence and native outcomes
The Welsh National Exercise Referral Scheme economic evaluation reported a 0.027-QALY increment integrated over months six to twelve. Its economic sample was 798 participants, about 55% of the trial sample, with higher adherence than the full trial. That is not a generic YMCA membership effect or an annual utility that can be repeated for five years.

We use 20% of that increment as a judgmental transfer allowance for one supported exercise course, discounting at the observed interval's 0.75-year midpoint. Immediate donor activation is an assumption; longer activation delays are tested separately. The integrated increment is counted once, not integrated again.

The RAPID YMCA diabetes-prevention trial randomized 509 adults and found a 2.3-kg intention-to-treat weight difference at twelve months. Any attendance and higher attendance were incomplete. This study does not directly measure local diabetes incidence or QALYs; we do not multiply its intention-to-treat effect by attendance again.

Our diabetes bridge instead assumes 8% baseline risk, 30% relative reduction and a 0.05 quality-of-life loss avoided for two years beginning in year three. These are finite research assumptions, not RAPID findings. Generic mental-health, family, swimming and camp utility gains are excluded from the reference because the relevant marginal local effects are unidentified; exclusions are not evidence of no benefit.

## What do you get for your dollar?
Donations can support staff, course delivery, shared facilities and participation assistance. The model retains all seven allocation rows and the entire donor-cost numerator, including programs without an identified central welfare credit.

| Assumed allocation | Share | Supported native-unit cost allowance |
| --- | --- | --- |
| Exercise referral | 20% | $600 per course |
| Mental health | 25% | $1,500 per finite individual course/year allowance |
| Family support | 20% | $500 per unique-household episode |
| Diabetes prevention | 5% | $600 per adult course |
| Youth/childcare | 15% | $1,500 per child school-year allowance |
| Swimming | 5% | $250 per participant lesson course |
| Camps and other | 10% | $1,000 per participant-season allowance |

These allocations and fully supported costs are hypotheses, not financial-statement program splits or marginal provider prices. The camps/other allowance does not identify returns on capital expenditure. Financial additionality is assumed to be 40%, with zero-delivery and smaller-tranche controls.

| Reference result | Bay Area, including SF | San Francisco |
| --- | --- | --- |
| Clinical healthy years per appendix normalization | 0.077636 | 0.050463 |
| Net income-equivalent years in the reference | 0, unidentified channels excluded | 0, unidentified channels excluded |
| Dollars per better life | $12.88M | $19.82M |

The San Francisco share is assumed to be 65% for most routes; family support is assigned to SF in the reference. Residence is not independently verified for marginal participants. SF is contained within the Bay Area and must not be added to it. This is a partial assessed-channel estimate, not a complete unrestricted-donation expected value or a proven lower bound: omitted harms as well as omitted benefits can matter.

## Health and net household resources
Health and signed household resources are assessed separately. Money rows include avoided purchases, actual take-home pay, net transfers and out-of-pocket medical savings, less fees, travel, care, lost pay and displaced resources. We net these rows within the same household before applying the documented Coefficient Giving-inspired logarithmic income/consumption mapping, using a hypothetical $50,000 household baseline and finite one- or two-year exposure.

Income-equivalent healthy years are a normative comparison, not clinical QALYs. We do not convert all wages, insurer savings, program revenue or lifetime GDP into household gains. Childcare expenditure saved and additional paid work require distinct counterfactuals; one is not automatically credited alongside the other.

Scenarios examine food/access savings, childcare substitution, realized take-home pay, net transfers, medical out-of-pocket savings and participation costs. Current swimming prices show a retail difference, not donation-caused fee relief. A separate fee-relief scenario can help existing users without new clinical access; its resource additionality is separate from clinical additionality.

Positive overlap adjustments apply to positive credits only. Negative fees, burdens and clinical harms remain full. Equal gains and costs for one household cancel exactly. Multiple active cash routes require explicit disjoint-household hypotheses; unsupported overlapping routes are rejected rather than separately logged as if they involved different families.

Multiple positive clinical credits also require explicit distinct-increment hypotheses. The reference treats the finite exercise increment and delayed diabetes increment as distinct in time; this is unverified, not observed independence. Added therapy, family or swimming scenarios declare their extra distinct increments explicitly, even where harms cancel a positive credit. Negative effects cannot be hidden by an overlap factor or a canceled net total.

## Qualitative assessment
The program network offers credible mechanisms for improving health, family access and practical participation. Supported courses and family services are more informative native outcomes than undifferentiated membership counts. Public funding and existing delivery infrastructure may help, but do not prove unrestricted donations expand the most effective services.

The main research limitation is the bridge from an additional donation to unique useful services and net welfare. External exercise evidence and a diabetes trial inform scrutiny, not local empirical identification. The current model has passed independent source, arithmetic and incidence challenge as a conditional sensitivity; those checks do not validate its allocation, transfer or capacity assumptions.

## Funding and previous grants
The audit records substantial public funding and participant-fee revenue. Neither an established government partnership nor net assets establishes an available match, additional cash headroom or a binding marginal funding offer. The ordinary reference assumes no new public match.

Full associated resource costs are unknown, including school, government, provider and capital inputs. The model exposes a donor-plus-specified-resource cost floor separately from a complete gross total. Complete gross resource cost, ordinary-donation expected value and weighted expected value remain unidentified rather than assigning fabricated scenario probabilities.

## Spending breakdown and financial appendix
The original returns cover fiscal years ending June 30; filing tax-year labels should not be confused with fiscal end dates.

| Fiscal year | Revenue | Total expenses | Program expenses |
| --- | --- | --- | --- |
| 2023 | $107,067,527 | $105,626,717 | $92,722,217 |
| 2024 | $119,199,010 | $111,892,141 | $99,892,274 |
| 2025 | $121,580,211 | $117,081,068 | $104,248,328 |

The three-original-return mean expense is $111,533,309. FY2024's comparative FY2023 revenue and expenses each exceed the original by $553,028, leaving the same $1,440,810 surplus. The reason is unresolved; we do not assert a verified reclassification or economic growth from that discrepancy.

The FY2025 audit reports operating revenue of $120,251,623 and expenses of $117,874,257, while program expenses match the return at $104,248,328. Its government fees/grants, dues, child/youth fees and camp fees are distinct revenue streams. GAAP and IRS totals are not interchangeable marginal-cost denominators, and annual expense divided by activities is not a donation quote.

## Revision record and model appendix
The previous portfolio comparison was $6,177,370 per better life in the Bay Area and $9,503,647 for San Francisco. The current partial conditional values are $12,880,639 and $19,816,367. The change removes unsupported generic therapy and family utility credits from the reference and constrains exercise to one discounted observed interval, while explicitly testing finite signed household resources. It is not a uniform pessimism multiplier or a desired numerical change.

All seven original portfolio worlds and original source hashes remain preserved in the model API. The earlier diabetes-only $2,095,452 diagnostic is a different intervention boundary, preserved separately; it is not the portfolio comparison or the new estimate.

The $100,000 appendix amount is solely an arithmetic normalization, not a specific gift recommendation or verified absorption commitment. The model supports smaller amounts under the same assumptions, not extrapolation to arbitrary large gifts. All 27 current cases are finite conditional sensitivities, not confidence intervals, empirically weighted scenarios or a complete expected value.
`;
const source=(title,url,publisher,limit)=>({title,url,publisher,published:'See original document',retrieved:'2026-10-04',limit});
export const sources=[
 source('FY2023 original Form 990','https://projects.propublica.org/nonprofits/full_text/202441279349303249/IRS990','IRS / ProPublica','Original fiscal figures; comparative restatement unresolved.'),
 source('FY2024 original Form 990','https://projects.propublica.org/nonprofits/full_text/202531149349301013/IRS990','IRS / ProPublica','Annual legal-entity finances, not marginal course costs.'),
 source('FY2025 original Form 990','https://projects.propublica.org/nonprofits/full_text/202640789349301234/IRS990','IRS / ProPublica','Fiscal year ends June 30.'),
 source('FY2025 audited financial statements','https://media.ymcasf.org/wp-content/uploads/2025/11/12144641/Young-Mens-Christian-Association-of-San-Francisco-2025-Audit-FS-Final.pdf','YMCA / independent auditor','GAAP totals differ from the original return.'),
 source('National Exercise Referral Scheme economic evaluation','https://eprints.gla.ac.uk/89420/1/89420.pdf','Primary research','Integrated months-six-to-twelve QALY increment; selected economic sample and external transfer limits.'),
 source('RAPID YMCA diabetes-prevention randomized trial','https://pubmed.ncbi.nlm.nih.gov/26378828/','Primary research / PubMed','Intention-to-treat weight effect, not measured local QALYs or diabetes prevention.'),
 source('Diabetes prevention','https://www.ymcasf.org/program/diabetes-prevention/','YMCA','Eligibility and delivery; marginal costs/capacity unidentified.'),
 source('Mental-health services','https://www.ymcasf.org/location/mental-health-services-ymca/','YMCA','Free and sliding-fee arrangements vary.'),
 source('Family-resource centers','https://www.ymcasf.org/program/family-resource-centers/','YMCA','Services do not identify causal income or utility increments.'),
 source('Before- and after-school programs','https://www.ymcasf.org/program/before-afterschool-programs/','YMCA','Vouchers and fees are not verified donor-caused savings.'),
 source('Group swim lessons','https://www.ymcasf.org/program/group-swim-lesson/','YMCA','Retail prices are not fully supported course costs.'),
 source('Camps','https://www.ymcasf.org/program/camps/','YMCA','Capital and other-program marginal outcomes unresolved.'),
 source('Giving','https://www.ymcasf.org/donate/','YMCA','Ordinary giving route, not a priced marginal offer.'),
 source('Cost-effectiveness framework','https://coefficientgiving.org/research/cost-effectiveness/','Coefficient Giving','Normative framework, not validation of YMCA assumptions.')
];
export const contentsMapping={'summary':'summary','what-they-do':'what','monitoring-and-information-sharing':'monitoring','clinical-evidence-and-native-outcomes':'monitoring','what-do-you-get-for-your-dollar':'cost','health-and-net-household-resources':'cost','qualitative-assessment':'qualitative','funding-and-previous-grants':'funding','spending-breakdown-and-financial-appendix':'funding','revision-record-and-model-appendix':'funding'};
