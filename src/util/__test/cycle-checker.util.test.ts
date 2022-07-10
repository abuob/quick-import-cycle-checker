import { GraphCreator } from '../graph.creator';
import * as path from 'path';
import { CycleCheckerUtil } from '../cycle-checker.util';

describe('CycleCheckerUtil', () => {
    it('should detect a simple cycle and handle subdir', async () => {
        const graphCreator: GraphCreator = GraphCreator.builder()
            .withRepoRoot(path.join(__dirname, './fixtures/simple-cycle-with-subdir'))
            .withDirectoriesToCheck(path.join(__dirname, './fixtures/simple-cycle-with-subdir'))
            .build();

        const graphWithCycle = await graphCreator.createGraphForDir();
        expect(() => CycleCheckerUtil.checkForCycles(graphWithCycle)).toThrow();
    });

    it('should detect a simple cycle and handle doublequotes gracefully', async () => {
        const graphCreator: GraphCreator = GraphCreator.builder()
            .withRepoRoot(path.join(__dirname, './fixtures/handle-import-with-doublequotes'))
            .withDirectoriesToCheck(path.join(__dirname, './fixtures/handle-import-with-doublequotes'))
            .build();

        const graphWithCycle = await graphCreator.createGraphForDir();
        expect(() => CycleCheckerUtil.checkForCycles(graphWithCycle)).toThrow();
    });

    it('should detect no cycle', async () => {
        const graphCreator: GraphCreator = GraphCreator.builder()
            .withRepoRoot(path.join(__dirname, './fixtures/no-cycle-simple'))
            .withDirectoriesToCheck(path.join(__dirname, './fixtures/no-cycle-simple'))
            .build();

        const graphWithCycle = await graphCreator.createGraphForDir();
        expect(() => CycleCheckerUtil.checkForCycles(graphWithCycle)).not.toThrow();
    });

    it('should detect no cycle and handle subdir', async () => {
        const graphCreator: GraphCreator = GraphCreator.builder()
            .withRepoRoot(path.join(__dirname, './fixtures/no-cycle-with-subdir'))
            .withDirectoriesToCheck(path.join(__dirname, './fixtures/no-cycle-with-subdir'))
            .build();

        const graphWithCycle = await graphCreator.createGraphForDir();
        expect(() => CycleCheckerUtil.checkForCycles(graphWithCycle)).not.toThrow();
    });

    it('should detect a simple cycle', async () => {
        const graphCreator: GraphCreator = GraphCreator.builder()
            .withRepoRoot(path.join(__dirname, './fixtures/simple-cycle'))
            .withDirectoriesToCheck(path.join(__dirname, './fixtures/simple-cycle'))
            .build();

        const graphWithCycle = await graphCreator.createGraphForDir();
        expect(() => CycleCheckerUtil.checkForCycles(graphWithCycle)).toThrow();
    });
});
