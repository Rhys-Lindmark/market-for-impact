# Compass Family Services: health and income calibration proposal

October 1, 2026. **Recommend retaining the conditional central $1,347,730.81 donor-program cost per 10 combined welfare years, with an explicit cash-first overlap ledger.** This recommendation follows broad housing-utility overlap, not a target to preserve or improve the price. Per historical modeled family, allocate .0403587505191333 income-equivalent years and .0316412494808667 residual noncash welfare/health-proxy years; total .072. Neither component is measured Compass clinical QALYs or measured local income. Root owns independent arithmetic acceptance, implementation and publication. This proposal changes no product, research counts or funding-ready designation.

## Boundary and reconstruction

Reuse frozen `compass-c-rent-cea-v1.json`, `compass-c-rent-qaly-bridge-audit-v1.json`, review and funding audit. FY2025 audited C-Rent expense $2,008,658 / 207 reported prevention-classified families = C=$9,703.661835748791. Housing assistance $1,095,985 /207 = T=$5,294.613526570049; other C-Rent program expense $4,409.048309178743. The 207 are a reported classification, not a reconciled unique C-Rent recipient cohort or a causal success count. Central is one historical-equivalent assistance case, not a priced new award. Do not claim whole Compass effectiveness from this denominator.

The existing native six-month offer-effect .02 gives $485,183.0917874396 per incremental recorded-homelessness episode avoided. It is a separate judgment diagnostic, not a further multiplier on the participant-level welfare bridge. Prior bridge H=.144*.5=.072 and C*10/H=$1,347,730.8105206655. Preserve original native/bridge data as historical records; use a separately versioned current wrapper for ranking and public calculations.

## Decisive primary evidence

