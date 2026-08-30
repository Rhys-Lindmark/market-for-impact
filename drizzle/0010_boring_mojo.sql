CREATE TABLE `impact_conversion_models` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_id` integer NOT NULL,
	`evaluator_id` integer,
	`model_key` text NOT NULL,
	`name` text NOT NULL,
	`status` text NOT NULL,
	`source_unit` text NOT NULL,
	`target_unit` text NOT NULL,
	`formula` text NOT NULL,
	`model_version` text NOT NULL,
	`effective_at` integer,
	`parameters_json` text DEFAULT '[]' NOT NULL,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`limitations_json` text DEFAULT '[]' NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`evaluator_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `impact_conversion_models_key_idx` ON `impact_conversion_models` (`model_key`);--> statement-breakpoint
CREATE INDEX `impact_conversion_models_status_target_idx` ON `impact_conversion_models` (`status`,`target_unit`);--> statement-breakpoint
CREATE INDEX `impact_conversion_models_evaluator_idx` ON `impact_conversion_models` (`evaluator_id`);