import { relations } from 'drizzle-orm';
import { integer, pgTable, text } from 'drizzle-orm/pg-core';
import { match } from './match.js';
import { round } from './round.js';
import { stage } from './stage.js';

// A group of a stage.
export const group = pgTable('group', {
    id: text('id').primaryKey(),
    // ID of the parent stage.
    stageId: text('stage_id')
        .notNull()
        .references(() => stage.id),
    // The number of the group in its stage
    number: integer('number').notNull(),
});

export const groupRelations = relations(group, ({ one, many }) => ({
    stage: one(stage, {
        fields: [group.stageId],
        references: [stage.id],
    }),
    rounds: many(round),
    matches: many(match),
}));

export type Group = typeof group.$inferSelect;
export type NewGroup = typeof group.$inferInsert;
