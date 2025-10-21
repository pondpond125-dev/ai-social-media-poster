CREATE TABLE `facebook_pages` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`pageName` varchar(255) NOT NULL,
	`pageId` varchar(255) NOT NULL,
	`pageAccessToken` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `facebook_pages_id` PRIMARY KEY(`id`)
);
