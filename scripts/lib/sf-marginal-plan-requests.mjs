const REQUEST_STATUS = 'draft-not-sent';
const GIFT_SCENARIOS = [100000, 1000000, 10000000];

const formatMoney = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(amount);

const findCandidate = (diligence, grantEvaluation, key) => {
  const candidate = diligence.candidates.find((item) => item.key === key);
  if (!candidate?.evidenceDossier) throw new Error(`Accepted ${key} evidence dossier is missing.`);
  const protocolCandidate = grantEvaluation.candidates.find((item) => item.candidateKey === key);
  if (!protocolCandidate) throw new Error(`${key} is missing from the grant-evaluation protocol.`);
  return { candidate, protocolCandidate };
};

const makeQuestions = ({ fields, contexts }) => fields.map((field) => {
  const context = contexts[field.key];
  if (!context) throw new Error(`Missing public context for ${field.key}.`);
  return {
    key: field.key,
    label: field.label,
    question: field.question,
    publicContext: context.copy,
    publicContextSourceKeys: context.sourceKeys,
    publicContextState: 'accepted-public-context',
    organizationResponseState: 'not-submitted',
    organizationResponse: null,
    mfiModelState: 'not-started',
    mfiModel: null,
  };
});

const makeScenarios = ({ protocolCandidate, questions, subject }) => protocolCandidate.scenarios.map((scenario) => ({
  amountUsd: scenario.amountUsd,
  state: 'not-submitted',
  organizationResponse: null,
  mfiModel: null,
  requestedDecision: `Identify the strongest specific use of an incremental ${formatMoney(scenario.amountUsd)} gift over a dated period, or state that ${subject} cannot productively absorb it.`,
  requiredQuestionKeys: questions.map((question) => question.key),
}));

const makeProvenanceLegend = (candidateName) => [
  { key: 'public-context', label: 'Accepted public context', meaning: 'A cited fact that frames the question but does not answer the marginal case.' },
  { key: 'organization-response', label: 'Organization response', meaning: `A dated answer and supporting materials supplied or confirmed by ${candidateName}. None has been received.` },
  { key: 'mfi-model', label: 'MFI model', meaning: 'An independently reviewed forecast or translation built only after the response. None has been started.' },
];

const buildHamiltonPacket = ({ grantEvaluation, diligence, cityContracts }) => {
  const { candidate, protocolCandidate } = findCandidate(diligence, grantEvaluation, 'hamilton-families');
  const annual = candidate.evidenceDossier.organizationReported;
  const sources = [
    { key: 'hamilton-annual-report-2025', publisher: annual.source.publisher, title: annual.source.title, url: annual.source.url, publishedAt: annual.source.publishedAt, retrievedAt: annual.source.retrievedAt },
    { key: 'hamilton-quarterly-2026-q4', ...candidate.sources.find((source) => source.title === 'Quarterly Report (April–June 2026)') },
    { key: 'hamilton-financials', ...candidate.sources.find((source) => source.title === 'Financials') },
    { key: 'hamilton-housing-services', publisher: 'Hamilton Families', title: 'Housing Services', url: 'https://hamiltonfamilies.org/housing-services', publishedAt: null, retrievedAt: '2026-08-30' },
    { key: 'datasf-supplier-contracts', publisher: cityContracts.publisher, title: cityContracts.title, url: cityContracts.publicUrl, publishedAt: cityContracts.sourceUpdatedAt, retrievedAt: cityContracts.retrievedAt },
  ];
  const publicFacts = [
    { key: 'entity', label: 'Entity and donation vehicle', display: `${candidate.name} · ${candidate.taxStatus} · EIN ${candidate.ein}`, boundary: 'This identifies the organization, not the program, restricted fund, or geography that would receive a proposed gift.', sourceKeys: ['hamilton-financials'] },
    { key: 'program-scope', label: 'Published program scope', display: 'Homelessness prevention, family shelter, transitional housing, rapid rehousing, housing subsidies, and case management', boundary: 'Hamilton must identify one named program, target population, and geography for each gift scenario; this public list is not a marginal plan.', sourceKeys: ['hamilton-annual-report-2025', 'hamilton-housing-services'] },
    { key: 'latest-signals', label: 'Latest accepted reporting window', display: '338 families served · 34 program exits to stable housing · 19 families received eviction-prevention assistance · $660,709 in housing subsidies', boundary: 'April–June 2026 organization-reported outputs and outcomes; no common follow-up window, counterfactual, or donor attribution is published.', sourceKeys: ['hamilton-quarterly-2026-q4'] },
    { key: 'organization-finances', label: 'Organization-wide FY2025 context', display: `${formatMoney(annual.financials.revenueUsd)} revenue · ${formatMoney(annual.financials.expensesUsd)} expenses · ${formatMoney(annual.financials.governmentRevenueUsd)} government revenue`, boundary: 'Audited organization-wide totals do not reveal a program budget, unrestricted cash, reserves, expected revenue, or a time-bounded funding gap.', sourceKeys: ['hamilton-annual-report-2025', 'hamilton-financials'] },
    { key: 'public-funding', label: 'San Francisco contract context', display: `${candidate.publicFunding.contractCount} exact prime-contractor matches · ${formatMoney(candidate.publicFunding.awardUsd)} contract authority · ${formatMoney(candidate.publicFunding.paymentsMadeUsd)} paid`, boundary: 'Life-to-date city contract accounting is not annual revenue, philanthropic funding room, program cost, or evidence that a private gift is additional.', sourceKeys: ['datasf-supplier-contracts'] },
  ];
  const questions = makeQuestions({
    fields: grantEvaluation.marginalPlan.requiredFields,
    contexts: {
      programIdentity: { copy: 'Hamilton Families and its EIN are verified; the receiving program, restricted fund, population, and San Francisco geography are not selected.', sourceKeys: ['hamilton-financials'] },
      timeBoundedBudget: { copy: 'Organization-wide FY2025 revenue, expenses, and government funding are public. A program-period budget and unfunded amount are not.', sourceKeys: ['hamilton-annual-report-2025', 'hamilton-financials'] },
      incrementalActivities: { copy: 'Published services describe current work, but no source says what an incremental gift at any requested size would add.', sourceKeys: ['hamilton-housing-services'] },
      capacityConstraints: { copy: 'The quarterly report describes 46 new landlord partnerships. Available units, staffing, referral flow, caseload, and other binding constraints are not published.', sourceKeys: ['hamilton-quarterly-2026-q4'] },
      fundingDisplacement: { copy: 'Government revenue and eight matched city contracts make displacement material, but no scenario-specific reconciliation is public.', sourceKeys: ['hamilton-annual-report-2025', 'datasf-supplier-contracts'] },
      outcomeForecast: { copy: 'Hamilton reports stable-housing exits and eviction-prevention assistance without a common durability window, comparison rate, expected incremental outcome, or uncertainty range.', sourceKeys: ['hamilton-quarterly-2026-q4'] },
      costAndAttribution: { copy: 'Housing subsidies are reported, but program cash cost, cost per sustained outcome, contribution share, and donor attribution are not.', sourceKeys: ['hamilton-quarterly-2026-q4'] },
      milestones: { copy: 'No accepted source pre-registers 6-, 12-, 24-, or 36-month milestones or continuation, revision, and exit rules for a new gift.', sourceKeys: ['hamilton-annual-report-2025'] },
    },
  });
  return {
    packetKey: 'hamilton-families-marginal-plan-v0.1', sectionId: 'hamilton-plan-request', candidateKey: candidate.key, candidateName: candidate.name, responseLabel: 'Hamilton response',
    headline: 'What could Hamilton Families do with the next gift?', status: REQUEST_STATUS, statusLabel: 'Draft · not sent', responseReceivedAt: null, forecastLockedAt: null,
    recommendationState: 'insufficient-evidence', purpose: 'Turn organization-level public reporting into three program-specific, time-bounded funding cases without treating public context as an organization response or an MFI impact estimate.',
    decisionBoundary: 'This packet is a research request, not a funding recommendation, commitment, organization endorsement, submitted response, or estimate of room for more funding.',
    provenanceLegend: makeProvenanceLegend(candidate.name), publicFacts, scenarios: makeScenarios({ protocolCandidate, questions, subject: 'Hamilton' }), questions, sources,
  };
};

