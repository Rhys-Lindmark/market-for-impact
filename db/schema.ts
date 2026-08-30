import { index, integer, primaryKey, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const sources = sqliteTable('sources', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  publisher: text('publisher').notNull(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  retrievedAt: integer('retrieved_at', { mode: 'timestamp' }).notNull(),
  coverageNote: text('coverage_note'),
  contentHash: text('content_hash'),
}, (table) => [uniqueIndex('sources_url_idx').on(table.url)]);

export const organizations = sqliteTable('organizations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  canonicalName: text('canonical_name').notNull(),
  slug: text('slug').notNull(),
  websiteUrl: text('website_url'),
  organizationType: text('organization_type').notNull(),
  countryCode: text('country_code'),
}, (table) => [uniqueIndex('organizations_slug_idx').on(table.slug)]);

export const grants = sqliteTable('grants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  externalId: text('external_id'),
  sourceRecordId: text('source_record_id'),
  sourceUrl: text('source_url'),
  sourceId: integer('source_id').notNull().references(() => sources.id),
  originatingFunderId: integer('originating_funder_id').references(() => organizations.id),
  advisingFunderId: integer('advising_funder_id').references(() => organizations.id),
  recipientId: integer('recipient_id').references(() => organizations.id),
  amountUsd: real('amount_usd'),
  amountOriginal: real('amount_original'),
  currency: text('currency'),
  status: text('status').notNull(),
  decisionDate: integer('decision_date', { mode: 'timestamp' }),
  awardDate: integer('award_date', { mode: 'timestamp' }),
  sourcePublishedAt: integer('source_published_at', { mode: 'timestamp' }),
  sourcePostId: integer('source_post_id'),
  recipientNamesJson: text('recipient_names_json').notNull().default('[]'),
  recipientNamesText: text('recipient_names_text').notNull().default(''),
  focusAreasJson: text('focus_areas_json').notNull().default('[]'),
  listedFundsJson: text('listed_funds_json').notNull().default('[]'),
  topicsJson: text('topics_json').notNull().default('[]'),
  fundersJson: text('funders_json').notNull().default('[]'),
  countriesJson: text('countries_json').notNull().default('[]'),
  startDate: integer('start_date', { mode: 'timestamp' }),
  endDate: integer('end_date', { mode: 'timestamp' }),
  cause: text('cause').notNull(),
  intervention: text('intervention'),
  geography: text('geography'),
  purpose: text('purpose'),
  restricted: integer('restricted', { mode: 'boolean' }),
  groupedGrant: integer('grouped_grant', { mode: 'boolean' }).notNull().default(false),
  firstSeenAt: integer('first_seen_at', { mode: 'timestamp' }),
  lastSeenAt: integer('last_seen_at', { mode: 'timestamp' }),
}, (table) => [
  uniqueIndex('grants_source_external_idx').on(table.sourceId, table.externalId),
  uniqueIndex('grants_source_record_idx').on(table.sourceId, table.sourceRecordId),
  index('grants_cause_date_idx').on(table.cause, table.decisionDate),
  index('grants_recipient_idx').on(table.recipientId),
  index('grants_advising_funder_idx').on(table.advisingFunderId),
  index('grants_originating_funder_idx').on(table.originatingFunderId),
  index('grants_source_award_date_idx').on(table.sourceId, table.awardDate),
  index('grants_source_amount_idx').on(table.sourceId, table.amountUsd),
  index('grants_source_seen_idx').on(table.sourceId, table.lastSeenAt),
]);

export const organizationSourceNames = sqliteTable('organization_source_names', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sourceId: integer('source_id').notNull().references(() => sources.id),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  sourceName: text('source_name').notNull(),
  normalizedName: text('normalized_name').notNull(),
  identityBasis: text('identity_basis').notNull(),
}, (table) => [
  uniqueIndex('organization_source_names_source_normalized_idx').on(table.sourceId, table.normalizedName),
  index('organization_source_names_organization_idx').on(table.organizationId),
]);

export const grantOrganizationRoles = sqliteTable('grant_organization_roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  grantId: integer('grant_id').notNull().references(() => grants.id),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  role: text('role').notNull(),
  sourceName: text('source_name').notNull(),
  position: integer('position').notNull().default(0),
}, (table) => [
  uniqueIndex('grant_organization_roles_grant_org_role_idx').on(table.grantId, table.organizationId, table.role),
  index('grant_organization_roles_organization_role_idx').on(table.organizationId, table.role, table.grantId),
  index('grant_organization_roles_grant_role_idx').on(table.grantId, table.role, table.position),
]);

