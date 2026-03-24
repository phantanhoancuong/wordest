PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_player_stats` (
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
	`last_completed` integer DEFAULT (unixepoch()) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`user_id`, `session_type`, `ruleset`, `word_length`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_player_stats`("user_id", "session_type", "ruleset", "word_length", "games_played", "games_won", "games_lost", "current_streak", "max_streak", "guess_distribution", "last_completed", "created_at", "updated_at") SELECT "user_id", "session_type", "ruleset", "word_length", "games_played", "games_won", "games_lost", "current_streak", "max_streak", "guess_distribution", "last_completed", "created_at", "updated_at" FROM `player_stats`;--> statement-breakpoint
DROP TABLE `player_stats`;--> statement-breakpoint
ALTER TABLE `__new_player_stats` RENAME TO `player_stats`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `player_stats_user_idx` ON `player_stats` (`user_id`);