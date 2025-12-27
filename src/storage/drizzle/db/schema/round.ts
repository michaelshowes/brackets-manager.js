import { integer, pgTable, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { stage } from './stage';
import { group } from './group';
import { match } from './match';

// A round of a group.
export const round = pgTable('round', {
    id: text('id').primaryKey(),
    // ID of the parent stage.
    stage_id: text('stage_id')
        .notNull()
        .references(() => stage.id),
    // ID of the parent group.
    group_id: text('group_id')
        .notNull()
        .references(() => group.id),
    // The number of the round in its group
    number: integer('number').notNull(),
});

export const roundRelations = relations(round, ({ one, many }) => ({
    stage: one(stage, {
        fields: [round.stage_id],
        references: [stage.id],
    }),
    group: one(group, {
        fields: [round.group_id],
        references: [group.id],
    }),
    matches: many(match),
}));

export type Round = typeof round.$inferSelect;
export type NewRound = typeof round.$inferInsert;
