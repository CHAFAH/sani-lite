CREATE TABLE `access_control` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeId` int NOT NULL,
	`resource` varchar(255) NOT NULL,
	`permission` enum('read','write','admin','execute') NOT NULL,
	`grantedBy` int NOT NULL,
	`grantedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`revokedAt` timestamp,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `access_control_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_chat_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`userId` int NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`context` varchar(255),
	`confidence` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_chat_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`userId` int NOT NULL,
	`keyName` varchar(255) NOT NULL,
	`keyHash` varchar(255) NOT NULL,
	`rateLimit` int NOT NULL DEFAULT 1000,
	`status` enum('active','revoked') NOT NULL DEFAULT 'active',
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`revokedAt` timestamp,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_keys_keyHash_unique` UNIQUE(`keyHash`)
);
--> statement-breakpoint
CREATE TABLE `app_provisioning` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeId` int NOT NULL,
	`appName` varchar(255) NOT NULL,
	`accessLevel` enum('viewer','editor','admin') NOT NULL DEFAULT 'viewer',
	`status` enum('pending','provisioned','revoked') NOT NULL DEFAULT 'pending',
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`approvedAt` timestamp,
	`approvedBy` int,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `app_provisioning_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`departmentId` int,
	`category` varchar(100) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`spent` decimal(12,2) NOT NULL DEFAULT '0',
	`period` enum('monthly','quarterly','annual') NOT NULL DEFAULT 'monthly',
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `card_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cardId` int NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`merchant` varchar(255) NOT NULL,
	`category` varchar(100),
	`description` text,
	`transactionDate` timestamp NOT NULL,
	`status` enum('pending','completed','declined') NOT NULL DEFAULT 'completed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `card_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `corporate_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeId` int NOT NULL,
	`cardNumber` varchar(20) NOT NULL,
	`cardholderName` varchar(255) NOT NULL,
	`expiryDate` varchar(5) NOT NULL,
	`limit` decimal(12,2) NOT NULL,
	`spent` decimal(12,2) NOT NULL DEFAULT '0',
	`status` enum('active','suspended','cancelled') NOT NULL DEFAULT 'active',
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	`cancelledAt` timestamp,
	CONSTRAINT `corporate_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeId` int NOT NULL,
	`deviceType` enum('laptop','desktop','phone','tablet','other') NOT NULL,
	`deviceName` varchar(255) NOT NULL,
	`serialNumber` varchar(255) NOT NULL,
	`os` varchar(100),
	`osVersion` varchar(100),
	`status` enum('active','inactive','lost','decommissioned') NOT NULL DEFAULT 'active',
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`decommissionedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `devices_id` PRIMARY KEY(`id`),
	CONSTRAINT `devices_serialNumber_unique` UNIQUE(`serialNumber`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeId` int NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`category` enum('travel','meals','office','software','other') NOT NULL,
	`description` text NOT NULL,
	`receiptUrl` text,
	`status` enum('draft','submitted','approved','rejected','reimbursed') NOT NULL DEFAULT 'draft',
	`approvedBy` int,
	`approvedAt` timestamp,
	`reimbursedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplace_apps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appName` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`logoUrl` text,
	`developerName` varchar(255) NOT NULL,
	`developerEmail` varchar(320) NOT NULL,
	`apiDocUrl` text,
	`status` enum('draft','published','deprecated') NOT NULL DEFAULT 'draft',
	`rating` decimal(3,2) DEFAULT '0',
	`downloads` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplace_apps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplace_installations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`appId` int NOT NULL,
	`installationKey` varchar(255) NOT NULL,
	`status` enum('active','inactive','uninstalled') NOT NULL DEFAULT 'active',
	`installedAt` timestamp NOT NULL DEFAULT (now()),
	`uninstalledAt` timestamp,
	CONSTRAINT `marketplace_installations_id` PRIMARY KEY(`id`),
	CONSTRAINT `marketplace_installations_installationKey_unique` UNIQUE(`installationKey`)
);
--> statement-breakpoint
CREATE TABLE `predictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeId` int NOT NULL,
	`predictionType` enum('attrition','burnout','promotion_readiness','performance') NOT NULL,
	`score` decimal(5,2) NOT NULL,
	`confidence` decimal(5,2) NOT NULL,
	`reasoning` text,
	`actionRecommended` text,
	`status` enum('active','addressed','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `predictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeId` int NOT NULL,
	`recommendationType` enum('promotion','skill_development','team_change','wellness','engagement') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`status` enum('pending','accepted','rejected','completed') NOT NULL DEFAULT 'pending',
	`acceptedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webhookId` int NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`payload` text NOT NULL,
	`status` enum('pending','delivered','failed') NOT NULL DEFAULT 'pending',
	`retries` int NOT NULL DEFAULT 0,
	`nextRetryAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhook_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`userId` int NOT NULL,
	`webhookName` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`events` varchar(500) NOT NULL,
	`secret` varchar(255) NOT NULL,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`lastTriggeredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhooks_id` PRIMARY KEY(`id`)
);
