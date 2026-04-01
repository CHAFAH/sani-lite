ALTER TABLE `payroll_records` MODIFY COLUMN `deductions` decimal(12,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `payroll_records` MODIFY COLUMN `currency` varchar(3) NOT NULL DEFAULT 'USD';