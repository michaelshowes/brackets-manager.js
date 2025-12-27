import { InputStage, Stage } from '@/model/index.js';
import { StageCreator } from './base/stage/creator.js';
import type { DrizzleDatabase } from './db.js';
import { Delete } from './delete.js';
import { Find } from './find.js';
import { Get } from './get.js';
import { Reset } from './reset.js';
import { Update } from './update.js';

export class BracketsManager {
    public readonly db: DrizzleDatabase;

    /**
     * Provides getters for data in the tournament.
     */
    public get: Get;

    /**
     * Provides update methods for data in the tournament.
     */
    public update: Update;

    /**
     * Provides delete methods for data in the tournament.
     */
    public delete: Delete;

    /**
     * Provides find methods for data in the tournament.
     */
    public find: Find;

    /**
     * Provides reset methods for data in the tournament.
     */
    public reset: Reset;

    /**
     * Creates an instance of BracketsManager, which will handle all the logic and operations on data.
     *
     * @param db The Drizzle database instance.
     */
    constructor(db: DrizzleDatabase) {
        this.db = db;
        this.get = new Get(db);
        this.update = new Update(db);
        this.delete = new Delete(db);
        this.find = new Find(db);
        this.reset = new Reset(db);
    }

    /**
     * Creates a stage for an existing tournament. The tournament won't be created.
     *
     * @param stage A stage to create.
     */
    public async create(stage: InputStage): Promise<Stage> {
        const stageCreator = new StageCreator(this.db, stage);
        return stageCreator.run();
    }

    /**
     * Imports a stage into the tournament.
     *
     * @param data Data to import.
     * @deprecated This was only intended for the in-memory storage. Use your own import logic instead.
     */
    public async import(_data: unknown): Promise<void> {
        throw Error(
            'The import method is not supported. Use your own import logic instead.',
        );
    }

    /**
     * Exports all data from the tournament.
     *
     * @deprecated This was only intended for the in-memory storage. Use `get.tournamentData()` instead.
     */
    public async export(): Promise<unknown> {
        throw Error(
            'The export method is not supported. Use get.tournamentData() instead.',
        );
    }
}
