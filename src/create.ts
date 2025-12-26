import { InputStage, Stage, Id, Group } from 'brackets-model';
import { StageCreator } from './base/stage/creator';
import { InputTournament, OmitId, Storage, Tournament } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Result returned when creating a tournament with auto-created stage and group.
 */
export interface TournamentCreationResult {
    /** The created tournament. */
    tournament: Tournament;
    /** The auto-created stage. */
    stage: Stage;
    /** The auto-created group within the stage. */
    group: Group;
}

export class Create {
    private storage: Storage;

    /**
     * Creates an instance of Create.
     *
     * @param storage The implementation of Storage.
     */
    constructor(storage: Storage) {
        this.storage = storage;
    }

    /**
     * Creates a tournament with an auto-created stage and group.
     *
     * @param data The tournament to create.
     * @returns The created tournament, stage, and group.
     */
    public async tournament(
        data: InputTournament,
    ): Promise<TournamentCreationResult> {
        const id = uuidv4();

        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
        const tournamentData: OmitId<Tournament> = {
            name: data.name,
            description: data.description ?? null,
            start_date: data.start_date ? new Date(data.start_date) : null,
            end_date: data.end_date ? new Date(data.end_date) : null,
            extra: data.extra,
        };
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */

        // The storage layer handles ID generation for tournaments (using text IDs)
        // We pass the id along with the data for storage implementations that require it
        const insertData = { id, ...tournamentData };
        // Storage insert returns number | boolean | string depending on implementation
        const insertedId = (await this.storage.insert(
            'tournament',
            insertData as OmitId<Tournament>,
        )) as number | boolean | string;

        if (insertedId === -1 || insertedId === false || insertedId === '')
            throw Error('Could not insert the tournament in the database.');

        // For string IDs, the insertedId might be the generated id or a number
        const finalId = typeof insertedId === 'string' ? insertedId : id;

        const tournament: Tournament = { id: finalId as Id, ...tournamentData };

        // Auto-create a stage for this tournament
        const stage = await this.createDefaultStage(tournament.id);

        // Auto-create a group within the stage
        const group = await this.createDefaultGroup(stage.id);

        return { tournament, stage, group };
    }

    /**
     * Creates a default stage for a tournament.
     *
     * @param tournamentId The tournament ID.
     * @returns The created stage.
     */
    private async createDefaultStage(tournamentId: Id): Promise<Stage> {
        const stageData: OmitId<Stage> = {
            tournament_id: tournamentId,
            name: 'Bracket',
            type: 'double_elimination',
            number: 1,
            settings: {
                size: 2,
                grandFinal: 'none',
            },
        };

        const stageId = (await this.storage.insert('stage', stageData)) as
            | number
            | boolean
            | string;

        if (stageId === -1 || stageId === false || stageId === '')
            throw Error('Could not insert the default stage in the database.');

        return { id: stageId as Id, ...stageData };
    }

    /**
     * Creates a default group for a stage.
     *
     * @param stageId The stage ID.
     * @returns The created group.
     */
    private async createDefaultGroup(stageId: Id): Promise<Group> {
        const groupData: OmitId<Group> = {
            stage_id: stageId,
            number: 1,
        };

        const groupId = (await this.storage.insert('group', groupData)) as
            | number
            | boolean
            | string;

        if (groupId === -1 || groupId === false || groupId === '')
            throw Error('Could not insert the default group in the database.');

        return { id: groupId as Id, ...groupData };
    }

    /**
     * Creates a stage for an existing tournament. The tournament won't be created.
     *
     * @param data The stage to create.
     */
    public async stage(data: InputStage): Promise<Stage> {
        const creator = new StageCreator(this.storage, data);
        return creator.run();
    }
}
