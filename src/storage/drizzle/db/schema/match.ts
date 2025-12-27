import { integer, jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { stage } from './stage';
import { group } from './group';
import { round } from './round';
import { matchGame } from './match-game';
import type { ParticipantResult } from '@/model';

// A match in a round.
export const match = pgTable('match', {
    id: text('id').primaryKey(),
    // ID of the parent stage.
    stage_id: text('stage_id')
        .notNull()
        .references(() => stage.id),
    // ID of the parent group.
    group_id: text('group_id')
        .notNull()
        .references(() => group.id),
    // ID of the parent round.
    round_id: text('round_id')
        .notNull()
        .references(() => round.id),
    // The number of the match in its round
    number: integer('number').notNull(),
    // The count of match games this match has.
    child_count: integer('child_count').notNull(),
    // Status of the match (0=Locked, 1=Waiting, 2=Ready, 3=Running, 4=Completed, 5=Archived)
    status: integer('status').notNull(),
    // First opponent of the match (embedded as JSONB)
    opponent1: jsonb('opponent1').$type<ParticipantResult | null>(),
    // Second opponent of the match (embedded as JSONB)
    opponent2: jsonb('opponent2').$type<ParticipantResult | null>(),
});

export const matchRelations = relations(match, ({ one, many }) => ({
    stage: one(stage, {
        fields: [match.stage_id],
        references: [stage.id],
    }),
    group: one(group, {
        fields: [match.group_id],
        references: [group.id],
    }),
    round: one(round, {
        fields: [match.round_id],
        references: [round.id],
    }),
    games: many(matchGame),
}));

export type Match = typeof match.$inferSelect;
export type NewMatch = typeof match.$inferInsert;
