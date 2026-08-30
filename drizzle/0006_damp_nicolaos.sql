CREATE TABLE `grant_organization_roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`grant_id` integer NOT NULL,
	`organization_id` integer NOT NULL,
	`role` text NOT NULL,
	`source_name` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`grant_id`) REFERENCES `grants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `grant_organization_roles_grant_org_role_idx` ON `grant_organization_roles` (`grant_id`,`organization_id`,`role`);--> statement-breakpoint
CREATE INDEX `grant_organization_roles_organization_role_idx` ON `grant_organization_roles` (`organization_id`,`role`,`grant_id`);--> statement-breakpoint
CREATE INDEX `grant_organization_roles_grant_role_idx` ON `grant_organization_roles` (`grant_id`,`role`,`position`);--> statement-breakpoint
CREATE TABLE `organization_source_names` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_id` integer NOT NULL,
	`organization_id` integer NOT NULL,
	`source_name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`identity_basis` text NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organization_source_names_source_normalized_idx` ON `organization_source_names` (`source_id`,`normalized_name`);--> statement-breakpoint
CREATE INDEX `organization_source_names_organization_idx` ON `organization_source_names` (`organization_id`);--> statement-breakpoint
PRAGMA optimize;
