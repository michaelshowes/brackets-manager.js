import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type DrizzleDatabase = PostgresJsDatabase<typeof schema>;

/**
 * Creates a Drizzle database instance connected to PostgreSQL.
 *
 * @param connectionString - PostgreSQL connection string
 * @returns Drizzle database instance with schema
 */
export function createDatabase(connectionString: string): DrizzleDatabase {
    const client = postgres(connectionString);
    return drizzle(client, { schema });
}

export { schema };
