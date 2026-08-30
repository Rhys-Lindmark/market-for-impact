CREATE TABLE `impact_benchmarks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_id` integer NOT NULL,
	`evaluator_id` integer NOT NULL,
	`comparator_organization_id` integer,
	`benchmark_key` text NOT NULL,
	`name` text NOT NULL,
	`benchmark_type` text NOT NULL,
	`effective_at` integer,
	`model_version` text NOT NULL,
	`reference_benchmark_key` text,
	`estimate_low` real,
	`estimate_high` real,
	`unit_name` text NOT NULL,
	`units_per_usd` real,
	`currency_basis` text,
	`population_basis` text,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`limitations_json` text DEFAULT '[]' NOT NULL,
	`model_url` text,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`evaluator_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`comparator_organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `impact_benchmarks_key_idx` ON `impact_benchmarks` (`benchmark_key`);--> statement-breakpoint
CREATE INDEX `impact_benchmarks_evaluator_type_idx` ON `impact_benchmarks` (`evaluator_id`,`benchmark_type`);--> statement-breakpoint
CREATE INDEX `impact_benchmarks_comparator_idx` ON `impact_benchmarks` (`comparator_organization_id`);