const buildFoodBankPacket = ({ grantEvaluation, diligence, cityContracts }) => {
  const { candidate, protocolCandidate } = findCandidate(diligence, grantEvaluation, 'sf-marin-food-bank');
  const annual = candidate.evidenceDossier.organizationReported;
  const sources = [
    { key: 'food-bank-annual-report-2025', publisher: annual.source.publisher, title: annual.source.title, url: annual.source.url, publishedAt: annual.source.publishedAt, retrievedAt: annual.source.retrievedAt },
    { key: 'food-bank-financials', ...candidate.sources.find((source) => source.title === 'Financial statements archive') },
    { key: 'food-bank-services', publisher: candidate.name, title: 'Our Services', url: 'https://www.sfmfoodbank.org/services/', publishedAt: null, retrievedAt: '2026-08-30' },
    { key: 'food-bank-community-markets', publisher: candidate.name, title: 'Community Markets', url: 'https://www.sfmfoodbank.org/programs/community-markets/', publishedAt: null, retrievedAt: '2026-08-30' },
    { key: 'food-bank-home-delivery', publisher: candidate.name, title: 'Home-Delivered Groceries', url: 'https://www.sfmfoodbank.org/programs/home-delivered-groceries-seniors/', publishedAt: null, retrievedAt: '2026-08-30' },
    { key: 'food-bank-home-delivery-application', publisher: candidate.name, title: 'Home-Delivered Groceries Application', url: 'https://panda.sfmfoodbank.org/homedelivery/en', publishedAt: null, retrievedAt: '2026-08-30' },
    { key: 'datasf-supplier-contracts', publisher: cityContracts.publisher, title: cityContracts.title, url: cityContracts.publicUrl, publishedAt: cityContracts.sourceUpdatedAt, retrievedAt: cityContracts.retrievedAt },
  ];
  const publicFacts = [
    { key: 'entity', label: 'Entity and donation vehicle', display: `${candidate.name} · ${candidate.taxStatus} · EIN ${candidate.ein}`, boundary: 'This identifies the organization, not the program, partner, restricted fund, or county that would receive a proposed gift.', sourceKeys: ['food-bank-financials'] },
    { key: 'program-scope', label: 'Published program scope', display: 'Neighborhood pantries, Community Markets, home-delivered groceries, CalFresh enrollment, partner distribution, and advocacy', boundary: 'The Food Bank must identify one named program, target population, county, and delivery model for each gift scenario; this public list is not a marginal plan.', sourceKeys: ['food-bank-services', 'food-bank-community-markets', 'food-bank-home-delivery'] },
    { key: 'latest-signals', label: 'Latest accepted reporting window', display: '44,000 households served weekly · nearly 56M meals-equivalent shared · 1,200 Community Market participants · $16.5M in CalFresh benefits secured', boundary: 'FY2025 organization-reported outputs and administrative outcomes across two counties; no unique annual denominator, common follow-up, counterfactual, or donor attribution is published.', sourceKeys: ['food-bank-annual-report-2025'] },
    { key: 'organization-finances', label: 'Organization-wide FY2025 context', display: `${formatMoney(annual.financials.revenueUsd)} revenue, including ${formatMoney(annual.financials.donatedFoodAndInKindRevenueUsd)} donated food/in-kind · ${formatMoney(annual.financials.privateRevenueUsd)} private revenue`, boundary: 'In-kind food value and cash are not interchangeable. Organization-wide totals do not reveal cash marginal cost, program budget, unrestricted liquidity, county split, or funding room.', sourceKeys: ['food-bank-annual-report-2025', 'food-bank-financials'] },
    { key: 'public-funding', label: 'San Francisco contract context', display: `${candidate.publicFunding.contractCount} exact prime-contractor matches · ${formatMoney(candidate.publicFunding.awardUsd)} contract authority · ${formatMoney(candidate.publicFunding.paymentsMadeUsd)} paid`, boundary: 'Life-to-date city contract accounting is not annual revenue, philanthropic funding room, program cost, or evidence that a private gift is additional.', sourceKeys: ['datasf-supplier-contracts'] },
  ];
  const questions = makeQuestions({
    fields: grantEvaluation.marginalPlan.requiredFields,
    contexts: {
      programIdentity: { copy: 'The Food Bank and its EIN are verified; the receiving program, partner or direct-service operator, restricted fund, target population, and county are not selected.', sourceKeys: ['food-bank-financials', 'food-bank-services'] },
      timeBoundedBudget: { copy: 'FY2025 organization-wide cash and in-kind totals are public. A program-period cash budget, donated-food assumption, inventory, reserves, expected revenue, and unfunded amount are not.', sourceKeys: ['food-bank-annual-report-2025', 'food-bank-financials'] },
      incrementalActivities: { copy: 'Published services describe existing pantries, Community Markets, home delivery, and benefits enrollment, but no source identifies the incremental activity purchased at any requested gift size.', sourceKeys: ['food-bank-services', 'food-bank-community-markets', 'food-bank-home-delivery'] },
      capacityConstraints: { copy: 'The home-delivery application says that program is at capacity and uses a waitlist; Community Markets states an eight-market expansion and a goal of up to 4,500 households weekly within three years. Open slots, waitlist size, food supply, warehouse, staffing, partner, volunteer, and delivery constraints are not reconciled.', sourceKeys: ['food-bank-home-delivery-application', 'food-bank-community-markets'] },
      fundingDisplacement: { copy: 'Government food and grants, donated-food inventory, private contributions, county support, and eight matched San Francisco contracts make displacement material, but no scenario-specific reconciliation is public.', sourceKeys: ['food-bank-annual-report-2025', 'food-bank-home-delivery', 'datasf-supplier-contracts'] },
      outcomeForecast: { copy: 'The Food Bank reports reach, meals-equivalent, benefits, and participant survey results without a common 6- or 12-month USDA food-security denominator, comparator, expected incremental effect, or uncertainty range.', sourceKeys: ['food-bank-annual-report-2025', 'food-bank-home-delivery'] },
      costAndAttribution: { copy: 'Program expense includes donated-food value and organization-wide allocation. Cash cost per unique participant, cost per sustained food-security outcome, partner contribution, and donor attribution are not published.', sourceKeys: ['food-bank-annual-report-2025', 'food-bank-financials'] },
      milestones: { copy: 'Community Markets publishes an expansion goal, but no accepted source locks scenario-specific 6-, 12-, 24-, or 36-month outcomes or continuation, revision, and exit rules for a new gift.', sourceKeys: ['food-bank-community-markets'] },
    },
  });
  return {
    packetKey: 'sf-marin-food-bank-marginal-plan-v0.1', sectionId: 'food-bank-plan-request', candidateKey: candidate.key, candidateName: candidate.name, responseLabel: 'Food Bank response',
    headline: 'What could the Food Bank do with the next gift?', status: REQUEST_STATUS, statusLabel: 'Draft · not sent', responseReceivedAt: null, forecastLockedAt: null,
    recommendationState: 'insufficient-evidence', purpose: 'Turn the Food Bank’s public scale, cash and in-kind accounting, program descriptions, and capacity signals into three program-specific marginal cases without confusing food volume with durable food security.',
    decisionBoundary: 'This packet is a research request, not a funding recommendation, commitment, organization endorsement, submitted response, estimate of room for more funding, or cost per food-secure household.',
    provenanceLegend: makeProvenanceLegend(candidate.name), publicFacts, scenarios: makeScenarios({ protocolCandidate, questions, subject: 'the Food Bank' }), questions, sources,
  };
};

