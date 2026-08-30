import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

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
  sourceId: integer('source_id').notNull().references(() => sources.id),
  originatingFunderId: integer('originating_funder_id').references(() => organizations.id),
  advisingFunderId: integer('advising_funder_id').references(() => organizations.id),
  recipientId: integer('recipient_id').notNull().references(() => organizations.id),
  amountUsd: real('amount_usd'),
  amountOriginal: real('amount_original'),
  currency: text('currency'),
  status: text('status').notNull(),
  decisionDate: integer('decision_date', { mode: 'timestamp' }),
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
  index('grants_cause_date_idx').on(table.cause, table.decisionDate),
  index('grants_recipient_idx').on(table.recipientId),
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
  confidenceLow: real('confidence_low'),
  confidenceHigh: real('confidence_high'),
  summary: text('summary'),
  limitations: text('limitations'),
  modelVersion: text('model_version'),
}, (table) => [
  index('assessments_org_date_idx').on(table.organizationId, table.assessmentDate),
  index('assessments_evaluator_idx').on(table.evaluatorId),
]);
