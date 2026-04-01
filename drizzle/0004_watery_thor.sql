CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`type` enum('general','urgent','celebration','policy') NOT NULL DEFAULT 'general',
	`authorId` int NOT NULL,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `benefit_enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeId` int NOT NULL,
	`planId` int NOT NULL,
	`status` enum('enrolled','pending','waived','terminated') NOT NULL DEFAULT 'pending',
	`enrolledAt` timestamp,
	`effectiveDate` timestamp,
	`terminationDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `benefit_enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `benefit_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('health','dental','vision','life','retirement','wellness','other') NOT NULL,
	`description` text,
	`provider` varchar(255),
	`cost` decimal(10,2),
	`employerContribution` decimal(10,2),
	`isActive` boolean DEFAULT true,
	`eligibility` varchar(255) DEFAULT 'all_employees',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `benefit_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compensation_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeId` int NOT NULL,
	`type` enum('base_salary','bonus','equity','commission','adjustment') NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`effectiveDate` timestamp NOT NULL,
	`endDate` timestamp,
	`reason` text,
	`approvedBy` int,
	`status` enum('pending','approved','active','expired') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `compensation_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`courseId` int NOT NULL,
	`employeeId` int NOT NULL,
	`status` enum('assigned','in_progress','completed','overdue') NOT NULL DEFAULT 'assigned',
	`progress` int DEFAULT 0,
	`dueDate` timestamp,
	`completedAt` timestamp,
	`assignedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`duration` int,
	`type` enum('required','optional','recommended') DEFAULT 'optional',
	`contentUrl` text,
	`thumbnailUrl` text,
	`isActive` boolean DEFAULT true,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('individual','team','company') NOT NULL DEFAULT 'individual',
	`status` enum('not_started','in_progress','completed','cancelled') NOT NULL DEFAULT 'not_started',
	`progress` int DEFAULT 0,
	`dueDate` timestamp,
	`parentGoalId` int,
	`period` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_postings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`department` varchar(100),
	`location` varchar(255),
	`type` enum('full_time','part_time','contract','internship') DEFAULT 'full_time',
	`description` text,
	`requirements` text,
	`salaryMin` decimal(12,2),
	`salaryMax` decimal(12,2),
	`currency` varchar(3) DEFAULT 'USD',
	`status` enum('draft','open','closed','on_hold') NOT NULL DEFAULT 'draft',
	`hiringManagerId` int,
	`applicantCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_postings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payroll_cycles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`payDate` timestamp NOT NULL,
	`status` enum('draft','processing','approved','paid','cancelled') NOT NULL DEFAULT 'draft',
	`totalGross` decimal(14,2) DEFAULT '0',
	`totalNet` decimal(14,2) DEFAULT '0',
	`totalDeductions` decimal(14,2) DEFAULT '0',
	`employeeCount` int DEFAULT 0,
	`approvedBy` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payroll_cycles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salary_bands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`level` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`department` varchar(100),
	`minSalary` decimal(12,2) NOT NULL,
	`midSalary` decimal(12,2) NOT NULL,
	`maxSalary` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `salary_bands_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `time_off_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeId` int NOT NULL,
	`type` enum('vacation','sick','personal','parental','bereavement','other') NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`days` int NOT NULL,
	`reason` text,
	`status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`approvedBy` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `time_off_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflow_instances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workflowId` int NOT NULL,
	`companyId` int NOT NULL,
	`employeeId` int,
	`currentStep` int NOT NULL DEFAULT 0,
	`status` enum('in_progress','completed','cancelled','paused') NOT NULL DEFAULT 'in_progress',
	`data` json,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workflow_instances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`triggerType` enum('new_hire','offboarding','promotion','time_off','review_cycle','custom') NOT NULL,
	`steps` json,
	`isActive` boolean DEFAULT true,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workflows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `employee_profiles` ADD `managerId` int;--> statement-breakpoint
ALTER TABLE `employee_profiles` ADD `salary` decimal(12,2);--> statement-breakpoint
ALTER TABLE `employee_profiles` ADD `currency` varchar(3) DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE `employee_profiles` ADD `country` varchar(100);--> statement-breakpoint
ALTER TABLE `employee_profiles` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `hiring_records` ADD `jobPostingId` int;--> statement-breakpoint
ALTER TABLE `hiring_records` ADD `candidatePhone` varchar(20);--> statement-breakpoint
ALTER TABLE `hiring_records` ADD `resumeUrl` text;--> statement-breakpoint
ALTER TABLE `hiring_records` ADD `source` varchar(100);--> statement-breakpoint
ALTER TABLE `hiring_records` ADD `interviewDate` timestamp;--> statement-breakpoint
ALTER TABLE `hiring_records` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `hiring_records` ADD `rating` int;--> statement-breakpoint
ALTER TABLE `performance_reviews` ADD `strengths` text;--> statement-breakpoint
ALTER TABLE `performance_reviews` ADD `improvements` text;