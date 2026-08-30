ALTER TABLE `grants` ADD `source_record_id` text;--> statement-breakpoint
ALTER TABLE `grants` ADD `source_url` text;--> statement-breakpoint
ALTER TABLE `grants` ADD `award_date` integer;--> statement-breakpoint
ALTER TABLE `grants` ADD `source_published_at` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `grants_source_record_idx` ON `grants` (`source_id`,`source_record_id`);