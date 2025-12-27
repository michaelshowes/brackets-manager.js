// Core exports
export { BracketsManager } from '@/core/manager';

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
} from '@/core/types';

export * as helpers from '@/core/helpers';
export { ordering } from '@/core/ordering';

export { StageCreator } from '@/core/base/stage/creator';
export { Delete } from '@/core/delete';
export { Find } from '@/core/find';
export { Get } from '@/core/get';
export { Reset } from '@/core/reset';
export { Update } from '@/core/update';

// Database utilities
export {
    groupDb,
    matchDb,
    matchGameDb,
    participantDb,
    roundDb,
    stageDb,
    tournamentDb,
} from '@/core/db';
export type { DrizzleDatabase } from '@/core/db';

// Model exports (types from brackets-model)
export * from '@/model';

// Export drizzle schema and database factory
export { createDatabase } from '@/storage/drizzle/db';
export * as drizzleSchema from '@/storage/drizzle/db/schema';