const buildSfLgbtCenterPacket = ({ grantEvaluation, diligence, cityContracts }) => {
  const { candidate, protocolCandidate } = findCandidate(diligence, grantEvaluation, 'sf-lgbt-center');
  const annual = candidate.evidenceDossier.organizationReported;
  const sources = [
    { key: 'center-year-review-2024', publisher: annual.source.publisher, title: annual.source.title, url: annual.source.url, publishedAt: annual.source.publishedAt, retrievedAt: annual.source.retrievedAt },
    { key: 'center-financials', ...candidate.sources.find((source) => source.title === 'FY2024 audited financial statements') },
    { key: 'center-programs', publisher: candidate.name, title: 'Programs', url: 'https://www.sfcenter.org/programs/', publishedAt: null, retrievedAt: '2026-08-30' },
    { key: 'center-employment-services', publisher: candidate.name, title: 'Employment Services', url: 'https://www.sfcenter.org/program/employment_services/', publishedAt: null, retrievedAt: '2026-08-30' },
    { key: 'center-financial-services', publisher: candidate.name, title: 'Financial Services', url: 'https://www.sfcenter.org/program/housing-financial/', publishedAt: null, retrievedAt: '2026-08-30' },
    { key: 'center-youth-services', publisher: candidate.name, title: 'Youth Services', url: 'https://www.sfcenter.org/program/youth-services/', publishedAt: null, retrievedAt: '2026-08-30' },
    { key: 'center-theory-of-change', publisher: candidate.name, title: 'The SF LGBT Center Theory of Change', url: 'https://www.sfcenter.org/center-updates/theory-of-change/', publishedAt: null, retrievedAt: '2026-08-30' },
    { key: 'datasf-supplier-contracts', publisher: cityContracts.publisher, title: cityContracts.title, url: cityContracts.publicUrl, publishedAt: cityContracts.sourceUpdatedAt, retrievedAt: cityContracts.retrievedAt },
  ];
  const publicFacts = [
    { key: 'entity', label: 'Entity and donation vehicle', display: `${candidate.name} · ${candidate.taxStatus} · EIN ${candidate.ein}`, boundary: 'This identifies the organization, not the program, restricted fund, service cohort, or geography that would receive a proposed gift.', sourceKeys: ['center-financials'] },
    { key: 'program-scope', label: 'Published program scope', display: 'Employment, financial and housing counseling, small-business support, youth mental health and navigation, information and referrals, culture, and community programs', boundary: 'The Center must identify one named program, target population, service intensity, and geography for each gift scenario; this broad portfolio is not a marginal plan.', sourceKeys: ['center-programs', 'center-employment-services', 'center-financial-services', 'center-youth-services'] },
    { key: 'latest-signals', label: 'Latest accepted reporting window', display: '400+ job seekers supported · 30+ people secured living-wage employment · 20 first-time homebuyers · 1,000 hours of youth mental-health support', boundary: 'Calendar-2024 organization-reported outputs and outcomes; the report does not publish a common service denominator, retention window, comparator, validated mental-health change, or donor attribution.', sourceKeys: ['center-year-review-2024'] },
    { key: 'organization-finances', label: 'Organization-wide FY2024 context', display: `${formatMoney(annual.financials.revenueUsd)} revenue · ${formatMoney(annual.financials.expensesUsd)} expenses · ${formatMoney(annual.financials.governmentGrantsUsd)} government grants (55% of revenue)`, boundary: 'Audited organization-wide totals and four broad program allocations do not reveal a current program budget, unrestricted liquidity, expected revenue, cost per retained outcome, or funding room.', sourceKeys: ['center-financials', 'center-year-review-2024'] },
    { key: 'public-funding', label: 'San Francisco contract context', display: `${candidate.publicFunding.contractCount} exact prime-contractor matches · ${formatMoney(candidate.publicFunding.awardUsd)} contract authority · ${formatMoney(candidate.publicFunding.paymentsMadeUsd)} paid`, boundary: 'Life-to-date city contract accounting is not annual revenue, philanthropic funding room, program cost, or evidence that a private gift is additional.', sourceKeys: ['datasf-supplier-contracts'] },
  ];
  const questions = makeQuestions({
    fields: grantEvaluation.marginalPlan.requiredFields,
    contexts: {
      programIdentity: { copy: 'The Center and its EIN are verified; the receiving program, restricted fund, target cohort, service intensity, and San Francisco or Bay Area geography are not selected.', sourceKeys: ['center-financials', 'center-programs'] },
      timeBoundedBudget: { copy: 'FY2024 organization-wide revenue, expenses, government grants, and broad program allocations are public. A current program-period budget, restricted and unrestricted cash, expected revenue, reserves, and unfunded amount are not.', sourceKeys: ['center-financials', 'center-year-review-2024'] },
      incrementalActivities: { copy: 'Published pages describe employment, financial, housing, youth, referral, cultural, and community services, but no source identifies the incremental activity purchased at any requested gift size.', sourceKeys: ['center-programs', 'center-employment-services', 'center-financial-services', 'center-youth-services'] },
      capacityConstraints: { copy: 'The Employment Services page says individualized coaching enrollment is currently paused and the Career Connections newsletter is paused until Fall 2026. The reason, duration, staffing, employer, referral, housing, facility, and other program constraints are not reconciled.', sourceKeys: ['center-employment-services'] },
      fundingDisplacement: { copy: 'Government grants supplied 55% of FY2024 revenue and five matched San Francisco contracts fund overlapping service areas. Restricted grants, renewal assumptions, private gifts, and scenario-specific displacement are not reconciled.', sourceKeys: ['center-financials', 'datasf-supplier-contracts'] },
      outcomeForecast: { copy: 'The Center reports job placements, home purchases, service reach, and youth mental-health hours. Its 248-participant formative evaluation supports a measurement roadmap but does not publish retained employment, earnings, housing stability, or validated well-being effects with a comparator and uncertainty range.', sourceKeys: ['center-year-review-2024', 'center-theory-of-change'] },
      costAndAttribution: { copy: 'FY2024 program expense is allocated across four broad families. Cost per retained living-wage job, additional homebuyer, sustained housing outcome, or validated mental-health improvement—and the Center and donor contribution shares—are not published.', sourceKeys: ['center-financials', 'center-year-review-2024'] },
      milestones: { copy: 'The Theory of Change says the Center will collect and share outcome data regularly, but no accepted source locks scenario-specific 6-, 12-, 24-, or 36-month outcomes or continuation, revision, and exit rules for a new gift.', sourceKeys: ['center-theory-of-change'] },
    },
  });
  return {
    packetKey: 'sf-lgbt-center-marginal-plan-v0.1', sectionId: 'sf-lgbt-center-plan-request', candidateKey: candidate.key, candidateName: candidate.name, responseLabel: 'Center response',
    headline: 'What could the SF LGBT Center do with the next gift?', status: REQUEST_STATUS, statusLabel: 'Draft · not sent', responseReceivedAt: null, forecastLockedAt: null,
    recommendationState: 'insufficient-evidence', purpose: 'Turn the Center’s public service signals, audited finances, program descriptions, and measurement roadmap into three program-specific marginal cases without treating reach, service hours, or a formative evaluation as durable impact.',
    decisionBoundary: 'This packet is a research request, not a funding recommendation, commitment, organization endorsement, submitted response, estimate of room for more funding, cost per retained job, or cost per validated well-being improvement.',
    provenanceLegend: makeProvenanceLegend(candidate.name), publicFacts, scenarios: makeScenarios({ protocolCandidate, questions, subject: 'the Center' }), questions, sources,
  };
};

