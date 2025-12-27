import { Match, Id, Status } from '@/model';
import { BaseUpdater } from './base/updater';
import * as helpers from './helpers';
import { stageDb, groupDb, roundDb, matchDb, matchGameDb } from './db';

export class Reset extends BaseUpdater {
    /**
     * Resets the results of a match.
     *
     * This will update related matches accordingly.
     *
     * @param matchId ID of the match.
     */
    public async matchResults(matchId: Id): Promise<void> {
        const stored = await matchDb.getById(this.db, matchId);
        if (!stored) throw Error('Match not found.');

        const stage = await stageDb.getById(this.db, stored.stage_id);
        if (!stage) throw Error('Stage not found.');

        const group = await groupDb.getById(this.db, stored.group_id);
        if (!group) throw Error('Group not found.');

        const { roundNumber, roundCount } = await this.getRoundPositionalInfo(
            stored.round_id,
        );
        const matchLocation = helpers.getMatchLocation(
            stage.type,
            group.number,
        );
        const nextMatches = await this.getNextMatches(
            stored,
            matchLocation,
            stage,
            roundNumber,
            roundCount,
        );

        if (
            !helpers.isMatchUpdateLocked(stored) &&
            this.isMatchLinkedWithUnlockedNextMatches(nextMatches)
        )
            throw Error(
                'The match is linked to other matches that need to be reset first.',
            );

        helpers.resetMatchResults(stored);
        await this.updateMatch(stored, stored);
    }

    /**
     * Resets the seeding of a stage.
     *
     * @param stageId ID of the stage.
     */
    public async seeding(stageId: Id): Promise<void> {
        await this.updateSeeding(stageId, { seeding: null }, true);
    }

    /**
     * Resets the results of a match game and its parent match.
     *
     * @param gameId ID of the match game.
     */
    public async matchGameResults(gameId: Id): Promise<void> {
        const stored = await matchGameDb.getById(this.db, gameId);
        if (!stored) throw Error('Match game not found.');

        const stage = await stageDb.getById(this.db, stored.stage_id);
        if (!stage) throw Error('Stage not found.');

        const inRoundRobin = helpers.isRoundRobin(stage);
        helpers.resetMatchResults(stored);

        await matchGameDb.update(this.db, stored.id, stored);
        await this.updateParentMatch(stored.parent_id, inRoundRobin);
    }

    /**
     * Checks if the next matches are ready or have a higher status.
     * This is used to determine if we can reset the current match without affecting the next matches.
     *
     * @param nextMatches The matches following the current match.
     */
    private isMatchLinkedWithUnlockedNextMatches(
        nextMatches: (Match | null)[],
    ): boolean {
        return nextMatches.some(
            (match) => match && match.status >= Status.Ready,
        );
    }
}
