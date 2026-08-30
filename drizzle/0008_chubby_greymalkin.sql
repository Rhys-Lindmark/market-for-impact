CREATE TABLE `assessment_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`assessment_id` integer NOT NULL,
	`metric_key` text NOT NULL,
	`program` text NOT NULL,
	`value` real NOT NULL,
	`confidence_low` real,
	`confidence_high` real,
	`unit` text NOT NULL,
	`model_version` text,
	`limitations` text,
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assessment_metrics_assessment_key_idx` ON `assessment_metrics` (`assessment_id`,`metric_key`);--> statement-breakpoint
CREATE INDEX `assessment_metrics_assessment_idx` ON `assessment_metrics` (`assessment_id`);--> statement-breakpoint
ALTER TABLE `assessments` ADD `funding_capacity_usd` real;--> statement-breakpoint
ALTER TABLE `assessments` ADD `funding_capacity_period` text;