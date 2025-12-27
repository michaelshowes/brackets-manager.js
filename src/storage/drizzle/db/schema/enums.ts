import { pgEnum } from 'drizzle-orm/pg-core';

// The only supported types of stage.
export const stageTypeEnum = pgEnum('stage_type', [
    'round_robin',
    'single_elimination',
    'double_elimination',
]);

// The possible types for a double elimination stage's grand final.
export const grandFinalTypeEnum = pgEnum('grand_final_type', [
    'none',
    'simple',
    'double',
]);

// The possible modes for a round-robin stage.
export const roundRobinModeEnum = pgEnum('round_robin_mode', ['simple', 'double']);

// Used to order seeds.
export const seedOrderingEnum = pgEnum('seed_ordering', [
    'natural',
    'reverse',
    'half_shift',
    'reverse_half_shift',
    'pair_flip',
    'inner_outer',
    'groups.effort_balanced',
    'groups.seed_optimized',
    'groups.bracket_optimized',
]);

// The possible results of a duel for a participant.
export const matchResultEnum = pgEnum('match_result', ['win', 'draw', 'loss']);
