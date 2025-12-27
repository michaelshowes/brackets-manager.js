/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { eq, and, asc, type SQL } from 'drizzle-orm';
import { CrudInterface, OmitId, DataTypes } from '@/core/types';
import type { DrizzleDatabase } from './db';
import {
    tournament,
    participant,
    stage,
    group,
    round,
    match,
    matchGame,
    type Tournament as TournamentRow,
    type NewTournament,
} from './db/schema';

type Id = number | string;

// Map table names to Drizzle schema objects
const tables = {
    participant,
    stage,
    group,
    round,
    match,
    match_game: matchGame,
} as const;

type TableName = keyof typeof tables;

/**
 * Get a column from a table by key name.
 *
 * @param table - The Drizzle table object
 * @param key - The column name
 * @returns The column or undefined
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getColumn(table: any, key: string): any {
    return table[key];
}

/**
 * Get the table object for a given table name.
 *
 * @param tableName - The name of the table
 * @returns The Drizzle table object or undefined
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTable(tableName: string): any {
    return tables[tableName as TableName];
}

/**
 * Creates a storage adapter that implements the CrudInterface for brackets-manager.
 * Uses Drizzle ORM directly for all database operations.
 *
 * @param db - The Drizzle database instance
 * @returns An object implementing CrudInterface with insert, select, update, and delete methods
 */
export function createStorage(db: DrizzleDatabase): CrudInterface {
    const insert = async <T extends keyof DataTypes>(
        tableName: T,
        values: OmitId<DataTypes[T]> | OmitId<DataTypes[T]>[],
    ): Promise<number | boolean> => {
        const table = getTable(tableName as string);
        if (!table) return false;

        try {
            const data = Array.isArray(values) ? values : [values];
            await db.insert(table).values(data);
            return Array.isArray(values) ? data.length : true;
        } catch (e) {
            console.error(`Insert error for ${tableName}:`, e);
            return false;
        }
    };

    const select = async <T extends keyof DataTypes>(
        tableName: T,
        filter?: Partial<DataTypes[T]> | Id,
    ): Promise<DataTypes[T][] | DataTypes[T] | null> => {
        const table = getTable(tableName as string);
        if (!table) return null;

        try {
            // No filter - return all
            if (filter === undefined) {
                const orderCol =
                    getColumn(table, 'number') ?? getColumn(table, 'id');
                const results = await db
                    .select()
                    .from(table)
                    .orderBy(
                        orderCol ? asc(orderCol) : asc(getColumn(table, 'id')),
                    );
                return results as unknown as DataTypes[T][];
            }

            // Filter by ID
            if (typeof filter === 'number' || typeof filter === 'string') {
                const idCol = getColumn(table, 'id');
                const results = await db
                    .select()
                    .from(table)
                    .where(eq(idCol, String(filter)))
                    .limit(1);
                return results.length > 0
                    ? (results[0] as unknown as DataTypes[T])
                    : null;
            }

            // Filter by object
            const conditions = Object.entries(filter)
                .filter(([, value]) => value !== undefined)
                .map(([key, value]) => {
                    const column = getColumn(table, key);
                    if (!column) return null;
                    const val =
                        typeof value === 'number' && key.endsWith('_id')
                            ? String(value)
                            : value;
                    return eq(column, val);
                })
                .filter((c): c is SQL => c !== null);

            const orderCol =
                getColumn(table, 'number') ?? getColumn(table, 'id');
            const results = await db
                .select()
                .from(table)
                .where(conditions.length > 0 ? and(...conditions) : undefined)
                .orderBy(
                    orderCol ? asc(orderCol) : asc(getColumn(table, 'id')),
                );

            return results as unknown as DataTypes[T][];
        } catch (e) {
            console.error(`Select error for ${tableName}:`, e);
            return [];
        }
    };

    const update = async <T extends keyof DataTypes>(
        tableName: T,
        filter: Partial<DataTypes[T]> | Id,
        value: Partial<DataTypes[T]> | DataTypes[T],
    ): Promise<boolean> => {
        const table = getTable(tableName as string);
        if (!table) return false;

        try {
            // Filter by ID
            if (typeof filter === 'number' || typeof filter === 'string') {
                const idCol = getColumn(table, 'id');
                await db
                    .update(table)
                    .set(value)
                    .where(eq(idCol, String(filter)));
                return true;
            }

            // Filter by object
            const conditions = Object.entries(filter)
                .filter(([, v]) => v !== undefined)
                .map(([key, v]) => {
                    const column = getColumn(table, key);
                    if (!column) return null;
                    const val =
                        typeof v === 'number' && key.endsWith('_id')
                            ? String(v)
                            : v;
                    return eq(column, val);
                })
                .filter((c): c is SQL => c !== null);

            if (conditions.length === 0) return false;

            await db
                .update(table)
                .set(value)
                .where(and(...conditions));

            return true;
        } catch (e) {
            console.error(`Update error for ${tableName}:`, e);
            return false;
        }
    };

    const deleteOp = async <T extends keyof DataTypes>(
        tableName: T,
        filter?: Partial<DataTypes[T]>,
    ): Promise<boolean> => {
        const table = getTable(tableName as string);
        if (!table) return false;

        try {
            // No filter - delete all
            if (filter === undefined) {
                await db.delete(table);
                return true;
            }

            // Filter by object
            const conditions = Object.entries(filter)
                .filter(([, v]) => v !== undefined)
                .map(([key, v]) => {
                    const column = getColumn(table, key);
                    if (!column) return null;
                    const val =
                        typeof v === 'number' && key.endsWith('_id')
                            ? String(v)
                            : v;
                    return eq(column, val);
                })
                .filter((c): c is SQL => c !== null);

            if (conditions.length === 0) await db.delete(table);
            else await db.delete(table).where(and(...conditions));

            return true;
        } catch (e) {
            console.error(`Delete error for ${tableName}:`, e);
            return false;
        }
    };

    return {
        insert,
        select,
        update,
        delete: deleteOp,
    } as CrudInterface;
}

