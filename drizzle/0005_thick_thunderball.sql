CREATE INDEX `grants_advising_funder_idx` ON `grants` (`advising_funder_id`);--> statement-breakpoint
CREATE INDEX `grants_originating_funder_idx` ON `grants` (`originating_funder_id`);--> statement-breakpoint
PRAGMA optimize;
