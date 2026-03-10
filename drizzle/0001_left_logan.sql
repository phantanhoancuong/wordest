CREATE TABLE `practice_games` (
	`user_id` text NOT NULL,
	`ruleset` text NOT NULL,
	`word_length` integer NOT NULL,
	PRIMARY KEY(`user_id`, `ruleset`, `word_length`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `practice_games_user_idx` ON `practice_games` (`user_id`);