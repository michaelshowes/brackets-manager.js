/**
 * Database utilities for Drizzle ORM operations.
 * Provides typed query helpers for all bracket tables.
 */

import type {
    Group,
    Id,
    Match,
    MatchGame,
    Participant,
    Round,
    Stage,
} from '@/model/index.js';
import type { DrizzleDatabase } from '@/storage/drizzle/db/index.js';
import {
    group,
    match,
    matchGame,
    participant,
    round,
    stage,
    tournament,
} from '@/storage/drizzle/db/schema/index.js';
import { and, asc, desc, eq } from 'drizzle-orm';
import type { Tournament } from './types.js';

// Re-export the database type for convenience
export type { DrizzleDatabase } from '@/storage/drizzle/db/index.js';

// Helper to convert Id to string for database queries
const toStr = (id: Id): string => String(id);

// Type casting helpers - the Drizzle schema types are compatible but
// TypeScript needs help understanding the relationship
type DrizzleStage = typeof stage.$inferSelect;
type DrizzleGroup = typeof group.$inferSelect;
type DrizzleRound = typeof round.$inferSelect;
type DrizzleMatch = typeof match.$inferSelect;
type DrizzleMatchGame = typeof matchGame.$inferSelect;
type DrizzleParticipant = typeof participant.$inferSelect;
type DrizzleTournament = typeof tournament.$inferSelect;

// Cast functions to convert Drizzle types to model types
const castStage = (s: DrizzleStage): Stage => s as unknown as Stage;
const castGroup = (g: DrizzleGroup): Group => g as unknown as Group;
const castRound = (r: DrizzleRound): Round => r as unknown as Round;
const castMatch = (m: DrizzleMatch): Match => m as unknown as Match;
const castMatchGame = (mg: DrizzleMatchGame): MatchGame =>
    mg as unknown as MatchGame;
const castParticipant = (p: DrizzleParticipant): Participant =>
    p as unknown as Participant;
const castTournament = (t: DrizzleTournament): Tournament =>
    t as unknown as Tournament;

// ============================================================================
// Tournament Operations
// ============================================================================

export const tournamentDb = {
    async getById(db: DrizzleDatabase, id: Id): Promise<Tournament | null> {
        const results = await db
            .select()
            .from(tournament)
            .where(eq(tournament.id, toStr(id)))
            .limit(1);
        return results[0] ? castTournament(results[0]) : null;
    },

    async getAll(db: DrizzleDatabase): Promise<Tournament[]> {
        const results = await db.select().from(tournament);
        return results.map(castTournament);
    },

    async insert(
        db: DrizzleDatabase,
        data: typeof tournament.$inferInsert,
    ): Promise<string> {
        await db.insert(tournament).values(data);
        return data.id;
    },

    async update(
        db: DrizzleDatabase,
        id: Id,
        data: Partial<typeof tournament.$inferInsert>,
    ): Promise<boolean> {
        await db
            .update(tournament)
            .set(data)
            .where(eq(tournament.id, toStr(id)));
        return true;
    },

    async delete(db: DrizzleDatabase, id: Id): Promise<boolean> {
        await db.delete(tournament).where(eq(tournament.id, toStr(id)));
        return true;
    },

    async deleteByFilter(
        db: DrizzleDatabase,
        filter: { id?: Id },
    ): Promise<boolean> {
        if (filter.id !== undefined) {
            await db
                .delete(tournament)
                .where(eq(tournament.id, toStr(filter.id)));
        } else {
            await db.delete(tournament);
        }
        return true;
    },
};

// ============================================================================
// Participant Operations
// ============================================================================

export const participantDb = {
    async getById(db: DrizzleDatabase, id: Id): Promise<Participant | null> {
        const results = await db
            .select()
            .from(participant)
            .where(eq(participant.id, toStr(id)))
            .limit(1);
        return results[0] ? castParticipant(results[0]) : null;
    },

    async getAll(db: DrizzleDatabase): Promise<Participant[]> {
        const results = await db.select().from(participant);
        return results.map(castParticipant);
    },

    async getByTournament(
        db: DrizzleDatabase,
        tournamentId: Id,
    ): Promise<Participant[]> {
        const results = await db
            .select()
            .from(participant)
            .where(eq(participant.tournament_id, toStr(tournamentId)));
        return results.map(castParticipant);
    },

    async getByFilter(
        db: DrizzleDatabase,
        filter: { tournament_id?: Id; name?: string },
    ): Promise<Participant[]> {
        const conditions = [];
        if (filter.tournament_id !== undefined) {
            conditions.push(
                eq(participant.tournament_id, toStr(filter.tournament_id)),
            );
        }
        if (filter.name !== undefined) {
            conditions.push(eq(participant.name, filter.name));
        }
        const results = await db
            .select()
            .from(participant)
            .where(conditions.length > 0 ? and(...conditions) : undefined);
        return results.map(castParticipant);
    },

    async insert(
        db: DrizzleDatabase,
        data:
            | typeof participant.$inferInsert
            | (typeof participant.$inferInsert)[],
    ): Promise<string | number> {
        const values = Array.isArray(data) ? data : [data];
        await db.insert(participant).values(values);
        return Array.isArray(data) ? values.length : values[0].id;
    },

    async delete(
        db: DrizzleDatabase,
        filter?: { tournament_id?: Id },
    ): Promise<boolean> {
        if (filter?.tournament_id !== undefined) {
            await db
                .delete(participant)
                .where(
                    eq(participant.tournament_id, toStr(filter.tournament_id)),
                );
        } else {
            await db.delete(participant);
        }
        return true;
    },
};

