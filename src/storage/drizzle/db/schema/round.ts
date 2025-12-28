import { relations } from 'drizzle-orm';
import { integer, pgTable, text } from 'drizzle-orm/pg-core';
import { group } from './group.js';
import { match } from './match.js';
import { stage } from './stage.js';

// A round of a group.
export const round = pgTable('round', {
    id: text('id').primaryKey(),
    // ID of the parent stage.
    stageId: text('stage_id')
        .notNull()
        .references(() => stage.id),
    // ID of the parent group.
    groupId: text('group_id')
        .notNull()
        .references(() => group.id),
    // The number of the round in its group
    number: integer('number').notNull(),
});

export const roundRelations = relations(round, ({ one, many }) => ({
    stage: one(stage, {
        fields: [round.stageId],
        references: [stage.id],
    }),
    group: one(group, {
        fields: [round.groupId],
        references: [group.id],
    }),
    matches: many(match),
}));

export type Round = typeof round.$inferSelect;
export type NewRound = typeof round.$inferInsert;
