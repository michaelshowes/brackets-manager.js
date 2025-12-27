import {
    Id,
    IdSeeding,
    Match,
    MatchGame,
    Round,
    Seeding,
    SeedOrdering,
    Status,
} from '@/model/index.js';
import { ordering } from './ordering.js';
import { BaseUpdater } from './base/updater.js';
import { ChildCountLevel, DeepPartial } from './types.js';
import * as helpers from './helpers.js';
import { stageDb, groupDb, roundDb, matchDb, matchGameDb } from './db.js';

export class Update extends BaseUpdater {
    /**
     * Updates partial information of a match. Its id must be given.
     *
     * This will update related matches accordingly.
     *
     * @param match Values to change in a match.
     */
    public async match<M extends Match = Match>(
        match: DeepPartial<M>,
    ): Promise<void> {
        if (match.id === undefined) throw Error('No match id given.');

        const stored = await matchDb.getById(this.db, match.id);
        if (!stored) throw Error('Match not found.');

        await this.updateMatch(stored, match);
    }

    /**
     * Updates partial information of a match game. Its id must be given.
     *
     * This will update the parent match accordingly.
     *
     * @param game Values to change in a match game.
     */
    public async matchGame<G extends MatchGame = MatchGame>(
        game: DeepPartial<G>,
    ): Promise<void> {
        const stored = await this.findMatchGame(game);

        await this.updateMatchGame(stored, game);
    }

    /**
     * Updates the seed ordering of every ordered round in a stage.
     *
     * @param stageId ID of the stage.
     * @param seedOrdering A list of ordering methods.
     */
    public async ordering(
        stageId: Id,
        seedOrdering: SeedOrdering[],
    ): Promise<void> {
        const stage = await stageDb.getById(this.db, stageId);
        if (!stage) throw Error('Stage not found.');

        helpers.ensureNotRoundRobin(stage);

        const roundsToOrder = await this.getOrderedRounds(stage);
        if (seedOrdering.length !== roundsToOrder.length)
            throw Error('The count of seed orderings is incorrect.');

        for (let i = 0; i < roundsToOrder.length; i++)
            await this.updateRoundOrdering(roundsToOrder[i], seedOrdering[i]);
    }

    /**
     * Updates the seed ordering of a round.
     *
     * @param roundId ID of the round.
     * @param method Seed ordering method.
     */
    public async roundOrdering(
        roundId: Id,
        method: SeedOrdering,
    ): Promise<void> {
        const round = await roundDb.getById(this.db, roundId);
        if (!round) throw Error('This round does not exist.');

        const stage = await stageDb.getById(this.db, round.stage_id);
        if (!stage) throw Error('Stage not found.');

        helpers.ensureNotRoundRobin(stage);

        await this.updateRoundOrdering(round, method);
    }

    /**
     * Updates child count of all matches of a given level.
     *
     * @param level The level at which to act.
     * @param id ID of the chosen level.
     * @param childCount The target child count.
     */
    public async matchChildCount(
        level: ChildCountLevel,
        id: Id,
        childCount: number,
    ): Promise<void> {
        switch (level) {
            case 'stage':
                await this.updateStageMatchChildCount(id, childCount);
                break;
            case 'group':
                await this.updateGroupMatchChildCount(id, childCount);
                break;
            case 'round':
                await this.updateRoundMatchChildCount(id, childCount);
                break;
            case 'match':
                const match = await matchDb.getById(this.db, id);
                if (!match) throw Error('Match not found.');
                await this.adjustMatchChildGames(match, childCount);
                break;
            default:
                throw Error('Unknown child count level.');
        }
    }

    /**
     * Updates the seeding of a stage.
     *
     * @param stageId ID of the stage.
     * @param seeding The new seeding.
     * @param keepSameSize Whether to keep the same size as before for the stage. **Default:** false.
     */
    public async seeding(
        stageId: Id,
        seeding: Seeding,
        keepSameSize = false,
    ): Promise<void> {
        await this.updateSeeding(stageId, { seeding }, keepSameSize);
    }

    /**
     * Updates the seeding of a stage (with a list of IDs).
     *
     * @param stageId ID of the stage.
     * @param seedingIds The new seeding, containing only IDs.
     * @param keepSameSize Whether to keep the same size as before for the stage. **Default:** false.
     */
    public async seedingIds(
        stageId: Id,
        seedingIds: IdSeeding,
        keepSameSize = false,
    ): Promise<void> {
        await this.updateSeeding(stageId, { seedingIds }, keepSameSize);
    }

    /**
     * Confirms the seeding of a stage.
     *
     * This will convert TBDs to BYEs and propagate them.
     *
     * @param stageId ID of the stage.
     */
    public async confirmSeeding(stageId: Id): Promise<void> {
        await this.confirmCurrentSeeding(stageId);
    }

