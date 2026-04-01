CREATE TABLE `demo_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`company` varchar(255) NOT NULL,
	`jobTitle` varchar(255),
	`companySize` varchar(50),
	`primaryInterest` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `demo_leads_id` PRIMARY KEY(`id`)
);
