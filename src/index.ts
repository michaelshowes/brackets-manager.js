// Core exports
export { BracketsManager } from '@/core/manager.js';

export {
    ChildCountLevel,
    Database,
    DataTypes,
    DeepPartial,
    Duel,
    FinalStandingsItem,
    IdMapping,
    InputTournament,
    Nullable,
    OmitId,
    OrderingMap,
    ParitySplit,
    ParticipantSlot,
    RoundPositionalInfo,
    RoundRobinFinalStandingsItem,
    RoundRobinFinalStandingsOptions,
    Scores,
    Side,
    StageData,
    StageDataTypes,
    StandardBracketResults,
    Table,
    Tournament,
    ValueToArray,
} from '@/core/types.js';

export * as helpers from '@/core/helpers.js';
export { ordering } from '@/core/ordering.js';

export { StageCreator } from '@/core/base/stage/creator.js';
export { Delete } from '@/core/delete.js';
export { Find } from '@/core/find.js';
export { Get } from '@/core/get.js';
export { Reset } from '@/core/reset.js';
export { Update } from '@/core/update.js';

// Database utilities
export {
    groupDb,
    matchDb,
    matchGameDb,
    participantDb,
    roundDb,
    stageDb,
    tournamentDb,
} from '@/core/db.js';
export type { DrizzleDatabase } from '@/core/db.js';

// Model exports (types from brackets-model)
export * from '@/model/index.js';

// Export drizzle schema and database factory
export { createDatabase } from '@/storage/drizzle/db/index.js';
export * as drizzleSchema from '@/storage/drizzle/db/schema/index.js';
