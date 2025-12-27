import { InputStage, Stage } from '@/model';
import { create } from './base/stage/creator';
import type { DrizzleDatabase } from './db';

export async function createStage(
    db: DrizzleDatabase,
    stage: InputStage,
): Promise<Stage> {
    // Create a mock BracketsManager-like object for the creator
    const context = { db };
    return create.call(context as any, stage);
}
