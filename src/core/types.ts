import {
    Group,
    Id,
    Match,
    MatchGame,
    Participant,
    RankingFormula,
    RankingItem,
    Round,
    SeedOrdering,
    Stage,
} from '@/model/index.js';

/**
 * A tournament that can contain multiple stages and participants.
 */
export interface Tournament {
    /** Unique identifier of the tournament. */
    id: Id;
    /** Name of the tournament. */
    name: string;
    /** URL-friendly slug derived from the tournament name. */
    slug: string;
    /** Description of the tournament. */
    description?: string | null;
    /** Start date of the tournament. */
    startDate?: Date | null;
    /** End date of the tournament. */
    endDate?: Date | null;
    /** Additional data for the tournament. */
    extra?: Record<string, unknown>;
}

/**
 * Input type for creating a tournament.
 */
export interface InputTournament {
    /** Name of the tournament. */
    name: string;
    /** Optional custom slug. If not provided, one will be generated from the name. */
    slug?: string;
    /** Description of the tournament. */
    description?: string | null;
    /** Start date of the tournament. */
    startDate?: Date | string | null;
    /** End date of the tournament. */
    endDate?: Date | string | null;
    /** Additional data for the tournament. */
    extra?: Record<string, unknown>;
}

/**
 * Type of an object implementing every ordering method.
 */
export type OrderingMap = Record<
    SeedOrdering,
    <T>(array: T[], ...args: number[]) => T[]
>;

/**
 * Omits the `id` property of a type.
 */
export type OmitId<T> = Omit<T, 'id'>;

/**
 * Defines a T which can be null.
 */
export type Nullable<T> = T | null;

/**
 * An object which maps an ID to another ID.
 */
export type IdMapping = Record<Id, Id>;

/**
 * Used by the library to handle placements. Is `null` if is a BYE. Has a `null` name if it's yet to be determined.
 */
export type ParticipantSlot = { id: Id | null; position?: number } | null;

/**
 * The library only handles duels. It's one participant versus another participant.
 */
export type Duel = [ParticipantSlot, ParticipantSlot];

/**
 * The side of an opponent.
 */
export type Side = 'opponent1' | 'opponent2';

/**
 * The cumulated scores of the opponents in a match's child games.
 */
export type Scores = { opponent1: number; opponent2: number };

/**
 * The possible levels of data to which we can update the child games count.
 */
export type ChildCountLevel = 'stage' | 'group' | 'round' | 'match';

/**
 * Positional information about a round.
 */
export type RoundPositionalInfo = {
    roundNumber: number;
    roundCount: number;
};

/**
 * The result of an array which was split by parity.
 */
export interface ParitySplit<T> {
    even: T[];
    odd: T[];
}

/**
 * Makes an object type deeply partial.
 */
export type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;

/**
 * Converts all value types to array types.
 */
export type ValueToArray<T> = {
    [K in keyof T]: Array<T[K]>;
};

/**
 * Data type associated to each database table.
 */
export interface DataTypes {
    tournament: Tournament;
    stage: Stage;
    group: Group;
    round: Round;
    match: Match;
    match_game: MatchGame;
    participant: Participant;
}

/**
 * The types of table in the storage.
 */
export type Table = keyof DataTypes;

/**
 * Format of the data in a database.
 * Tournament is optional for backwards compatibility with storage implementations
 * that don't support tournaments.
 */
export type Database = ValueToArray<Omit<DataTypes, 'tournament'>> & {
    tournament?: Tournament[];
};

/**
 * Data types for stage/tournament display (excludes tournament entity).
 */
export interface StageDataTypes {
    stage: Stage;
    group: Group;
    round: Round;
    match: Match;
    match_game: MatchGame;
    participant: Participant;
}

/**
 * Format of the data needed to display a stage or tournament.
 */
export type StageData = ValueToArray<StageDataTypes>;

/**
 * An item in the final standings of an elimination stage. Each item represents a {@link Participant}.
 */
export interface FinalStandingsItem {
    id: Id;
    name: string;
    rank: number;
}

/**
 * An item in the final standings of a round-robin stage. Each item represents a {@link Participant}.
 */
export interface RoundRobinFinalStandingsItem extends RankingItem {
    groupId: Id;
    name: string;
}

/**
 * Options for the final standings of a round-robin stage.
 */
export interface RoundRobinFinalStandingsOptions {
    /**
     * A formula required to rank participants in a round-robin stage.
     *
     * See {@link RankingItem} for the possible properties on `item`.
     *
     * The default formula used by the viewer is:
     *
     * @example (item) => 3 * item.wins + 1 * item.draws + 0 * item.losses
     */
    rankingFormula: RankingFormula;
    /**
     * The maximum number of participants to qualify per group.
     */
    maxQualifiedParticipantsPerGroup?: number;
}

/**
 * Contains the losers and the winner of the bracket.
 */
export interface StandardBracketResults {
    /**
     * The list of losers for each round of the bracket.
     */
    losers: ParticipantSlot[][];

    /**
     * The winner of the bracket.
     */
    winner: ParticipantSlot;
}
