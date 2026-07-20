CREATE TABLE `trips` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`passenger` text NOT NULL,
	`surname` text DEFAULT '' NOT NULL,
	`origin` text NOT NULL,
	`destination` text NOT NULL,
	`departure_date` text NOT NULL,
	`departure_time` text DEFAULT '' NOT NULL,
	`airline` text NOT NULL,
	`locator` text NOT NULL,
	`status` text DEFAULT 'Confirmada' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
