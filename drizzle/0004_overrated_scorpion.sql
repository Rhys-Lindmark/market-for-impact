ALTER TABLE `grants` ADD `topics_json` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `grants` ADD `funders_json` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `grants` ADD `countries_json` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `assessments_source_org_status_idx` ON `assessments` (`source_id`,`organization_id`,`recommendation_status`);