import { Group, Id, Match, Round, Stage } from '@/model';
import type { DrizzleDatabase } from './db';
import { groupDb, matchDb, roundDb, stageDb } from './db';

export class Find {
    private readonly db: DrizzleDatabase;

    /**
     * Creates an instance of Find, which will handle finding data in the storage.
     *
     * @param db The Drizzle database instance.
     */
    constructor(db: DrizzleDatabase) {
        this.db = db;
    }

    /**
     * Returns a stage by its name.
     *
     * @param tournamentId ID of the tournament.
     * @param name Name of the stage.
     */
    public async stage(tournamentId: Id, name: string): Promise<Stage | null> {
        const stages = await stageDb.getByTournament(this.db, tournamentId);
        if (!stages) return null;
        return stages.find((stage) => stage.name === name) ?? null;
    }

    /**
     * Returns a group by its number.
     *
     * @param stageId ID of the stage.
     * @param number Number of the group.
     */
    public async group(stageId: Id, number: number): Promise<Group | null> {
        return groupDb.getFirst(this.db, { stage_id: stageId, number });
    }

    /**
     * Returns a round by its number in its group.
     *
     * @param groupId ID of the group.
     * @param number Number of the round in its group.
     */
    public async round(groupId: Id, number: number): Promise<Round | null> {
        return roundDb.getFirst(this.db, { group_id: groupId, number });
    }

    /**
     * Returns a match by its number in its round.
     *
     * @param roundId ID of the round.
     * @param number Number of the match in its round.
     */
    public async match(roundId: Id, number: number): Promise<Match | null> {
        return matchDb.getFirst(this.db, { round_id: roundId, number });
    }
}