[Phillips/Sullivan primary Santa Clara working paper](https://sites.nd.edu/james-sullivan/files/2023/04/SCC_homelessness_prevention-8-1.pdf), especially appendix A.6 pp30–31 and table A.5 p38, supports both a housing effect and direct tenant resources. Its pre-pandemic randomization reduced six-month recorded homeless-service use 3.8pp from 4.1%; pandemic results were null amid substitutes/moratoria. The marginal sample excluded applicants expected to obtain other prevention aid. Assigned-treatment payments were not universal: assistance differences and receipt differ. Authors value landlord-paid assistance as housing consumption when otherwise unpaid, or freed resources when inframarginal; their direct-benefit valuation is an economic appraisal, not measured income. They do not establish Compass's cash incidence or local wages. Do not import their $1,898 payment into Compass's audit, multiply actual payments by prevention probability, or convert their public savings into household income. RCT household composition and selection differ from SF families with minors.

[Nelson et al 2024 primary VA evaluation](https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2825636) models a two-year prevention increment .144 QALYs and 90.7 stable-housing days, with year-two outcomes already discounted 3%. This is a Markov economic evaluation using observational transitions/mortality, not a local trial measuring generic clinical utility. It values stable housing at 1 and unstable housing .434 using [Rajan/Tsai 2021 standard-gamble housing-state valuation](https://pubmed.ncbi.nlm.nih.gov/34629422/). The latter surveyed 6,607 lower/middle-income adults and found financial-distress experience associated with valuation. The full Rajan question/instrument was not obtained: no claim about exact domains. Retaining the existing .5 VA-to-family transfer is a declared transport prior, not newly validated causality. The envelope can include economic/housing wellbeing; it cannot safely be added to full rent consumption without an overlap rule. No second clinical discount, retention multiplier, mental-health bonus or native .02 multiplier is justified.

## Cash-first and residual noncash ledger

Apply [Coefficient Giving's current reference framework](https://coefficientgiving.org/research/cost-effectiveness/) consistent with `income-health-equivalence.mjs`: reference income $50,000 / healthy-year value $CG100,000 = .5 times log income/resource ratio. This is welfare equivalence, not clinical QALYs. **Y=$50,000 household annual resources is a reference judgment, not Compass's measured distribution.** Count one household per assistance case, with no child, caregiver or landlord multiplier.

Eligibility precedes valuation: the modeled household receives an additional eligible SF C-Rent award; no parallel aid would pay the identical obligation and no automatic rent/benefit offset removes the modeled net resource gain. Tenant net share p=.8 centrally: credit 80% of audited housing assistance, $4,235.690821256039, as housing consumption/debt relief/freed disposable resources. This 20% haircut is a transparent incidence/offset prior for landlord recovery that would occur anyway, substitution of resources, benefit withdrawal and incomplete tenant capture; none of these local fractions is measured. The source paper permits 100% credit under constrained-tenant assumptions; our .8 is deliberately not imported as an empirical result. Do not value overdue rent both as avoided debt and as consumption, or count the landlord's receipt separately. Consumer debt-payment benefit depends on enforceable counterfactual obligation and relief; a payment recovering otherwise uncollectible landlord debt can yield less tenant gain.

Receipt schedule: one transfer at t=.25 years, discounted at r=.03; credit its resource value once over one annual consumption-equivalent accounting window. There is no recurring annual T, asset annuity, saved lifetime rent, catch-up benefit, or extrapolated wage income. Earnings central is explicitly zero (unknown net sign): no quantified local causal estimate justifies more. Benefits/taxes/work costs belong in net earnings if later estimated. No separate mental-health/financial-distress credit.

Overlap center b=1: presume attributed cash value is included in the transported broad housing-welfare envelope, allocate it to income first, and retain the remainder as **noncash welfare/health proxy**, never empirically separated health. This is a conservative allocation judgment; b=.5 and b=0 diagnose partial/no overlap. If cash exceeds H, preserve the cash surplus: total=max(H,I) when b=1, not H by fiat and not a cap on income. The original health label must change because this instrument is broad. If a product cannot label residual honestly, show the envelope and its cash-first allocation in prose rather than calling residual clinical netQalys.

## Exact implementable equations

For donor budget D, historical-equivalent cases F=D/C; completion q=1 centrally is conditional realized-award scope, not measured marginal application completion. Funding additionality a=1 centrally means truly additional awards, separately from clinical transport; geography gSF=gBay=1 applies only to this specified SF award route. Portfolio allocation v=1 standalone; the same rent obligation and family outcome must be assigned once across Compass/Hamilton/GLIDE/SF ERAP or other payers. Count no duplicate receipt within a household.

```text
H = .144 * health_transport_share                 # .5 central; integrated two-year envelope
I = .5 * log1p(p*T/Y) / (1+r)^receipt_delay        # positive one-off household resource credit
R = max(0, H - overlap_share*I)                   # residual noncash welfare/health proxy
J = .5 * log1p(-burden_USD/Y) / (1+r)^burden_delay # independently signed one-off burden
health_proxy_years = F*g*v*a*q*R
net_income_equivalent_years = F*g*v*(a*q*I + burden_exposure_share*J)
combined_years = health_proxy_years + net_income_equivalent_years
donor_cost_per_10 = D*10/combined_years if combined_years>0; otherwise null
```

Central burden=0, burden exposure=1, burden delay=.25 are unresolved net judgments, not evidence of no application burden. Harms are never overlap-discounted, clinical-transfer-discounted or erased by a=0; actual exposure must be specified. Do not add recipient costs to donor cash budget. Funding/completion/geography/portfolio zero must zero positive benefit streams. A purely nonadditive transfer replacement a=0 gives no additional tenant income or housing benefit. q=0 with no recipient exposure likewise gives zero. Health transfer does not attenuate cash incidence; completion is not multiplied a second time onto observed historical paid recipients.

If later earnings data support a signed annual stream, use `.5*earnings_eligible_share*sum_years[(1+r)^-(income_delay+i)]*log1p(net_annual_fraction)`, with fractional final-year weighting and explicitly justified duration. Do not reuse housing-envelope years, cash receipt timing or VA transfer automatically. No such stream is credited here.

## Deterministic cases per modeled family

These are judgment sensitivities, not confidence intervals or probabilities.

| Case | C | H | a | p | Y | b | Burden | Residual proxy | Net income-equivalent | Combined | Cost/10 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Central full overlap |9703.661836|.072|1|.8|50000|1|0|.031641249481|.040358750519|.072|1347730.810521|
| Half overlap only |9703.661836|.072|1|.8|50000|.5|0|.051820624740|.040358750519|.092179375260|1052693.382703|
| No overlap only |9703.661836|.072|1|.8|50000|0|0|.072|.040358750519|.112358750519|863632.052770|
| Cash only; reject VA envelope |9703.661836|0|1|.8|50000|1|0|0|.040358750519|.040358750519|2404351.401104|
| Cautious joint stress |11468.369357|.0144|.5|.5|75000|1|100|0|.007946139195|.007946139195|14432630.835595|
| Optimistic joint stress |9703.661836|.144|1|1|25000|.5|0|.096330046357|.095339907286|.191669953643|506269.326585|
| Full funding replacement |9703.661836|.072|0|.8|50000|1|0|0|0|0|null|
| Replacement plus recipient loss |9703.661836|.072|0|.8|50000|1|250|0|-.002487818583|-.002487818583|null: net harm|

Central $100,000 gives .7419879342327066 combined years: .4159125823042346 income-equivalent plus .326075351928472 noncash proxy. Cautious $100 burden is an unreimbursed process/work-cost judgment; replacement-harm $250 is a signed stress, not reported harm. Under cautious H=.0144<I=.017216678234913085, the cash surplus survives full overlap. An isolated .5 funding additionality with all central assumptions doubles price to $2,695,461.621041331. Isolated shared-support loading raises price to $1,592,829.0774053868.

## Fiscal scope, status, room and geography

[Compass's annual-report index](https://www.compass-sf.org/annual-report) currently lists FY2025 as latest completed reporting year and links original FY2025, FY2024, FY2023 audits/990s. Latest reports and current [eviction-prevention access](https://www.compass-sf.org/eviction-prevention) support ongoing operations as of October 1, 2026; they do not establish an unfunded marginal tranche. Public online application requires SF residence and custody of a minor; out-of-SF existing clients use a distinct route. Therefore g=1 is conditional SF award geography, not whole-organization SF fraction or evidence all FY2025 C-Rent recipients are SF residents.

| Fiscal year ended June30 | Consolidated GAAP revenue | Consolidated expense | C-Rent program expense | Original legal-entity 990 revenue | 990 expense |
|---|---:|---:|---:|---:|---:|
|2025|44768525|45173238|2008658|43913744|44554916|
|2024|31013775|30660547|1258441|30336757|30381751|
|2023|24261640|23137645|1258722|23357823|22492934|

FY2023 990 values are verified in FY2024 original 990's comparative column; FY2023 original is scanned and not text-extracted here. FY2025 990 is labeled tax-year2024 but covers July1,2024–June30,2025, signed May14,2026. GAAP consolidated Compass/QALICB and tax-return entity/accounting boundaries differ; do not blend them or imply identical totals. FY2025 consolidated net assets $29,623,373 and liabilities $10,835,237 include noncash/restricted/building effects. C-Rent restricted net assets $1,185,965 versus FY2024 $510,710 demonstrate material preexisting resources, not cash on hand, uncommitted funds, remaining room or an annual shortfall. Do not subtract them from an invented requirement.

The program-only C includes delivery salaries/benefits and other C-Rent expenses but excludes separately recorded shared management/general/fundraising. An explicit average loading uses support $6,951,080 / program $38,222,158: `C_loaded=C*(1+6951080/38222158)=$11,468.369357318785`. This allocates shared support proportionally; it is not a marginal cost estimate or a whole-organization expense divided by207. Keep it a sourced sensitivity until Compass supplies actual restricted-award cost/capacity terms. Preserve central program-cost scope with a conspicuous exclusion, rather than silently inventing overhead marginality.

[April2,2026 HSH Director report](https://media.api.sf.gov/documents/Agenda_Item_8_Directors_Report_Eks6IVF.pdf), slide15, describes February23 SF ERAP eligibility changes intended to increase spending, including returning-applicant risk10→8 and income30→50%AMI. Processing/eligibility and alternative public funds may bind before private cash. The inherited funding audit's contract1000022894 lifetime fields and May2026 reapplication statistic are contextual, not freshly verified current remaining balances or causal failures. No quantified funding room is proposed; ordinary unrestricted Compass donations cannot automatically inherit the conditional a=1 model. No outreach occurred.

## Acceptance risks and finite handoff

Accept the conditional allocation model only with all labels and scope warnings. Reject interpretations that (1) residual is measured clinical health, (2) 80% incidence/full overlap are observations, (3)207 is reconciled C-Rent marginal completions, (4) donor cash demonstrably binds, (5) recurring income or child multipliers are justified, or (6) this is a verified current offer. Full-overlap central is defensible conservative bookkeeping but could over-remove independent health; partial/no-overlap cases expose it. Conversely no-overlap can materially inflate benefits because the original SG measures broad housing wellbeing. The VA transport prior remains weak enough that cash-only is consequential. The reference-household logarithm applied to an average transfer omits distributional heterogeneity/Jensen effects; eligibility income cap does not identify Y. Sponsor/public/landlord resources cannot become a second donor or household ledger credit.

Needed evidence: unique FY2025 C-Rent cases and award distributions; actual household resources/counterfactual payment obligations, public-aid substitution and offsets; SF residence; award/application funnel and processing bottlenecks; current restricted ledger and commitments; a written incremental tranche with program/shared-support cost boundary; noncash health measurement or instrument domains that permit stronger separation. Root should recompute equations, test full-overlap cash surplus, positive-benefit zeroes, signed burden, annual/receipt timing separation and portfolio assignment, then update current review/model/ranking only in its authorized phase. Preserve historical bridges and time records separately. This source phase is closed; no implementation/publishing or global count update is claimed.

## Actual effort and bounded resources

Dedicated helper interval eae8d6ec-3b61-4df7-844c-a29813d1ebf1: **18:56:30.924–19:06:35.395 UTC, 604.471 seconds (10.0745 focused minutes)**. Ended before integration/waiting; shorter than approximate15-minute target because decisive evidence and handoff were ready, without padding. GPT-6.1 Sol identity is user-confirmed/inherited without override, not independent runtime metadata. Closed provenance `/private/tmp/compass-calibration-20261001.closed.json`; parent source challenge records its distinct interval, with no duplication. Space Saver/Token Saver reused checkout/dependencies and extracted original PDFs in memory; no installs, servers, copied repos, product edits or retained bulk downloads. Compact source receipts accompany this proposal.
