import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool, type PoolConfig } from 'pg';
import * as schema from './schema/index.js';

export type DrizzleDatabase = NodePgDatabase<typeof schema>;

/**
 * Creates a Drizzle database instance connected to PostgreSQL using node-postgres (pg).
 *
 * @param config - PostgreSQL connection string or PoolConfig object
 * @returns Drizzle database instance with schema
 */
export function createDatabase(config: string | PoolConfig): DrizzleDatabase {
    const pool = new Pool(
        typeof config === 'string' ? { connectionString: config } : config,
    );
    return drizzle(pool, { schema });
}

export { schema };
