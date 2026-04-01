CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`industry` varchar(100),
	`size` varchar(50),
	`website` varchar(255),
	`customDomain` varchar(255),
	`logoUrl` text,
	`primaryColor` varchar(7) DEFAULT '#0D9488',
	`secondaryColor` varchar(7) DEFAULT '#F59E0B',
	`subscriptionTier` enum('starter','growth','enterprise') NOT NULL DEFAULT 'starter',
	`status` enum('onboarding','active','suspended','cancelled') NOT NULL DEFAULT 'onboarding',
	`kycVerified` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`),
	CONSTRAINT `companies_customDomain_unique` UNIQUE(`customDomain`)
);
--> statement-breakpoint
CREATE TABLE `employee_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`companyId` int NOT NULL,
	`documentType` enum('employment_contract','offer_letter','nda','handbook','other') NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`uploadedBy` int NOT NULL,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employee_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employee_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyId` int NOT NULL,
	`employeeId` varchar(50),
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`department` varchar(100),
	`position` varchar(100),
	`manager` varchar(100),
	`startDate` timestamp,
	`endDate` timestamp,
	`employmentType` enum('full_time','part_time','contract','temporary') DEFAULT 'full_time',
	`status` enum('active','inactive','on_leave','offboarded') NOT NULL DEFAULT 'active',
	`contractUrl` text,
	`profilePictureUrl` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employee_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hiring_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`jobTitle` varchar(255) NOT NULL,
	`department` varchar(100),
	`candidateName` varchar(255) NOT NULL,
	`candidateEmail` varchar(320) NOT NULL,
	`status` enum('applied','screening','interview','offer','hired','rejected') NOT NULL DEFAULT 'applied',
	`stage` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hiring_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payroll_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeId` int NOT NULL,
	`payrollCycle` varchar(50) NOT NULL,
	`baseSalary` decimal(12,2) NOT NULL,
	`grossPay` decimal(12,2) NOT NULL,
	`deductions` decimal(12,2) DEFAULT 0,
	`netPay` decimal(12,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'USD',
	`country` varchar(100),
	`status` enum('draft','approved','processed','paid') NOT NULL DEFAULT 'draft',
	`paymentDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payroll_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeId` int NOT NULL,
	`reviewerId` int NOT NULL,
	`reviewPeriod` varchar(50) NOT NULL,
	`rating` int,
	`comments` text,
	`goals` json,
	`status` enum('draft','submitted','completed') NOT NULL DEFAULT 'draft',
	`submittedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `performance_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sso_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`provider` enum('google','microsoft','okta','custom_oidc') NOT NULL,
	`clientId` varchar(255) NOT NULL,
	`clientSecret` text NOT NULL,
	`redirectUri` varchar(255) NOT NULL,
	`enabled` boolean DEFAULT true,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sso_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`tier` enum('starter','growth','enterprise') NOT NULL,
	`seats` int NOT NULL,
	`usedSeats` int NOT NULL DEFAULT 0,
	`price` decimal(10,2) NOT NULL,
	`billingCycle` enum('monthly','annual') NOT NULL DEFAULT 'monthly',
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`status` enum('active','expired','cancelled') NOT NULL DEFAULT 'active',
	`stripeSubscriptionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('super_admin','company_owner','admin','employee') NOT NULL DEFAULT 'employee';--> statement-breakpoint
ALTER TABLE `users` ADD `companyId` int;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);