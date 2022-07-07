import { GraphCreator } from '../graph.creator';
import * as path from 'path';
import { CycleCheckerUtil } from '../cycle-checker.util';

describe('CycleCheckerUtil', () => {
    it('should detect a simple cycle', async () => {
        const graphCreator: GraphCreator = GraphCreator.builder()
            .withRepoRoot(path.join(__dirname, './fixtures'))
            .withDirectoryToCheck(path.join(__dirname, './fixtures'))
            .build();

        const graphWithCycle = await graphCreator.createGraphForDir();
        expect(() => CycleCheckerUtil.checkForCycles(graphWithCycle)).toThrow();
    });
});
