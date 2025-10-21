CREATE TABLE `api_configs` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`geminiApiKey` text,
	`facebookPageId` varchar(255),
	`facebookToken` text,
	`instagramUserId` varchar(255),
	`instagramToken` text,
	`xToken` text,
	`uploadPostApiKey` text,
	`uploadPostUser` varchar(255),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `api_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`prompt` text NOT NULL,
	`caption` text,
	`affiliateLink` varchar(512),
	`imageUrl` varchar(512),
	`postedToFacebook` boolean DEFAULT false,
	`postedToInstagram` boolean DEFAULT false,
	`postedToX` boolean DEFAULT false,
	`postedToTiktok` boolean DEFAULT false,
	`facebookPostId` varchar(255),
	`instagramPostId` varchar(255),
	`xPostId` varchar(255),
	`tiktokPostId` varchar(255),
	`status` enum('draft','generating','ready','posting','completed','failed') NOT NULL DEFAULT 'draft',
	`errorMessage` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_posts` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`prompt` text NOT NULL,
	`caption` text,
	`affiliateLink` varchar(512),
	`platforms` text NOT NULL,
	`scheduledTime` timestamp NOT NULL,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`postId` varchar(64),
	`errorMessage` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `scheduled_posts_id` PRIMARY KEY(`id`)
);
