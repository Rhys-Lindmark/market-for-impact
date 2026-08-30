CREATE TABLE `funding_tranches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`assessment_id` integer NOT NULL,
	`tranche_key` text NOT NULL,
	`evaluator_slug` text NOT NULL,
	`cause` text NOT NULL,
	`status` text NOT NULL,
	`amount_usd` real,
	`capacity_usd` real,
	`time_window` text NOT NULL,
	`funding_use` text NOT NULL,
	`confidence_label` text NOT NULL,
	`confidence_basis` text NOT NULL,
	`marginal_metric_name` text,
	`marginal_metric_value` real,
	`marginal_metric_unit` text,
	`likely_counterfactual_funder` text,
	`counterfactual_basis` text NOT NULL,
	`model_version` text NOT NULL,
	`reference_url` text NOT NULL,
	`limitations` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `funding_tranches_key_idx` ON `funding_tranches` (`tranche_key`);--> statement-breakpoint
CREATE INDEX `funding_tranches_status_window_idx` ON `funding_tranches` (`status`,`time_window`);--> statement-breakpoint
CREATE INDEX `funding_tranches_evaluator_cause_idx` ON `funding_tranches` (`evaluator_slug`,`cause`);--> statement-breakpoint
CREATE INDEX `funding_tranches_assessment_idx` ON `funding_tranches` (`assessment_id`);