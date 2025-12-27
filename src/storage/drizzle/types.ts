import { DataTypes } from '@/core/types';

// Simplified types - Match and MatchGame now directly align with the schema
export type MatchWithExtra = DataTypes['match'];
export type MatchGameWithExtra = DataTypes['match_game'];
