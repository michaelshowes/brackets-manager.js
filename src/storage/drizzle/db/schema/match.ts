import type { ParticipantResult } from '@/model/index.js';
import { relations } from 'drizzle-orm';
import { integer, jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import { group } from './group.js';
import { matchGame } from './match-game.js';
import { round } from './round.js';
import { stage } from './stage.js';

// A match in a round.
export const match = pgTable('match', {
    id: text('id').primaryKey(),
    // ID of the parent stage.
    stageId: text('stage_id')
        .notNull()
        .references(() => stage.id),
    // ID of the parent group.
    groupId: text('group_id')
        .notNull()
        .references(() => group.id),
    // ID of the parent round.
    roundId: text('round_id')
        .notNull()
        .references(() => round.id),
    // The number of the match in its round
    number: integer('number').notNull(),
    // The count of match games this match has.
    childCount: integer('child_count').notNull(),
    // Status of the match (0=Locked, 1=Waiting, 2=Ready, 3=Running, 4=Completed, 5=Archived)
    status: integer('status').notNull(),
    // First opponent of the match (embedded as JSONB)
    opponent1: jsonb('opponent1').$type<ParticipantResult | null>(),
    // Second opponent of the match (embedded as JSONB)
    opponent2: jsonb('opponent2').$type<ParticipantResult | null>(),
});

export const matchRelations = relations(match, ({ one, many }) => ({
    stage: one(stage, {
        fields: [match.stageId],
        references: [stage.id],
    }),
    group: one(group, {
        fields: [match.groupId],
        references: [group.id],
    }),
    round: one(round, {
        fields: [match.roundId],
        references: [round.id],
    }),
    games: many(matchGame),
}));

export type Match = typeof match.$inferSelect;
export type NewMatch = typeof match.$inferInsert;
