// Core exports
export { BracketsManager } from '@/core/manager';

export {
    Database,
    Duel,
    OmitId,
    OrderingMap,
    ParticipantSlot,
    Scores,
    Side,
    StandardBracketResults,
    Table,
    ValueToArray,
    DataTypes,
    FinalStandingsItem,
    RoundRobinFinalStandingsItem,
    RoundRobinFinalStandingsOptions,
    IdMapping,
    ParitySplit,
    RoundPositionalInfo,
    Nullable,
    DeepPartial,
    ChildCountLevel,
    Tournament,
    InputTournament,
    StageData,
    StageDataTypes,
} from '@/core/types';

export * as helpers from '@/core/helpers';
export { ordering } from '@/core/ordering';

export { Get } from '@/core/get';
export { Update } from '@/core/update';
export { Find } from '@/core/find';
export { Reset } from '@/core/reset';
export { Delete } from '@/core/delete';
export { StageCreator } from '@/core/base/stage/creator';

// Database utilities
export {
    tournamentDb,
    participantDb,
    stageDb,
    groupDb,
    roundDb,
    matchDb,
    matchGameDb,
} from '@/core/db';
export type { DrizzleDatabase } from '@/core/db';

// Model exports (types from brackets-model)
export * from '@/model';

// Export drizzle schema and database factory
export { createDatabase } from '@/storage/drizzle/db';
export * as drizzleSchema from '@/storage/drizzle/db/schema';
