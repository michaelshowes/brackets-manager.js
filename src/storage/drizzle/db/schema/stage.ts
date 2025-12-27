import { integer, jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { stageTypeEnum } from './enums';
import { tournament } from './tournament';
import { group } from './group';
import { round } from './round';
import { match } from './match';
import { matchGame } from './match-game';

// A stage, which can be a round-robin stage or a single/double elimination stage.
export const stage = pgTable('stage', {
    id: text('id').primaryKey(),
    tournament_id: text('tournament_id')
        .notNull()
        .references(() => tournament.id),
    // Name of the stage
    name: text('name').notNull(),
    // Type of the stage
    type: stageTypeEnum('type').notNull(),
    // The number of the stage in its tournament
    number: integer('number').notNull(),
    // Settings of the stage (embedded as JSONB to match model)
    settings: jsonb('settings').notNull().$type<{
        size?: number;
        seedOrdering?: string[];
        balanceByes?: boolean;
        matchesChildCount?: number;
        groupCount?: number;
        roundRobinMode?: 'simple' | 'double';
        manualOrdering?: number[][];
        consolationFinal?: boolean;
        skipFirstRound?: boolean;
        grandFinal?: 'none' | 'simple' | 'double';
    }>(),
});

export const stageRelations = relations(stage, ({ one, many }) => ({
    tournament: one(tournament, {
        fields: [stage.tournament_id],
        references: [tournament.id],
    }),
    groups: many(group),
    rounds: many(round),
    matches: many(match),
    matchGames: many(matchGame),
}));

export type Stage = typeof stage.$inferSelect;
export type NewStage = typeof stage.$inferInsert;