export const assessments = sqliteTable('assessments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sourceId: integer('source_id').notNull().references(() => sources.id),
  evaluatorId: integer('evaluator_id').notNull().references(() => organizations.id),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  recommendationStatus: text('recommendation_status').notNull(),
  assessmentDate: integer('assessment_date', { mode: 'timestamp' }),
  evidenceLevel: text('evidence_level'),
  nativeMetricName: text('native_metric_name'),
  nativeMetricValue: real('native_metric_value'),
  nativeMetricUnit: text('native_metric_unit'),
  benchmarkName: text('benchmark_name'),
  benchmarkMultiple: real('benchmark_multiple'),
  fundingRoomUsd: real('funding_room_usd'),
  fundingRoomPeriod: text('funding_room_period'),
  fundingCapacityUsd: real('funding_capacity_usd'),
  fundingCapacityPeriod: text('funding_capacity_period'),
  confidenceLow: real('confidence_low'),
  confidenceHigh: real('confidence_high'),
  summary: text('summary'),
  limitations: text('limitations'),
  modelVersion: text('model_version'),
}, (table) => [
  uniqueIndex('assessments_source_org_status_idx').on(table.sourceId, table.organizationId, table.recommendationStatus),
  index('assessments_org_date_idx').on(table.organizationId, table.assessmentDate),
  index('assessments_evaluator_idx').on(table.evaluatorId),
]);

export const aiSafetyOrganizationRoles = sqliteTable('ai_safety_organization_roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sourceId: integer('source_id').notNull().references(() => sources.id),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  taxonomyVersion: text('taxonomy_version').notNull(),
  roleKey: text('role_key').notNull(),
  primaryRole: integer('primary_role', { mode: 'boolean' }).notNull().default(false),
  evidenceBasisJson: text('evidence_basis_json').notNull().default('[]'),
  sourceGrantCount: integer('source_grant_count').notNull(),
  sourceAmountUsd: real('source_amount_usd').notNull(),
  foundersPledgeStatus: text('founders_pledge_status'),
  limitations: text('limitations').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  uniqueIndex('ai_safety_roles_org_taxonomy_role_idx').on(table.organizationId, table.taxonomyVersion, table.roleKey),
  index('ai_safety_roles_role_amount_idx').on(table.roleKey, table.sourceAmountUsd),
  index('ai_safety_roles_source_idx').on(table.sourceId),
]);

export const assessmentMetrics = sqliteTable('assessment_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  assessmentId: integer('assessment_id').notNull().references(() => assessments.id),
  metricKey: text('metric_key').notNull(),
  program: text('program').notNull(),
  value: real('value').notNull(),
  confidenceLow: real('confidence_low'),
  confidenceHigh: real('confidence_high'),
  unit: text('unit').notNull(),
  modelVersion: text('model_version'),
  limitations: text('limitations'),
}, (table) => [
  uniqueIndex('assessment_metrics_assessment_key_idx').on(table.assessmentId, table.metricKey),
  index('assessment_metrics_assessment_idx').on(table.assessmentId),
]);

export const impactBenchmarks = sqliteTable('impact_benchmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sourceId: integer('source_id').notNull().references(() => sources.id),
  evaluatorId: integer('evaluator_id').notNull().references(() => organizations.id),
  comparatorOrganizationId: integer('comparator_organization_id').references(() => organizations.id),
  benchmarkKey: text('benchmark_key').notNull(),
  name: text('name').notNull(),
  benchmarkType: text('benchmark_type').notNull(),
  effectiveAt: integer('effective_at', { mode: 'timestamp' }),
  modelVersion: text('model_version').notNull(),
  referenceBenchmarkKey: text('reference_benchmark_key'),
  estimateLow: real('estimate_low'),
  estimateHigh: real('estimate_high'),
  unitName: text('unit_name').notNull(),
  unitsPerUsd: real('units_per_usd'),
  currencyBasis: text('currency_basis'),
  populationBasis: text('population_basis'),
  assumptionsJson: text('assumptions_json').notNull().default('[]'),
  limitationsJson: text('limitations_json').notNull().default('[]'),
  modelUrl: text('model_url'),
}, (table) => [
  uniqueIndex('impact_benchmarks_key_idx').on(table.benchmarkKey),
  index('impact_benchmarks_evaluator_type_idx').on(table.evaluatorId, table.benchmarkType),
  index('impact_benchmarks_comparator_idx').on(table.comparatorOrganizationId),
]);