const buildGlidePacket = ({ grantEvaluation, diligence, cityContracts }) => {
  const { candidate, protocolCandidate } = findCandidate(diligence, grantEvaluation, 'glide');
  const annual = candidate.evidenceDossier.organizationReported;
  const sources = [
    { key: 'glide-impact-report-2025', publisher: annual.source.publisher, title: annual.source.title, url: annual.source.url, publishedAt: annual.source.publishedAt, retrievedAt: annual.source.retrievedAt },
    { key: 'glide-financials', ...candidate.sources.find((source) => source.title === 'FY2025 audited consolidated financial statements') },
    { key: 'glide-programs', publisher: candidate.name, title: 'Programs', url: 'https://www.glide.org/programs/', publishedAt: null, retrievedAt: '2026-08-30' },
    { key: 'glide-daily-meals', publisher: candidate.name, title: 'Daily Free Meals', url: 'https://www.glide.org/programs/daily-free-meals/', publishedAt: null, retrievedAt: '2026-08-30' },
    { key: 'glide-welcome-center', publisher: candidate.name, title: 'Welcome Center', url: 'https://www.glide.org/programs/welcome-center/', publishedAt: null, retrievedAt: '2026-08-30' },
    { key: 'glide-heat', publisher: candidate.name, title: 'Health Empowerment & Access Team', url: 'https://www.glide.org/heat/', publishedAt: null, retrievedAt: '2026-08-30' },
    { key: 'datasf-supplier-contracts', publisher: cityContracts.publisher, title: cityContracts.title, url: cityContracts.publicUrl, publishedAt: cityContracts.sourceUpdatedAt, retrievedAt: cityContracts.retrievedAt },
  ];
  const publicFacts = [
    { key: 'entity', label: 'Entity and donation vehicle', display: `${candidate.name} · ${candidate.taxStatus} · EIN ${candidate.ein}`, boundary: 'This identifies the Foundation donation vehicle; the audited reporting also consolidates Glide Memorial Church and related real-estate entities, and no receiving program or restricted fund is selected.', sourceKeys: ['glide-financials'] },
    { key: 'program-scope', label: 'Published program scope', display: 'Daily meals, rental and benefits assistance, case management, family and childcare services, harm reduction, medication treatment, health testing, legal support, and advocacy', boundary: 'GLIDE must identify one named program, legal entity, target cohort, service intensity, and geography for each gift scenario; this integrated portfolio is not a marginal plan.', sourceKeys: ['glide-programs', 'glide-daily-meals', 'glide-welcome-center', 'glide-heat'] },
    { key: 'latest-signals', label: 'Latest accepted reporting window', display: '620,513 meals served · 317 people received rental assistance · 2,422 people connected to benefits · 56 people enrolled in medication-assisted treatment', boundary: 'FY2025 organization-reported outputs and administrative outcomes; meals and enrollments are not unique durable outcomes, and no common follow-up, counterfactual, cross-program deduplication, or donor attribution is published.', sourceKeys: ['glide-impact-report-2025'] },
    { key: 'organization-finances', label: 'Consolidated FY2025 context', display: `${formatMoney(annual.financials.revenueUsd)} revenue · ${formatMoney(annual.financials.expensesUsd)} expenses · ${formatMoney(annual.financials.contractRevenueUsd)} contract revenue`, boundary: 'Consolidated Foundation, Church, and related real-estate totals do not reveal a current program budget, unrestricted liquidity, program cash cost, expected revenue, or philanthropic funding room.', sourceKeys: ['glide-financials', 'glide-impact-report-2025'] },
    { key: 'public-funding', label: 'San Francisco contract context', display: `${candidate.publicFunding.contractCount} exact prime-contractor matches · ${formatMoney(candidate.publicFunding.awardUsd)} contract authority · ${formatMoney(candidate.publicFunding.paymentsMadeUsd)} paid`, boundary: 'Life-to-date city contract accounting is not annual revenue, philanthropic funding room, program cost, or evidence that a private gift is additional.', sourceKeys: ['datasf-supplier-contracts'] },
  ];
  const questions = makeQuestions({
    fields: grantEvaluation.marginalPlan.requiredFields,
    contexts: {
      programIdentity: { copy: 'GLIDE Foundation and its EIN are verified, while audited reporting consolidates the Foundation, Glide Memorial Church, and related real-estate entities. The receiving entity, program, restricted fund, cohort, and geography are not selected.', sourceKeys: ['glide-financials', 'glide-programs'] },
      timeBoundedBudget: { copy: 'FY2025 consolidated revenue, expenses, contributions, contract revenue, and broad functional expenses are public. A current program-period cash budget, restricted and unrestricted cash, reserves, expected revenue, and unfunded amount are not.', sourceKeys: ['glide-financials', 'glide-impact-report-2025'] },
      incrementalActivities: { copy: 'Published pages describe existing meals, rental and benefits assistance, case management, family services, harm reduction, treatment access, and health testing, but no source identifies the incremental activity purchased at any requested gift size.', sourceKeys: ['glide-programs', 'glide-daily-meals', 'glide-welcome-center', 'glide-heat'] },
      capacityConstraints: { copy: 'Daily Meals reports about 1,700 meals per day with no eligibility requirement and partial city funding. The Welcome Center offers case management when available and goods based on availability; HEAT reports limited space and high demand for syringe access plus scheduled same-day medication starts. None quantifies program slack, staffing, food, clinical, referral, volunteer, or facility capacity for a new gift.', sourceKeys: ['glide-daily-meals', 'glide-welcome-center', 'glide-heat'] },
      fundingDisplacement: { copy: 'FY2025 contract revenue was $10.83M; 14 matched city contracts include a $14.12M future meal agreement. Government grants, donated goods, Church and Foundation resources, and scenario-specific displacement are not reconciled.', sourceKeys: ['glide-financials', 'datasf-supplier-contracts'] },
      outcomeForecast: { copy: 'GLIDE reports meals, rental assistance, benefit connections, and medication-treatment enrollment without a common 6- or 12-month food-security, housing-stability, benefit-retention, treatment-retention, or well-being denominator, comparator, expected incremental effect, or uncertainty range.', sourceKeys: ['glide-impact-report-2025'] },
      costAndAttribution: { copy: 'Consolidated functional expenses do not publish cash cost per additional food-secure participant, sustained tenancy, approved and retained benefit, retained treatment participant, or validated well-being improvement—or GLIDE and donor contribution shares.', sourceKeys: ['glide-financials', 'glide-impact-report-2025'] },
      milestones: { copy: 'No accepted source locks scenario-specific 6-, 12-, 24-, or 36-month outcomes, cross-program deduplication, forecast updates, or continuation, revision, and exit rules for a new gift.', sourceKeys: ['glide-impact-report-2025'] },
    },
  });
  return {
    packetKey: 'glide-marginal-plan-v0.1', sectionId: 'glide-plan-request', candidateKey: candidate.key, candidateName: candidate.name, responseLabel: 'GLIDE response',
    headline: 'What could GLIDE do with the next gift?', status: REQUEST_STATUS, statusLabel: 'Draft · not sent', responseReceivedAt: null, forecastLockedAt: null,
    recommendationState: 'insufficient-evidence', purpose: 'Turn GLIDE’s public service scale, consolidated finances, program descriptions, and capacity signals into three program-specific marginal cases without confusing gateway services or administrative connections with durable outcomes.',
    decisionBoundary: 'This packet is a research request, not a funding recommendation, commitment, organization endorsement, submitted response, estimate of room for more funding, cost per food-secure participant, sustained tenancy, or retained treatment participant.',
    provenanceLegend: makeProvenanceLegend(candidate.name), publicFacts, scenarios: makeScenarios({ protocolCandidate, questions, subject: 'GLIDE' }), questions, sources,
  };
};

