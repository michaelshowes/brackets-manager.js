// Core exports
export { BracketsManager, CallableCreate } from '@/core/manager';

export {
    CrudInterface,
    Database,
    Duel,
    OmitId,
    OrderingMap,
    ParticipantSlot,
    Scores,
    Side,
    StandardBracketResults,
    Storage,
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
export { TournamentCreationResult } from '@/core/create';

// Model exports (types from brackets-model)
export * from '@/model';

// Storage exports - namespaced to avoid type conflicts
export { createStorage } from '@/storage/drizzle/storage';
export { createDatabase } from '@/storage/drizzle/db';
export type { DrizzleDatabase } from '@/storage/drizzle/db';

// Export drizzle schema as a namespace to avoid conflicts with model types
export * as drizzleSchema from '@/storage/drizzle/db/schema';