// ============================================================================
// Stage Operations
// ============================================================================

export const stageDb = {
    async getById(db: DrizzleDatabase, id: Id): Promise<Stage | null> {
        const results = await db
            .select()
            .from(stage)
            .where(eq(stage.id, toStr(id)))
            .limit(1);
        return results[0] ? castStage(results[0]) : null;
    },

    async getAll(db: DrizzleDatabase): Promise<Stage[]> {
        const results = await db
            .select()
            .from(stage)
            .orderBy(asc(stage.number));
        return results.map(castStage);
    },

    async getByTournament(
        db: DrizzleDatabase,
        tournamentId: Id,
    ): Promise<Stage[]> {
        const results = await db
            .select()
            .from(stage)
            .where(eq(stage.tournament_id, toStr(tournamentId)))
            .orderBy(asc(stage.number));
        return results.map(castStage);
    },

    async insert(
        db: DrizzleDatabase,
        data: typeof stage.$inferInsert | (typeof stage.$inferInsert)[],
    ): Promise<string | number> {
        const values = Array.isArray(data) ? data : [data];
        await db.insert(stage).values(values);
        return Array.isArray(data) ? values.length : values[0].id;
    },

    async update(
        db: DrizzleDatabase,
        id: Id,
        data: Partial<typeof stage.$inferInsert>,
    ): Promise<boolean> {
        await db
            .update(stage)
            .set(data)
            .where(eq(stage.id, toStr(id)));
        return true;
    },

    async delete(
        db: DrizzleDatabase,
        filter?: { id?: Id; tournament_id?: Id },
    ): Promise<boolean> {
        if (filter?.id !== undefined) {
            await db.delete(stage).where(eq(stage.id, toStr(filter.id)));
        } else if (filter?.tournament_id !== undefined) {
            await db
                .delete(stage)
                .where(eq(stage.tournament_id, toStr(filter.tournament_id)));
        } else {
            await db.delete(stage);
        }
        return true;
    },
};

// ============================================================================
// Group Operations
// ============================================================================

export const groupDb = {
    async getById(db: DrizzleDatabase, id: Id): Promise<Group | null> {
        const results = await db
            .select()
            .from(group)
            .where(eq(group.id, toStr(id)))
            .limit(1);
        return results[0] ? castGroup(results[0]) : null;
    },

    async getByStage(db: DrizzleDatabase, stageId: Id): Promise<Group[]> {
        const results = await db
            .select()
            .from(group)
            .where(eq(group.stage_id, toStr(stageId)))
            .orderBy(asc(group.number));
        return results.map(castGroup);
    },

    async getFirst(
        db: DrizzleDatabase,
        filter: { stage_id: Id; number?: number },
    ): Promise<Group | null> {
        const conditions = [eq(group.stage_id, toStr(filter.stage_id))];
        if (filter.number !== undefined) {
            conditions.push(eq(group.number, filter.number));
        }
        const results = await db
            .select()
            .from(group)
            .where(and(...conditions))
            .orderBy(asc(group.number))
            .limit(1);
        return results[0] ? castGroup(results[0]) : null;
    },

    async insert(
        db: DrizzleDatabase,
        data: typeof group.$inferInsert | (typeof group.$inferInsert)[],
    ): Promise<string | number> {
        const values = Array.isArray(data) ? data : [data];
        await db.insert(group).values(values);
        return Array.isArray(data) ? values.length : values[0].id;
    },

    async delete(
        db: DrizzleDatabase,
        filter?: { stage_id?: Id },
    ): Promise<boolean> {
        if (filter?.stage_id !== undefined) {
            await db
                .delete(group)
                .where(eq(group.stage_id, toStr(filter.stage_id)));
        } else {
            await db.delete(group);
        }
        return true;
    },
};

// ============================================================================
// Round Operations
// ============================================================================