const buildHousingActionCoalitionPacket = ({ grantEvaluation, diligence }) => {
  const { candidate, protocolCandidate } = findCandidate(diligence, grantEvaluation, 'housing-action-coalition');
  const annual = candidate.evidenceDossier.organizationReported;
  const grant = grantEvaluation.historicalGrants.find((item) => item.candidateKey === candidate.key);
  if (!grant) throw new Error('Accepted Housing Action Coalition grant record is missing.');
  const sources = [
    { key: 'hac-impact-report-2024', publisher: annual.source.publisher, title: annual.source.title, url: annual.source.url, publishedAt: annual.source.publishedAt, retrievedAt: annual.source.retrievedAt },
    { key: 'hac-form-990-2024', publisher: 'ProPublica Nonprofit Explorer', title: 'San Francisco Housing Action Coalition · FY2024 Form 990', url: 'https://projects.propublica.org/nonprofits/organizations/831881525', publishedAt: '2025-10-10', retrievedAt: '2026-08-30' },
    { key: 'hac-about', publisher: candidate.name, title: 'About', url: 'https://housingactioncoalition.org/about', publishedAt: null, retrievedAt: '2026-08-30' },
    { key: 'hac-donate', publisher: candidate.name, title: 'Friends of HAC · donation and tax information', url: 'https://housingactioncoalition.org/donate', publishedAt: null, retrievedAt: '2026-08-30' },
    { key: 'hac-membership', publisher: candidate.name, title: 'Membership', url: 'https://housingactioncoalition.org/membership', publishedAt: null, retrievedAt: '2026-08-30' },
    { key: 'coefficient-hac-grant', publisher: grant.publisher, title: grant.title, url: grant.sourceUrl, publishedAt: grant.sourcePublishedAt, retrievedAt: grant.sourceRetrievedAt },
  ];
  const publicFacts = [
    { key: 'entity', label: 'Entity and donation vehicles', display: '501(c)(3) education and research · EIN 83-1881525 · separate 501(c)(4) advocacy and lobbying vehicle', boundary: 'The donor must select the receiving legal entity, campaign, restricted use, and jurisdiction. Only the 501(c)(3) gift is described as tax-deductible; the vehicles must not be treated as one interchangeable balance sheet or intervention.', sourceKeys: ['hac-form-990-2024', 'hac-donate'] },
    { key: 'program-scope', label: 'Published program scope', display: 'Policy research and education, coalition organizing, legislative advocacy, project support, public mobilization, and litigation strategy', boundary: 'HAC must identify one vehicle, named campaign or project, target decision, geography, coalition role, and time window for each gift scenario; this portfolio is not a marginal plan.', sourceKeys: ['hac-about', 'hac-donate', 'hac-membership'] },
    { key: 'latest-signals', label: 'Latest accepted reporting window', display: '3 sponsored bills signed · 24 additional supported bills signed · 45 events with 1,250+ attendees · 100+ acres and 4,500+ units reported legally enabled', boundary: 'Calendar-2024 organization-reported policy and activity signals. Coalition contribution is not causal attribution; legal capacity, passage, and attendance are not permits, starts, completed or occupied homes, affordability, or resident well-being.', sourceKeys: ['hac-impact-report-2024'] },
    { key: 'organization-finances', label: '501(c)(3) FY2024 filing context', display: `${formatMoney(annual.financials.revenueUsd)} revenue · ${formatMoney(annual.financials.expensesUsd)} expenses · ${formatMoney(annual.financials.netAssetsUsd)} net assets`, boundary: 'The filing covers the 501(c)(3), not the 501(c)(4). Organization-wide functional expenses and negative year-end net assets do not reveal current cash, inter-entity balances, campaign cost, additionality, or room for more funding.', sourceKeys: ['hac-form-990-2024'] },
    { key: 'known-funding', label: 'Known institutional and member context', display: `${formatMoney(grant.amountUsd)} Coefficient-published 2025 advocacy grant · 140 current member organizations reported`, boundary: 'One advised grant and a current membership count do not reconcile originating funders, dues, restricted support, member conflicts, renewal assumptions, displacement, or a current funding gap. The grant must not be counted again as an independent originating-funder commitment.', sourceKeys: ['coefficient-hac-grant', 'hac-membership'] },
  ];
  const questions = makeQuestions({
    fields: grantEvaluation.marginalPlan.requiredFields,
    contexts: {
      programIdentity: { copy: 'HAC publicly separates a 501(c)(3) education and research vehicle from a 501(c)(4) advocacy and lobbying vehicle. The receiving entity, named campaign or project, policy decision, jurisdiction, coalition role, and restricted use are not selected.', sourceKeys: ['hac-about', 'hac-donate', 'hac-form-990-2024'] },
      timeBoundedBudget: { copy: 'The FY2024 filing supplies 501(c)(3) revenue, expenses, assets, liabilities, and net assets. Current 501(c)(3) and 501(c)(4) cash, liabilities, inter-entity flows, restricted funds, dues, expected revenue, campaign budgets, and unfunded amounts are not reconciled.', sourceKeys: ['hac-form-990-2024'] },
      incrementalActivities: { copy: 'Current pages describe policy research, education, coalition organizing, analysis, legislative advocacy, public mobilization, and project support, but no source identifies the additional campaign activity purchased at any requested gift size.', sourceKeys: ['hac-about', 'hac-donate', 'hac-membership'] },
      capacityConstraints: { copy: 'HAC says predictable monthly support helps it plan, staff, and scale campaigns. It does not publish the binding staff, legal, research, coalition, policymaker, project-pipeline, timing, or jurisdictional constraints—or how those constraints change at $100K, $1M, and $10M.', sourceKeys: ['hac-donate'] },
      fundingDisplacement: { copy: `HAC reports 140 member organizations, and Coefficient Giving publishes a ${formatMoney(grant.amountUsd)} advocacy grant. Member dues, developer and institutional support, restrictions, originating funders, renewal assumptions, the two vehicles, and scenario-specific displacement are not reconciled.`, sourceKeys: ['hac-membership', 'coefficient-hac-grant', 'hac-form-990-2024'] },
      outcomeForecast: { copy: 'HAC reports enacted bills and legal capacity for 4,500+ multifamily units, but no accepted source estimates HAC’s marginal contribution, the probability of a policy counterfactual, implementation through permits, starts, completions and occupancy, affordability mix, geography, timing, or uncertainty.', sourceKeys: ['hac-impact-report-2024'] },
      costAndAttribution: { copy: 'The 501(c)(3) filing does not publish campaign-level cash cost, the 501(c)(4) cost base, coalition contribution shares, cost per additional policy change, cost per additional completed and occupied home, or a downstream rent, displacement, QALY, WELLBY, or life-substantially-bettered model.', sourceKeys: ['hac-form-990-2024', 'hac-impact-report-2024'] },
      milestones: { copy: 'No accepted source locks scenario-specific 6-, 12-, 24-, or 36-month milestones spanning staff and coalition activity, decision stages, implementation, occupied housing, forecast updates, and continuation, revision, or exit rules.', sourceKeys: ['hac-impact-report-2024', 'hac-donate'] },
    },
  });
  return {
    packetKey: 'housing-action-coalition-marginal-plan-v0.1', sectionId: 'housing-action-coalition-plan-request', candidateKey: candidate.key, candidateName: candidate.name, responseLabel: 'HAC response',
    headline: 'What could Housing Action Coalition do with the next gift?', status: REQUEST_STATUS, statusLabel: 'Draft · not sent', responseReceivedAt: null, forecastLockedAt: null,
    recommendationState: 'insufficient-evidence', purpose: 'Turn HAC’s public policy portfolio, separate legal vehicles, 501(c)(3) filing, member base, and known institutional grant into three campaign-specific marginal cases without attributing coalition outcomes or counting legal capacity as completed housing.',
    decisionBoundary: 'This packet is a research request, not a funding recommendation, commitment, organization endorsement, submitted response, estimate of room for more funding, causal attribution of a policy outcome, cost per completed home, or life-substantially-bettered estimate.',
    provenanceLegend: makeProvenanceLegend(candidate.name), publicFacts, scenarios: makeScenarios({ protocolCandidate, questions, subject: 'HAC' }), questions, sources,
  };
};