    /**
     * Update the seed ordering of a round.
     *
     * @param round The round of which to update the ordering.
     * @param method The new ordering method.
     */
    private async updateRoundOrdering(
        round: Round,
        method: SeedOrdering,
    ): Promise<void> {
        const matches = await matchDb.getByRound(this.db, round.id);
        if (!matches || matches.length === 0)
            throw Error('This round has no match.');

        if (matches.some((match) => match.status > Status.Ready))
            throw Error('At least one match has started or is completed.');

        const stage = await stageDb.getById(this.db, round.stage_id);
        if (!stage) throw Error('Stage not found.');
        if (stage.settings.size === undefined)
            throw Error('Undefined stage size.');

        const group = await groupDb.getById(this.db, round.group_id);
        if (!group) throw Error('Group not found.');

        const inLoserBracket = helpers.isLoserBracket(stage.type, group.number);
        const roundCountLB = helpers.getLowerBracketRoundCount(
            stage.settings.size,
        );
        const seeds = helpers.getSeeds(
            inLoserBracket,
            round.number,
            roundCountLB,
            matches.length,
        );
        const positions = ordering[method](seeds);

        await this.applyRoundOrdering(round.number, matches, positions);
    }

    /**
     * Updates child count of all matches of a stage.
     *
     * @param stageId ID of the stage.
     * @param childCount The target child count.
     */
    private async updateStageMatchChildCount(
        stageId: Id,
        childCount: number,
    ): Promise<void> {
        await matchDb.updateByFilter(
            this.db,
            { stage_id: stageId },
            { child_count: childCount },
        );

        const matches = await matchDb.getByStage(this.db, stageId);
        if (!matches || matches.length === 0)
            throw Error('This stage has no match.');

        for (const match of matches)
            await this.adjustMatchChildGames(match, childCount);
    }

    /**
     * Updates child count of all matches of a group.
     *
     * @param groupId ID of the group.
     * @param childCount The target child count.
     */
    private async updateGroupMatchChildCount(
        groupId: Id,
        childCount: number,
    ): Promise<void> {
        await matchDb.updateByFilter(
            this.db,
            { group_id: groupId },
            { child_count: childCount },
        );

        const matches = await matchDb.getByGroup(this.db, groupId);
        if (!matches || matches.length === 0)
            throw Error('This group has no match.');

        for (const match of matches)
            await this.adjustMatchChildGames(match, childCount);
    }

    /**
     * Updates child count of all matches of a round.
     *
     * @param roundId ID of the round.
     * @param childCount The target child count.
     */
    private async updateRoundMatchChildCount(
        roundId: Id,
        childCount: number,
    ): Promise<void> {
        await matchDb.updateByFilter(
            this.db,
            { round_id: roundId },
            { child_count: childCount },
        );

        const matches = await matchDb.getByRound(this.db, roundId);
        if (!matches || matches.length === 0)
            throw Error('This round has no match.');

        for (const match of matches)
            await this.adjustMatchChildGames(match, childCount);
    }

    /**
     * Updates the ordering of participants in a round's matches.
     *
     * @param roundNumber The number of the round.
     * @param matches The matches of the round.
     * @param positions The new positions.
     */
    private async applyRoundOrdering(
        roundNumber: number,
        matches: Match[],
        positions: number[],
    ): Promise<void> {
        for (const match of matches) {
            const updated = { ...match };
            updated.opponent1 = helpers.findPosition(
                matches,
                positions.shift()!,
            );

            // The only rounds where we have a second ordered participant are first rounds of brackets (upper and lower).
            if (roundNumber === 1) {
                updated.opponent2 = helpers.findPosition(
                    matches,
                    positions.shift()!,
                );
            }

            await matchDb.update(this.db, updated.id, updated);
        }
    }

    /**
     * Adds or deletes match games of a match based on a target child count.
     *
     * @param match The match of which child games need to be adjusted.
     * @param targetChildCount The target child count.
     */
    private async adjustMatchChildGames(
        match: Match,
        targetChildCount: number,
    ): Promise<void> {
        const games = await matchGameDb.getByParent(this.db, match.id);
        let childCount = games ? games.length : 0;

        const { v4: uuidv4 } = await import('uuid');

        while (childCount < targetChildCount) {
            await matchGameDb.insert(this.db, {
                id: uuidv4(),
                number: childCount + 1,
                stage_id: String(match.stage_id),
                parent_id: String(match.id),
                status: match.status,
                opponent1: { id: null },
                opponent2: { id: null },
            });

            childCount++;
        }

        while (childCount > targetChildCount) {
            await matchGameDb.delete(this.db, {
                parent_id: match.id,
                number: childCount,
            });

            childCount--;
        }

        await matchDb.update(this.db, match.id, {
            ...match,
            child_count: targetChildCount,
        });
    }
}
