import { InputStage, Stage, Id } from 'brackets-model';
import { StageCreator } from './base/stage/creator';
import { InputTournament, OmitId, Storage, Tournament } from './types';
import { v4 as uuidv4 } from 'uuid';

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
     * Creates a tournament.
     *
     * @param data The tournament to create.
     * @returns The created tournament.
     */
    public async tournament(data: InputTournament): Promise<Tournament> {
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

        return { id: finalId as Id, ...tournamentData };
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