export const roundDb = {
    async getById(db: DrizzleDatabase, id: Id): Promise<Round | null> {
        const results = await db
            .select()
            .from(round)
            .where(eq(round.id, toStr(id)))
            .limit(1);
        return results[0] ? castRound(results[0]) : null;
    },

    async getByStage(db: DrizzleDatabase, stageId: Id): Promise<Round[]> {
        const results = await db
            .select()
            .from(round)
            .where(eq(round.stage_id, toStr(stageId)))
            .orderBy(asc(round.number));
        return results.map(castRound);
    },

    async getByGroup(db: DrizzleDatabase, groupId: Id): Promise<Round[]> {
        const results = await db
            .select()
            .from(round)
            .where(eq(round.group_id, toStr(groupId)))
            .orderBy(asc(round.number));
        return results.map(castRound);
    },

    async getFirst(
        db: DrizzleDatabase,
        filter: { stage_id?: Id; group_id?: Id; number?: number },
    ): Promise<Round | null> {
        const conditions = [];
        if (filter.stage_id !== undefined) {
            conditions.push(eq(round.stage_id, toStr(filter.stage_id)));
        }
        if (filter.group_id !== undefined) {
            conditions.push(eq(round.group_id, toStr(filter.group_id)));
        }
        if (filter.number !== undefined) {
            conditions.push(eq(round.number, filter.number));
        }
        const results = await db
            .select()
            .from(round)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(asc(round.number))
            .limit(1);
        return results[0] ? castRound(results[0]) : null;
    },

    async getLast(
        db: DrizzleDatabase,
        filter: { group_id: Id },
    ): Promise<Round | null> {
        const results = await db
            .select()
            .from(round)
            .where(eq(round.group_id, toStr(filter.group_id)))
            .orderBy(desc(round.number))
            .limit(1);
        return results[0] ? castRound(results[0]) : null;
    },

    async insert(
        db: DrizzleDatabase,
        data: typeof round.$inferInsert | (typeof round.$inferInsert)[],
    ): Promise<string | number> {
        const values = Array.isArray(data) ? data : [data];
        await db.insert(round).values(values);
        return Array.isArray(data) ? values.length : values[0].id;
    },

    async delete(
        db: DrizzleDatabase,
        filter?: { stage_id?: Id },
    ): Promise<boolean> {
        if (filter?.stage_id !== undefined) {
            await db
                .delete(round)
                .where(eq(round.stage_id, toStr(filter.stage_id)));
        } else {
            await db.delete(round);
        }
        return true;
    },
};

// ============================================================================
// Match Operations
// ============================================================================

export const matchDb = {
    async getById(db: DrizzleDatabase, id: Id): Promise<Match | null> {
        const results = await db
            .select()
            .from(match)
            .where(eq(match.id, toStr(id)))
            .limit(1);
        return results[0] ? castMatch(results[0]) : null;
    },

    async getByStage(db: DrizzleDatabase, stageId: Id): Promise<Match[]> {
        const results = await db
            .select()
            .from(match)
            .where(eq(match.stage_id, toStr(stageId)))
            .orderBy(asc(match.number));
        return results.map(castMatch);
    },

    async getByRound(db: DrizzleDatabase, roundId: Id): Promise<Match[]> {
        const results = await db
            .select()
            .from(match)
            .where(eq(match.round_id, toStr(roundId)))
            .orderBy(asc(match.number));
        return results.map(castMatch);
    },

    async getByGroup(db: DrizzleDatabase, groupId: Id): Promise<Match[]> {
        const results = await db
            .select()
            .from(match)
            .where(eq(match.group_id, toStr(groupId)))
            .orderBy(asc(match.number));
        return results.map(castMatch);
    },

    async getFirst(
        db: DrizzleDatabase,
        filter: { round_id?: Id; group_id?: Id; number?: number },
    ): Promise<Match | null> {
        const conditions = [];
        if (filter.round_id !== undefined) {
            conditions.push(eq(match.round_id, toStr(filter.round_id)));
        }
        if (filter.group_id !== undefined) {
            conditions.push(eq(match.group_id, toStr(filter.group_id)));
        }
        if (filter.number !== undefined) {
            conditions.push(eq(match.number, filter.number));
        }
        const results = await db
            .select()
            .from(match)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(asc(match.number))
            .limit(1);
        return results[0] ? castMatch(results[0]) : null;
    },

    async insert(
        db: DrizzleDatabase,
        data: typeof match.$inferInsert | (typeof match.$inferInsert)[],
    ): Promise<string | number> {
        const values = Array.isArray(data) ? data : [data];
        await db.insert(match).values(values);
        return Array.isArray(data) ? values.length : values[0].id;
    },

    async update(
        db: DrizzleDatabase,
        id: Id,
        data: Partial<Match>,
    ): Promise<boolean> {
        await db
            .update(match)
            .set(data as Partial<typeof match.$inferInsert>)
            .where(eq(match.id, toStr(id)));
        return true;
    },

    async updateByFilter(
        db: DrizzleDatabase,
        filter: { stage_id?: Id; group_id?: Id; round_id?: Id; parent_id?: Id },
        data: Partial<Match>,
    ): Promise<boolean> {
        const conditions = [];
        if (filter.stage_id !== undefined) {
            conditions.push(eq(match.stage_id, toStr(filter.stage_id)));
        }
        if (filter.group_id !== undefined) {
            conditions.push(eq(match.group_id, toStr(filter.group_id)));
        }
        if (filter.round_id !== undefined) {
            conditions.push(eq(match.round_id, toStr(filter.round_id)));
        }
        if (conditions.length === 0) return false;
        await db
            .update(match)
            .set(data as Partial<typeof match.$inferInsert>)
            .where(and(...conditions));
        return true;
    },

    async delete(
        db: DrizzleDatabase,
        filter?: { stage_id?: Id },
    ): Promise<boolean> {
        if (filter?.stage_id !== undefined) {
            await db
                .delete(match)
                .where(eq(match.stage_id, toStr(filter.stage_id)));
        } else {
            await db.delete(match);
        }
        return true;
    },
};

