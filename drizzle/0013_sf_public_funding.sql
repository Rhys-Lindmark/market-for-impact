CREATE TABLE `sf_public_funding_sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_key` text NOT NULL,
	`dataset_id` text NOT NULL,
	`publisher` text NOT NULL,
	`title` text NOT NULL,
	`public_url` text NOT NULL,
	`query_url` text NOT NULL,
	`amount_semantics` text NOT NULL,
	`data_as_of` text,
	`source_updated_at` integer NOT NULL,
	`retrieved_at` integer NOT NULL,
	`source_row_count` integer NOT NULL,
	`semantic_hash` text NOT NULL,
	`snapshot_version` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sf_public_funding_sources_key_version_idx` ON `sf_public_funding_sources` (`source_key`,`snapshot_version`);
--> statement-breakpoint
CREATE TABLE `sf_department_budgets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`department_code` text NOT NULL,
	`department` text NOT NULL,
	`fiscal_year` text NOT NULL,
	`budget_usd` real NOT NULL,
	`outcome_keys_json` text NOT NULL DEFAULT '[]',
	`data_as_of` text,
	`data_loaded_at` text,
	`snapshot_version` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sf_department_budgets_code_year_version_idx` ON `sf_department_budgets` (`department_code`,`fiscal_year`,`snapshot_version`);
--> statement-breakpoint
CREATE INDEX `sf_department_budgets_version_code_idx` ON `sf_department_budgets` (`snapshot_version`,`department_code`);
--> statement-breakpoint
CREATE TABLE `sf_public_contracts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contract_number` text NOT NULL,
	`contract_title` text,
	`term_start_date` text NOT NULL,
	`term_end_date` text NOT NULL,
	`contract_type` text,
	`purchasing_authority` text,
	`department_code` text NOT NULL,
	`department` text NOT NULL,
	`prime_contractor` text NOT NULL,
	`scope_of_work` text,
	`award_usd` real,
	`outstanding_purchase_orders_usd` real,
	`payments_made_usd` real,
	`remaining_authority_usd` real,
	`data_as_of` text,
	`data_loaded_at` text,
	`snapshot_version` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sf_public_contracts_number_version_idx` ON `sf_public_contracts` (`contract_number`,`snapshot_version`);
--> statement-breakpoint
CREATE INDEX `sf_public_contracts_version_award_idx` ON `sf_public_contracts` (`snapshot_version`,`award_usd`);
--> statement-breakpoint
CREATE INDEX `sf_public_contracts_version_department_idx` ON `sf_public_contracts` (`snapshot_version`,`department_code`);
--> statement-breakpoint
CREATE TABLE `sf_public_contract_outcomes` (
	`contract_id` integer NOT NULL,
	`outcome_id` integer NOT NULL,
	`match_reason` text NOT NULL,
	`snapshot_version` text NOT NULL,
	PRIMARY KEY (`contract_id`,`outcome_id`,`snapshot_version`),
	FOREIGN KEY (`contract_id`) REFERENCES `sf_public_contracts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`outcome_id`) REFERENCES `local_outcomes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `sf_public_contract_outcomes_version_outcome_idx` ON `sf_public_contract_outcomes` (`snapshot_version`,`outcome_id`);