export const impactConversionModels = sqliteTable('impact_conversion_models', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sourceId: integer('source_id').notNull().references(() => sources.id),
  evaluatorId: integer('evaluator_id').references(() => organizations.id),
  modelKey: text('model_key').notNull(),
  name: text('name').notNull(),
  status: text('status').notNull(),
  sourceUnit: text('source_unit').notNull(),
  targetUnit: text('target_unit').notNull(),
  formula: text('formula').notNull(),
  modelVersion: text('model_version').notNull(),
  effectiveAt: integer('effective_at', { mode: 'timestamp' }),
  parametersJson: text('parameters_json').notNull().default('[]'),
  assumptionsJson: text('assumptions_json').notNull().default('[]'),
  limitationsJson: text('limitations_json').notNull().default('[]'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  uniqueIndex('impact_conversion_models_key_idx').on(table.modelKey),
  index('impact_conversion_models_status_target_idx').on(table.status, table.targetUnit),
  index('impact_conversion_models_evaluator_idx').on(table.evaluatorId),
]);

export const fundingTranches = sqliteTable('funding_tranches', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  assessmentId: integer('assessment_id').notNull().references(() => assessments.id),
  trancheKey: text('tranche_key').notNull(),
  evaluatorSlug: text('evaluator_slug').notNull(),
  cause: text('cause').notNull(),
  status: text('status').notNull(),
  amountUsd: real('amount_usd'),
  capacityUsd: real('capacity_usd'),
  timeWindow: text('time_window').notNull(),
  fundingUse: text('funding_use').notNull(),
  confidenceLabel: text('confidence_label').notNull(),
  confidenceBasis: text('confidence_basis').notNull(),
  marginalMetricName: text('marginal_metric_name'),
  marginalMetricValue: real('marginal_metric_value'),
  marginalMetricUnit: text('marginal_metric_unit'),
  likelyCounterfactualFunder: text('likely_counterfactual_funder'),
  counterfactualBasis: text('counterfactual_basis').notNull(),
  modelVersion: text('model_version').notNull(),
  referenceUrl: text('reference_url').notNull(),
  limitations: text('limitations').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  uniqueIndex('funding_tranches_key_idx').on(table.trancheKey),
  index('funding_tranches_status_window_idx').on(table.status, table.timeWindow),
  index('funding_tranches_evaluator_cause_idx').on(table.evaluatorSlug, table.cause),
  index('funding_tranches_assessment_idx').on(table.assessmentId),
]);

export const localOutcomes = sqliteTable('local_outcomes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull(), geography: text('geography').notNull(), label: text('label').notNull(),
  question: text('question').notNull(), canonicalUnit: text('canonical_unit').notNull(),
  observableMeasure: text('observable_measure').notNull(), unitSemantics: text('unit_semantics').notNull(),
  population: text('population').notNull(), timeWindow: text('time_window').notNull(), direction: text('direction').notNull(),
  measurementState: text('measurement_state').notNull(), attributionState: text('attribution_state').notNull(),
  serviceOutputsJson: text('service_outputs_json').notNull().default('[]'),
  administrativeProxiesJson: text('administrative_proxies_json').notNull().default('[]'),
  requiredInputsJson: text('required_inputs_json').notNull().default('[]'),
  allowedClaimsJson: text('allowed_claims_json').notNull().default('[]'),
  blockedClaimsJson: text('blocked_claims_json').notNull().default('[]'),
  equityCutsJson: text('equity_cuts_json').notNull().default('[]'), qalyState: text('qaly_state').notNull(),
  wellbyState: text('wellby_state').notNull(), displayOrder: integer('display_order').notNull(),
  ontologyVersion: text('ontology_version').notNull(), updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [uniqueIndex('local_outcomes_slug_idx').on(table.slug), index('local_outcomes_version_order_idx').on(table.ontologyVersion, table.displayOrder)]);

export const localOutcomeSources = sqliteTable('local_outcome_sources', {
  id: integer('id').primaryKey({ autoIncrement: true }), outcomeId: integer('outcome_id').notNull().references(() => localOutcomes.id),
  sourceKey: text('source_key').notNull(), publisher: text('publisher').notNull(), title: text('title').notNull(),
  sourceUrl: text('source_url').notNull(), publishedAt: text('published_at'), datePrecision: text('date_precision').notNull(),
  retrievedAt: integer('retrieved_at', { mode: 'timestamp' }).notNull(), monitorMode: text('monitor_mode').notNull(),
  coverageNote: text('coverage_note').notNull(), ontologyVersion: text('ontology_version').notNull(),
}, (table) => [
  uniqueIndex('local_outcome_sources_outcome_source_version_idx').on(table.outcomeId, table.sourceKey, table.ontologyVersion),
  index('local_outcome_sources_version_idx').on(table.ontologyVersion, table.sourceKey),
]);