// Re-export tournament operations separately since it's not part of DataTypes
export const tournamentOperations = {
    /**
     * Get all tournaments.
     *
     * @param db - The Drizzle database instance
     * @returns Array of all tournaments
     */
    async getAll(db: DrizzleDatabase): Promise<TournamentRow[]> {
        return db.select().from(tournament);
    },

    /**
     * Get a tournament by ID.
     *
     * @param db - The Drizzle database instance
     * @param id - The tournament ID
     * @returns The tournament or null if not found
     */
    async getById(
        db: DrizzleDatabase,
        id: string,
    ): Promise<TournamentRow | null> {
        const results = await db
            .select()
            .from(tournament)
            .where(eq(tournament.id, id))
            .limit(1);
        return results[0] ?? null;
    },

    /**
     * Create a new tournament.
     *
     * @param db - The Drizzle database instance
     * @param data - The tournament data
     * @returns The created tournament ID
     */
    async create(db: DrizzleDatabase, data: NewTournament): Promise<string> {
        await db.insert(tournament).values(data);
        return data.id;
    },

    /**
     * Update a tournament.
     *
     * @param db - The Drizzle database instance
     * @param id - The tournament ID
     * @param data - The partial tournament data to update
     * @returns True if updated successfully
     */
    async update(
        db: DrizzleDatabase,
        id: string,
        data: Partial<NewTournament>,
    ): Promise<boolean> {
        await db.update(tournament).set(data).where(eq(tournament.id, id));
        return true;
    },

    /**
     * Delete a tournament.
     *
     * @param db - The Drizzle database instance
     * @param id - The tournament ID
     * @returns True if deleted successfully
     */
    async delete(db: DrizzleDatabase, id: string): Promise<boolean> {
        await db.delete(tournament).where(eq(tournament.id, id));
        return true;
    },
};
