ALTER TABLE `companies` ADD `email` varchar(320);--> statement-breakpoint
ALTER TABLE `companies` ADD `phone` varchar(30);--> statement-breakpoint
ALTER TABLE `companies` ADD `country` varchar(100);--> statement-breakpoint
ALTER TABLE `companies` ADD `address` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `onboardingCompleted` boolean DEFAULT false;