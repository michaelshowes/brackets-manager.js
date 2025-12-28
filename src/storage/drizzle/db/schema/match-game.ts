import type { ParticipantResult } from '@/model/index.js';
import { relations } from 'drizzle-orm';
import { integer, jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import { match } from './match.js';
import { stage } from './stage.js';

// A game within a match.
export const matchGame = pgTable('match_game', {
    id: text('id').primaryKey(),
    // ID of the parent stage.
    stageId: text('stage_id')
        .notNull()
        .references(() => stage.id),
    // ID of the parent match.
    parentId: text('parent_id')
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
        fields: [matchGame.stageId],
        references: [stage.id],
    }),
    match: one(match, {
        fields: [matchGame.parentId],
        references: [match.id],
    }),
}));

export type MatchGame = typeof matchGame.$inferSelect;
export type NewMatchGame = typeof matchGame.$inferInsert;
