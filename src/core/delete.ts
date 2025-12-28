import { Id } from '@/model/index.js';
import type { DrizzleDatabase } from './db.js';
import {
    groupDb,
    matchDb,
    matchGameDb,
    participantDb,
    roundDb,
    stageDb,
    tournamentDb,
} from './db.js';

export class Delete {
    private readonly db: DrizzleDatabase;

    /**
     * Creates an instance of Delete, which will handle cleanly deleting data in the storage.
     *
     * @param db The Drizzle database instance.
     */
    constructor(db: DrizzleDatabase) {
        this.db = db;
    }

    /**
     * Deletes a tournament and all its components:
     *
     * - Stages (and their groups, rounds, matches, match games)
     * - Participants
     * - The tournament itself
     *
     * @param tournamentId ID of the tournament.
     */
    public async tournament(tournamentId: Id): Promise<void> {
        // First, delete all stages and their components
        await this.tournamentStages(tournamentId);

        // Delete participants
        await participantDb.delete(this.db, { tournamentId: tournamentId });

        // Finally, delete the tournament itself
        await tournamentDb.delete(this.db, tournamentId);
    }

    /**
     * Deletes **only the stages** of a tournament (and all their components, see {@link stage | delete.stage()}).
     *
     * This does not delete the related participants or the tournament itself.
     *
     * @param tournamentId ID of the tournament.
     */
    public async tournamentStages(tournamentId: Id): Promise<void> {
        const stages = await stageDb.getByTournament(this.db, tournamentId);
        if (!stages) throw Error('Error getting the stages.');

        // Not doing this in a `Promise.all()` since this can be a heavy operation.
        for (const stage of stages) await this.stage(stage.id);
    }

    /**
     * Deletes a stage, and all its components:
     *
     * - Groups
     * - Rounds
     * - Matches
     * - Match games
     *
     * This does not delete the related participants.
     *
     * @param stageId ID of the stage.
     */
    public async stage(stageId: Id): Promise<void> {
        // The order is important here, because the abstract storage can possibly have foreign key checks (e.g. SQL).

        await matchGameDb.delete(this.db, { stageId: stageId });
        await matchDb.delete(this.db, { stageId: stageId });
        await roundDb.delete(this.db, { stageId: stageId });
        await groupDb.delete(this.db, { stageId: stageId });
        await stageDb.delete(this.db, { id: stageId });
    }
}