const buildGrowSfPacket = ({ grantEvaluation, diligence }) => {
  const { candidate, protocolCandidate } = findCandidate(diligence, grantEvaluation, 'growsf');
  const annual = candidate.evidenceDossier.organizationReported;
  const sources = [
    { key: 'growsf-about', ...candidate.sources.find((source) => source.title === 'About GrowSF') },
    { key: 'growsf-impact-report-2026', publisher: annual.source.publisher, title: annual.source.title, url: annual.source.url, publishedAt: annual.source.publishedAt, retrievedAt: annual.source.retrievedAt },
    { key: 'growsf-form-990-2024', ...candidate.sources.find((source) => source.title.includes('FY2024 Form 990')) },
    { key: 'sf-election-results-2026', publisher: 'San Francisco Department of Elections', title: 'June 2, 2026 Consolidated Statewide Direct Primary Election Results', url: 'https://www.sfelections.org/results/20260602/index.html', publishedAt: '2026-06-25', retrievedAt: '2026-08-30' },
    { key: 'sf-ethics-growsf-committee', publisher: 'San Francisco Ethics Commission', title: 'GrowSF Voter Guide committee · June 2, 2026 election', url: 'https://campaign.sfethics.org/elections/2026-06-02/committees/CA1433436', publishedAt: '2026-08-10', retrievedAt: '2026-08-30' },
  ];
  const publicFacts = [
    { key: 'entity', label: 'Entity and donation vehicle', display: `${annual.reportingName ?? candidate.evidenceDossier.reportingName} · ${candidate.taxStatus} · EIN ${candidate.ein} · gifts not deductible as charitable contributions`, boundary: 'A donor must identify the receiving 501(c)(4) or committee, restricted activity, contest, and legal constraints. This is political spending rather than a tax-deductible charitable gift.', sourceKeys: ['growsf-about', 'growsf-form-990-2024'] },
    { key: 'program-scope', label: 'Published activity scope', display: 'Voter guides, candidate and ballot-measure campaigns, paid media, policy research, and a leadership pipeline', boundary: 'GrowSF must identify one legal entity, contest or research project, tactic, audience, jurisdiction, and time period for each gift scenario; the portfolio is not a marginal plan.', sourceKeys: ['growsf-about', 'growsf-impact-report-2026'] },
    { key: 'latest-signals', label: 'June 2026 reporting window', display: '117,000 unique voter-guide users · 14M connected-TV impressions · 3 of 3 supported candidates won · 1 opposed measure failed', boundary: 'Organization-reported reach and officially confirmed aligned results do not identify votes changed, incremental turnout, the election counterfactual, policy implementation, or resident outcomes.', sourceKeys: ['growsf-impact-report-2026', 'sf-election-results-2026'] },
    { key: 'organization-finances', label: '501(c)(4) FY2024 filing context', display: `${formatMoney(annual.financials.revenueUsd)} revenue · ${formatMoney(annual.financials.expensesUsd)} expenses · ${formatMoney(annual.financials.netAssetsUsd)} net assets`, boundary: 'FY2024 entity-wide totals do not reconcile the June 2026 campaign, every committee, current liquidity, restricted uses, other donors, expected support, or scenario-specific funding room.', sourceKeys: ['growsf-form-990-2024'] },
    { key: 'campaign-accounting', label: 'June 2026 campaign accounting', display: '$1.424M organization-reported campaign budget · $274,429.61 across four recent independent expenditures on the reviewed committee page', boundary: 'The two figures use different scopes. The Ethics page warns that displayed totals omit some activity, so they cannot be reconciled into total campaign cost, cost per incremental vote, or philanthropic additionality.', sourceKeys: ['growsf-impact-report-2026', 'sf-ethics-growsf-committee'] },
  ];
  const questions = makeQuestions({
    fields: grantEvaluation.marginalPlan.requiredFields,
    contexts: {
      programIdentity: { copy: 'GrowSF identifies a 501(c)(4), voter guide, campaigns, research, and a leadership pipeline. The receiving entity or committee, contest or project, tactic, target audience, jurisdiction, restriction, and compliance review are not selected.', sourceKeys: ['growsf-about', 'growsf-impact-report-2026', 'growsf-form-990-2024'] },
      timeBoundedBudget: { copy: 'The FY2024 filing and June 2026 campaign report use different periods and scopes. Current entity and committee cash, liabilities, accrued expenses, restrictions, expected support, campaign budgets, and unfunded amounts are not consolidated.', sourceKeys: ['growsf-form-990-2024', 'growsf-impact-report-2026', 'sf-ethics-growsf-committee'] },
      incrementalActivities: { copy: 'Published activities include guides, mail, connected TV, digital media, research, campaigns, and leadership development, but no source says what an incremental $100K, $1M, or $10M would add.', sourceKeys: ['growsf-about', 'growsf-impact-report-2026'] },
      capacityConstraints: { copy: 'The report describes a media-heavy campaign but does not publish binding staff, research, audience, ad-inventory, election-timing, compliance, candidate-pipeline, saturation, or diminishing-return constraints.', sourceKeys: ['growsf-impact-report-2026'] },
      fundingDisplacement: { copy: 'The FY2024 entity filing, June 2026 campaign budget, and reviewed committee disclosures are not reconciled across donors, legal entities, committees, restricted uses, expected renewals, or scenario-specific displacement.', sourceKeys: ['growsf-form-990-2024', 'growsf-impact-report-2026', 'sf-ethics-growsf-committee'] },
      outcomeForecast: { copy: 'GrowSF reports reach and aligned election results. A credible scenario forecast needs incremental guide use, persuasion, turnout, and vote choice with uncertainty and a pre-specified counterfactual; downstream policy effects must remain separate.', sourceKeys: ['growsf-impact-report-2026', 'sf-election-results-2026'] },
      costAndAttribution: { copy: 'Reported media volume, campaign cost, and aligned results do not yield cost per additional persuaded voter, incremental turnout, changed outcome, implemented policy, QALY, WELLBY, or life substantially bettered.', sourceKeys: ['growsf-impact-report-2026', 'sf-election-results-2026', 'sf-ethics-growsf-committee'] },
      milestones: { copy: 'No accepted source locks scenario-specific pre-election, post-election, 6-, 12-, 24-, or 36-month milestones spanning delivery, measured persuasion, final results, policy implementation, resident outcomes, forecast revision, and stop rules.', sourceKeys: ['growsf-impact-report-2026'] },
    },
  });
  return {
    packetKey: 'growsf-marginal-plan-v0.1', sectionId: 'growsf-plan-request', candidateKey: candidate.key, candidateName: candidate.name, responseLabel: 'GrowSF response',
    headline: 'What could GrowSF do with the next gift?', status: REQUEST_STATUS, statusLabel: 'Draft · not sent', responseReceivedAt: null, forecastLockedAt: null,
    recommendationState: 'insufficient-evidence', purpose: 'Turn GrowSF’s public 501(c)(4) identity, campaign reach, aligned results, entity filing, and limited committee disclosures into three legally specific marginal cases without endorsing electoral choices or attributing votes and downstream outcomes.',
    decisionBoundary: 'This packet is a neutral research request, not a funding recommendation, political endorsement, commitment, submitted response, estimate of room for more funding, causal attribution of an election result, cost per vote, policy-impact estimate, or life-substantially-bettered estimate.',
    provenanceLegend: makeProvenanceLegend(candidate.name), publicFacts, scenarios: makeScenarios({ protocolCandidate, questions, subject: 'GrowSF' }), questions, sources,
  };
};

