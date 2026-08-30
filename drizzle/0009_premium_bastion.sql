CREATE TABLE `ai_safety_organization_roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_id` integer NOT NULL,
	`organization_id` integer NOT NULL,
	`taxonomy_version` text NOT NULL,
	`role_key` text NOT NULL,
	`primary_role` integer DEFAULT false NOT NULL,
	`evidence_basis_json` text DEFAULT '[]' NOT NULL,
	`source_grant_count` integer NOT NULL,
	`source_amount_usd` real NOT NULL,
	`founders_pledge_status` text,
	`limitations` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ai_safety_roles_org_taxonomy_role_idx` ON `ai_safety_organization_roles` (`organization_id`,`taxonomy_version`,`role_key`);--> statement-breakpoint
CREATE INDEX `ai_safety_roles_role_amount_idx` ON `ai_safety_organization_roles` (`role_key`,`source_amount_usd`);--> statement-breakpoint
CREATE INDEX `ai_safety_roles_source_idx` ON `ai_safety_organization_roles` (`source_id`);