export const localOutcomeOverlaps = sqliteTable('local_outcome_overlaps', {
  id: integer('id').primaryKey({ autoIncrement: true }), leftOutcomeId: integer('left_outcome_id').notNull().references(() => localOutcomes.id),
  rightOutcomeId: integer('right_outcome_id').notNull().references(() => localOutcomes.id), risk: text('risk').notNull(),
  treatmentRule: text('treatment_rule').notNull(), ontologyVersion: text('ontology_version').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  uniqueIndex('local_outcome_overlaps_pair_version_idx').on(table.leftOutcomeId, table.rightOutcomeId, table.ontologyVersion),
  index('local_outcome_overlaps_version_idx').on(table.ontologyVersion),
]);

export const sfPublicFundingSources = sqliteTable('sf_public_funding_sources', {
  id: integer('id').primaryKey({ autoIncrement: true }), sourceKey: text('source_key').notNull(),
  datasetId: text('dataset_id').notNull(), publisher: text('publisher').notNull(), title: text('title').notNull(),
  publicUrl: text('public_url').notNull(), queryUrl: text('query_url').notNull(), amountSemantics: text('amount_semantics').notNull(),
  dataAsOf: text('data_as_of'), sourceUpdatedAt: integer('source_updated_at', { mode: 'timestamp' }).notNull(),
  retrievedAt: integer('retrieved_at', { mode: 'timestamp' }).notNull(), sourceRowCount: integer('source_row_count').notNull(),
  semanticHash: text('semantic_hash').notNull(), snapshotVersion: text('snapshot_version').notNull(),
}, (table) => [uniqueIndex('sf_public_funding_sources_key_version_idx').on(table.sourceKey, table.snapshotVersion)]);

export const sfDepartmentBudgets = sqliteTable('sf_department_budgets', {
  id: integer('id').primaryKey({ autoIncrement: true }), departmentCode: text('department_code').notNull(),
  department: text('department').notNull(), fiscalYear: text('fiscal_year').notNull(), budgetUsd: real('budget_usd').notNull(),
  outcomeKeysJson: text('outcome_keys_json').notNull().default('[]'), dataAsOf: text('data_as_of'), dataLoadedAt: text('data_loaded_at'),
  snapshotVersion: text('snapshot_version').notNull(), updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  uniqueIndex('sf_department_budgets_code_year_version_idx').on(table.departmentCode, table.fiscalYear, table.snapshotVersion),
  index('sf_department_budgets_version_code_idx').on(table.snapshotVersion, table.departmentCode),
]);

export const sfPublicContracts = sqliteTable('sf_public_contracts', {
  id: integer('id').primaryKey({ autoIncrement: true }), contractNumber: text('contract_number').notNull(),
  contractTitle: text('contract_title'), termStartDate: text('term_start_date').notNull(), termEndDate: text('term_end_date').notNull(),
  contractType: text('contract_type'), purchasingAuthority: text('purchasing_authority'),
  departmentCode: text('department_code').notNull(), department: text('department').notNull(),
  primeContractor: text('prime_contractor').notNull(), scopeOfWork: text('scope_of_work'), awardUsd: real('award_usd'),
  outstandingPurchaseOrdersUsd: real('outstanding_purchase_orders_usd'), paymentsMadeUsd: real('payments_made_usd'),
  remainingAuthorityUsd: real('remaining_authority_usd'), dataAsOf: text('data_as_of'), dataLoadedAt: text('data_loaded_at'),
  snapshotVersion: text('snapshot_version').notNull(), updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  uniqueIndex('sf_public_contracts_number_version_idx').on(table.contractNumber, table.snapshotVersion),
  index('sf_public_contracts_version_award_idx').on(table.snapshotVersion, table.awardUsd),
  index('sf_public_contracts_version_department_idx').on(table.snapshotVersion, table.departmentCode),
]);

export const sfPublicContractOutcomes = sqliteTable('sf_public_contract_outcomes', {
  contractId: integer('contract_id').notNull().references(() => sfPublicContracts.id),
  outcomeId: integer('outcome_id').notNull().references(() => localOutcomes.id), matchReason: text('match_reason').notNull(),
  snapshotVersion: text('snapshot_version').notNull(),
}, (table) => [
  primaryKey({ columns: [table.contractId, table.outcomeId, table.snapshotVersion] }),
  index('sf_public_contract_outcomes_version_outcome_idx').on(table.snapshotVersion, table.outcomeId),
]);