export function buildSfMarginalPlanRequests({ grantEvaluation, diligence, publicFunding }) {
  const cityContracts = publicFunding.sources.find((source) => source.key === 'datasf-supplier-contracts');
  if (!cityContracts) throw new Error('Accepted DataSF supplier-contract source is missing.');
  const packets = [
    buildHamiltonPacket({ grantEvaluation, diligence, cityContracts }),
    buildFoodBankPacket({ grantEvaluation, diligence, cityContracts }),
    buildSfLgbtCenterPacket({ grantEvaluation, diligence, cityContracts }),
    buildGlidePacket({ grantEvaluation, diligence, cityContracts }),
    buildHousingActionCoalitionPacket({ grantEvaluation, diligence }),
    buildGrowSfPacket({ grantEvaluation, diligence }),
  ];
  return {
    version: 'sf-marginal-plan-requests-v0.6', generatedAt: grantEvaluation.generatedAt, geography: grantEvaluation.geography,
    summary: {
      packetCount: packets.length,
      draftPacketCount: packets.filter((packet) => packet.status === REQUEST_STATUS).length,
      scenarioCount: packets.reduce((sum, packet) => sum + packet.scenarios.length, 0),
      submittedScenarioCount: 0,
      organizationResponseCount: 0,
      mfiModelCount: 0,
      publicFactCount: packets.reduce((sum, packet) => sum + packet.publicFacts.length, 0),
      questionCount: packets.reduce((sum, packet) => sum + packet.questions.length, 0),
    },
    packets,
  };
}

