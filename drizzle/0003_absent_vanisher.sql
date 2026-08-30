PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_grants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`external_id` text,
	`source_record_id` text,
	`source_url` text,
	`source_id` integer NOT NULL,
	`originating_funder_id` integer,
	`advising_funder_id` integer,
	`recipient_id` integer,
	`amount_usd` real,
	`amount_original` real,
	`currency` text,
	`status` text NOT NULL,
	`decision_date` integer,
	`award_date` integer,
	`source_published_at` integer,
	`source_post_id` integer,
	`recipient_names_json` text DEFAULT '[]' NOT NULL,
	`recipient_names_text` text DEFAULT '' NOT NULL,
	`focus_areas_json` text DEFAULT '[]' NOT NULL,
	`listed_funds_json` text DEFAULT '[]' NOT NULL,
	`start_date` integer,
	`end_date` integer,
	`cause` text NOT NULL,
	`intervention` text,
	`geography` text,
	`purpose` text,
	`restricted` integer,
	`grouped_grant` integer DEFAULT false NOT NULL,
	`first_seen_at` integer,
	`last_seen_at` integer,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`originating_funder_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`advising_funder_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recipient_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_grants`("id", "external_id", "source_record_id", "source_url", "source_id", "originating_funder_id", "advising_funder_id", "recipient_id", "amount_usd", "amount_original", "currency", "status", "decision_date", "award_date", "source_published_at", "start_date", "end_date", "cause", "intervention", "geography", "purpose", "restricted", "grouped_grant", "first_seen_at", "last_seen_at") SELECT "id", "external_id", "source_record_id", "source_url", "source_id", "originating_funder_id", "advising_funder_id", "recipient_id", "amount_usd", "amount_original", "currency", "status", "decision_date", "award_date", "source_published_at", "start_date", "end_date", "cause", "intervention", "geography", "purpose", "restricted", "grouped_grant", "first_seen_at", "last_seen_at" FROM `grants`;--> statement-breakpoint
DROP TABLE `grants`;--> statement-breakpoint
ALTER TABLE `__new_grants` RENAME TO `grants`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `grants_source_external_idx` ON `grants` (`source_id`,`external_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `grants_source_record_idx` ON `grants` (`source_id`,`source_record_id`);--> statement-breakpoint
CREATE INDEX `grants_cause_date_idx` ON `grants` (`cause`,`decision_date`);--> statement-breakpoint
CREATE INDEX `grants_recipient_idx` ON `grants` (`recipient_id`);--> statement-breakpoint
CREATE INDEX `grants_source_award_date_idx` ON `grants` (`source_id`,`award_date`);--> statement-breakpoint
CREATE INDEX `grants_source_amount_idx` ON `grants` (`source_id`,`amount_usd`);--> statement-breakpoint
CREATE INDEX `grants_source_seen_idx` ON `grants` (`source_id`,`last_seen_at`);
