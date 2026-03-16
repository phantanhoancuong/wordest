CREATE TABLE `daily_games` (
	`user_id` text NOT NULL,
	`ruleset` text NOT NULL,
	`word_length` integer NOT NULL,
	`date` text NOT NULL,
	`game_state` text DEFAULT 'playing' NOT NULL,
	`locked_positions` text DEFAULT '{}' NOT NULL,
	`minimum_letter_counts` text DEFAULT '{}' NOT NULL,
	`guesses` text DEFAULT '[]' NOT NULL,
	PRIMARY KEY(`user_id`, `ruleset`, `word_length`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `daily_games_user_idx` ON `daily_games` (`user_id`);