export function validateSfMarginalPlanRequests(snapshot) {
  if (snapshot.version !== 'sf-marginal-plan-requests-v0.6') throw new Error('Unexpected SF marginal-plan request version.');
  if (snapshot.packets.length !== 6 || snapshot.summary.packetCount !== 6) throw new Error('Expected all six San Francisco candidate request packets.');
  const expectedKeys = ['hamilton-families', 'sf-marin-food-bank', 'sf-lgbt-center', 'glide', 'housing-action-coalition', 'growsf'];
  if (JSON.stringify(snapshot.packets.map((packet) => packet.candidateKey)) !== JSON.stringify(expectedKeys)) throw new Error('Unexpected request packet candidates or order.');
  if (new Set(snapshot.packets.map((packet) => packet.sectionId)).size !== snapshot.packets.length) throw new Error('Request packet anchors must be unique.');
  for (const packet of snapshot.packets) {
    if (packet.status !== REQUEST_STATUS || packet.responseReceivedAt !== null || packet.forecastLockedAt !== null) throw new Error(`${packet.candidateName} request overstates response or forecast readiness.`);
    if (packet.scenarios.length !== 3 || JSON.stringify(packet.scenarios.map((scenario) => scenario.amountUsd)) !== JSON.stringify(GIFT_SCENARIOS)) throw new Error(`${packet.candidateName} request must cover all three gift sizes.`);
    if (packet.questions.length !== 8 || new Set(packet.questions.map((question) => question.key)).size !== 8) throw new Error(`${packet.candidateName} request must cover all eight marginal-plan fields.`);
    if (packet.scenarios.some((scenario) => scenario.state !== 'not-submitted' || scenario.organizationResponse !== null || scenario.mfiModel !== null)) throw new Error(`${packet.candidateName} scenarios overstate submitted or modeled evidence.`);
    if (packet.questions.some((question) => question.publicContextState !== 'accepted-public-context' || question.organizationResponseState !== 'not-submitted' || question.organizationResponse !== null || question.mfiModelState !== 'not-started' || question.mfiModel !== null)) throw new Error(`${packet.candidateName} question provenance is not fail-closed.`);
    if (packet.publicFacts.some((fact) => !fact.boundary || fact.sourceKeys.length === 0)) throw new Error(`Every ${packet.candidateName} public prefill needs a source and transfer boundary.`);
    const sourceKeys = new Set(packet.sources.map((source) => source.key));
    if (packet.publicFacts.some((fact) => fact.sourceKeys.some((key) => !sourceKeys.has(key))) || packet.questions.some((question) => question.publicContextSourceKeys.some((key) => !sourceKeys.has(key)))) throw new Error(`${packet.candidateName} public context references an unknown source.`);
    if (packet.sources.some((source) => !source.retrievedAt)) throw new Error(`${packet.candidateName} source is missing a retrieval date.`);
  }
  if (snapshot.summary.scenarioCount !== 18 || snapshot.summary.publicFactCount !== 30 || snapshot.summary.questionCount !== 48) throw new Error('Request summary is incomplete.');
  if (snapshot.summary.submittedScenarioCount !== 0 || snapshot.summary.organizationResponseCount !== 0 || snapshot.summary.mfiModelCount !== 0) throw new Error('Request summary overstates readiness.');
  const supportedHosts = new Set(['hamiltonfamilies.org', 'www.hamiltonfamilies.org', 'sfmfoodbank.org', 'www.sfmfoodbank.org', 'panda.sfmfoodbank.org', 'sfcenter.org', 'www.sfcenter.org', 'glide.org', 'www.glide.org', 'housingactioncoalition.org', 'growsf.org', 'projects.propublica.org', 'coefficientgiving.org', 'data.sfgov.org', 'www.sfelections.org', 'campaign.sfethics.org']);
  if (snapshot.packets.some((packet) => packet.sources.some((source) => !supportedHosts.has(new URL(source.url).hostname)))) throw new Error('Request includes an unsupported source domain.');
  return snapshot;
}
