import { integer, jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { stage } from './stage';
import { match } from './match';
import type { ParticipantResult } from '@/model';

// A game within a match.
export const matchGame = pgTable('match_game', {
    id: text('id').primaryKey(),
    // ID of the parent stage.
    stage_id: text('stage_id')
        .notNull()
        .references(() => stage.id),
    // ID of the parent match.
    parent_id: text('parent_id')
        .notNull()
        .references(() => match.id),
    // The number of the match game in its match
    number: integer('number').notNull(),
    // Status of the match game (0=Locked, 1=Waiting, 2=Ready, 3=Running, 4=Completed, 5=Archived)
    status: integer('status').notNull(),
    // First opponent of the match game (embedded as JSONB)
    opponent1: jsonb('opponent1').$type<ParticipantResult | null>(),
    // Second opponent of the match game (embedded as JSONB)
    opponent2: jsonb('opponent2').$type<ParticipantResult | null>(),
});

export const matchGameRelations = relations(matchGame, ({ one }) => ({
    stage: one(stage, {
        fields: [matchGame.stage_id],
        references: [stage.id],
    }),
    match: one(match, {
        fields: [matchGame.parent_id],
        references: [match.id],
    }),
}));

export type MatchGame = typeof matchGame.$inferSelect;
export type NewMatchGame = typeof matchGame.$inferInsert;
