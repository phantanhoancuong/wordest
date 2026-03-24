CREATE TABLE `player_stats` (
	`user_id` text NOT NULL,
	`session_type` text NOT NULL,
	`ruleset` text NOT NULL,
	`word_length` integer NOT NULL,
	`games_played` integer DEFAULT 0 NOT NULL,
	`games_won` integer DEFAULT 0 NOT NULL,
	`games_lost` integer DEFAULT 0 NOT NULL,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`max_streak` integer DEFAULT 0 NOT NULL,
	`guess_distribution` text DEFAULT '[0,0,0,0,0,0]',
	`last_completed` integer DEFAULT 'null',
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`user_id`, `session_type`, `ruleset`, `word_length`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `player_stats_user_idx` ON `player_stats` (`user_id`);