// ============================================================================
// Match Game Operations
// ============================================================================

export const matchGameDb = {
    async getById(db: DrizzleDatabase, id: Id): Promise<MatchGame | null> {
        const results = await db
            .select()
            .from(matchGame)
            .where(eq(matchGame.id, toStr(id)))
            .limit(1);
        return results[0] ? castMatchGame(results[0]) : null;
    },

    async getByParent(db: DrizzleDatabase, parentId: Id): Promise<MatchGame[]> {
        const results = await db
            .select()
            .from(matchGame)
            .where(eq(matchGame.parent_id, toStr(parentId)))
            .orderBy(asc(matchGame.number));
        return results.map(castMatchGame);
    },

    async getFirst(
        db: DrizzleDatabase,
        filter: { parent_id?: Id; number?: number },
    ): Promise<MatchGame | null> {
        const conditions = [];
        if (filter.parent_id !== undefined) {
            conditions.push(eq(matchGame.parent_id, toStr(filter.parent_id)));
        }
        if (filter.number !== undefined) {
            conditions.push(eq(matchGame.number, filter.number));
        }
        const results = await db
            .select()
            .from(matchGame)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(asc(matchGame.number))
            .limit(1);
        return results[0] ? castMatchGame(results[0]) : null;
    },

    async insert(
        db: DrizzleDatabase,
        data: typeof matchGame.$inferInsert | (typeof matchGame.$inferInsert)[],
    ): Promise<string | number> {
        const values = Array.isArray(data) ? data : [data];
        await db.insert(matchGame).values(values);
        return Array.isArray(data) ? values.length : values[0].id;
    },

    async update(
        db: DrizzleDatabase,
        id: Id,
        data: Partial<MatchGame>,
    ): Promise<boolean> {
        await db
            .update(matchGame)
            .set(data as Partial<typeof matchGame.$inferInsert>)
            .where(eq(matchGame.id, toStr(id)));
        return true;
    },

    async updateByFilter(
        db: DrizzleDatabase,
        filter: { parent_id?: Id },
        data: Partial<MatchGame>,
    ): Promise<boolean> {
        const conditions = [];
        if (filter.parent_id !== undefined) {
            conditions.push(eq(matchGame.parent_id, toStr(filter.parent_id)));
        }
        if (conditions.length === 0) return false;
        await db
            .update(matchGame)
            .set(data as Partial<typeof matchGame.$inferInsert>)
            .where(and(...conditions));
        return true;
    },

    async delete(
        db: DrizzleDatabase,
        filter?: { stage_id?: Id; parent_id?: Id; number?: number },
    ): Promise<boolean> {
        if (filter?.stage_id !== undefined) {
            await db
                .delete(matchGame)
                .where(eq(matchGame.stage_id, toStr(filter.stage_id)));
        } else if (
            filter?.parent_id !== undefined &&
            filter?.number !== undefined
        ) {
            await db
                .delete(matchGame)
                .where(
                    and(
                        eq(matchGame.parent_id, toStr(filter.parent_id)),
                        eq(matchGame.number, filter.number),
                    ),
                );
        } else if (filter?.parent_id !== undefined) {
            await db
                .delete(matchGame)
                .where(eq(matchGame.parent_id, toStr(filter.parent_id)));
        } else {
            await db.delete(matchGame);
        }
        return true;
    },
};
