import { pgTable, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tournament } from './tournament';

// A participant of a stage (team or individual).
export const participant = pgTable('participant', {
    id: text('id').primaryKey(),
    tournament_id: text('tournament_id')
        .notNull()
        .references(() => tournament.id),
    // Name of the participant
    name: text('name').notNull(),
});

export const participantRelations = relations(participant, ({ one }) => ({
    tournament: one(tournament, {
        fields: [participant.tournament_id],
        references: [tournament.id],
    }),
}));

export type Participant = typeof participant.$inferSelect;
export type NewParticipant = typeof participant.$inferInsert;
