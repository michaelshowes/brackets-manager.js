import { relations } from 'drizzle-orm';
import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { participant } from './participant.js';
import { stage } from './stage.js';

// A tournament that can contain multiple stages and participants.
export const tournament = pgTable('tournament', {
    id: text('id').primaryKey(),
    // Name of the tournament
    name: text('name').notNull(),
    // URL-friendly slug for the tournament
    slug: text('slug').notNull(),
    // Description of the tournament
    description: text('description'),
    // Start date of the tournament
    startDate: timestamp('start_date'),
    // End date of the tournament
    endDate: timestamp('end_date'),
    // Additional data for the tournament
    extra: jsonb('extra'),
});

export const tournamentRelations = relations(tournament, ({ many }) => ({
    stages: many(stage),
    participants: many(participant),
}));

export type Tournament = typeof tournament.$inferSelect;
export type NewTournament = typeof tournament.$inferInsert;
