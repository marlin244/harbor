CREATE TABLE `assets` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`inventoryCode` varchar(255) NOT NULL,
	`status` enum('available','maintenance','unavailable') NOT NULL DEFAULT 'available',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `assets_inventoryCode_unique` UNIQUE(`inventoryCode`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` varchar(64) NOT NULL,
	`resourceType` enum('room','asset') NOT NULL,
	`resourceId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`start` varchar(64) NOT NULL,
	`end` varchar(64) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`capacity` int NOT NULL,
	`features` json NOT NULL DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rooms_id` PRIMARY KEY(`id`)
);
