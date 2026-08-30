CREATE TABLE `assessments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_id` integer NOT NULL,
	`evaluator_id` integer NOT NULL,
	`organization_id` integer NOT NULL,
	`recommendation_status` text NOT NULL,
	`assessment_date` integer,
	`evidence_level` text,
	`native_metric_name` text,
	`native_metric_value` real,
	`native_metric_unit` text,
	`benchmark_name` text,
	`benchmark_multiple` real,
	`funding_room_usd` real,
	`funding_room_period` text,
	`confidence_low` real,
	`confidence_high` real,
	`summary` text,
	`limitations` text,
	`model_version` text,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`evaluator_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `assessments_org_date_idx` ON `assessments` (`organization_id`,`assessment_date`);--> statement-breakpoint
CREATE INDEX `assessments_evaluator_idx` ON `assessments` (`evaluator_id`);--> statement-breakpoint
CREATE TABLE `grants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`external_id` text,
	`source_id` integer NOT NULL,
	`originating_funder_id` integer,
	`advising_funder_id` integer,
	`recipient_id` integer NOT NULL,
	`amount_usd` real,
	`amount_original` real,
	`currency` text,
	`status` text NOT NULL,
	`decision_date` integer,
	`start_date` integer,
	`end_date` integer,
	`cause` text NOT NULL,
	`intervention` text,
	`geography` text,
	`purpose` text,
	`restricted` integer,
	`grouped_grant` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`originating_funder_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`advising_funder_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recipient_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `grants_source_external_idx` ON `grants` (`source_id`,`external_id`);--> statement-breakpoint
CREATE INDEX `grants_cause_date_idx` ON `grants` (`cause`,`decision_date`);--> statement-breakpoint
CREATE INDEX `grants_recipient_idx` ON `grants` (`recipient_id`);--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`canonical_name` text NOT NULL,
	`slug` text NOT NULL,
	`website_url` text,
	`organization_type` text NOT NULL,
	`country_code` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_slug_idx` ON `organizations` (`slug`);--> statement-breakpoint
CREATE TABLE `sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`publisher` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`published_at` integer,
	`retrieved_at` integer NOT NULL,
	`coverage_note` text,
	`content_hash` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sources_url_idx` ON `sources` (`url`);