CREATE TABLE `local_outcomes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`geography` text NOT NULL,
	`label` text NOT NULL,
	`question` text NOT NULL,
	`canonical_unit` text NOT NULL,
	`observable_measure` text NOT NULL,
	`unit_semantics` text NOT NULL,
	`population` text NOT NULL,
	`time_window` text NOT NULL,
	`direction` text NOT NULL,
	`measurement_state` text NOT NULL,
	`attribution_state` text NOT NULL,
	`service_outputs_json` text DEFAULT '[]' NOT NULL,
	`administrative_proxies_json` text DEFAULT '[]' NOT NULL,
	`required_inputs_json` text DEFAULT '[]' NOT NULL,
	`allowed_claims_json` text DEFAULT '[]' NOT NULL,
	`blocked_claims_json` text DEFAULT '[]' NOT NULL,
	`equity_cuts_json` text DEFAULT '[]' NOT NULL,
	`qaly_state` text NOT NULL,
	`wellby_state` text NOT NULL,
	`display_order` integer NOT NULL,
	`ontology_version` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `local_outcomes_slug_idx` ON `local_outcomes` (`slug`);
--> statement-breakpoint
CREATE INDEX `local_outcomes_version_order_idx` ON `local_outcomes` (`ontology_version`,`display_order`);
--> statement-breakpoint
CREATE TABLE `local_outcome_sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`outcome_id` integer NOT NULL,
	`source_key` text NOT NULL,
	`publisher` text NOT NULL,
	`title` text NOT NULL,
	`source_url` text NOT NULL,
	`published_at` text,
	`date_precision` text NOT NULL,
	`retrieved_at` integer NOT NULL,
	`monitor_mode` text NOT NULL,
	`coverage_note` text NOT NULL,
	`ontology_version` text NOT NULL,
	FOREIGN KEY (`outcome_id`) REFERENCES `local_outcomes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `local_outcome_sources_outcome_source_version_idx` ON `local_outcome_sources` (`outcome_id`,`source_key`,`ontology_version`);
--> statement-breakpoint
CREATE INDEX `local_outcome_sources_version_idx` ON `local_outcome_sources` (`ontology_version`,`source_key`);
--> statement-breakpoint
CREATE TABLE `local_outcome_overlaps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`left_outcome_id` integer NOT NULL,
	`right_outcome_id` integer NOT NULL,
	`risk` text NOT NULL,
	`treatment_rule` text NOT NULL,
	`ontology_version` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`left_outcome_id`) REFERENCES `local_outcomes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`right_outcome_id`) REFERENCES `local_outcomes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `local_outcome_overlaps_pair_version_idx` ON `local_outcome_overlaps` (`left_outcome_id`,`right_outcome_id`,`ontology_version`);
--> statement-breakpoint
CREATE INDEX `local_outcome_overlaps_version_idx` ON `local_outcome_overlaps` (`ontology_version`);
