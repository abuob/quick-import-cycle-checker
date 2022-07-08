import { GraphCreator } from '../graph.creator';
import * as path from 'path';
import { CycleCheckerUtil } from '../cycle-checker.util';

describe('CycleCheckerUtil', () => {
    const tests: [string, string, boolean][] = [
        ['simple-cycle', 'should detect a simple cycle', true],
        ['no-cycle-simple', 'should detect no cycle', false]
    ];

    tests.forEach(([filePath, description, throws]) => {
        const directory = `./fixtures/${filePath}`;
        it(description, async () => {
            const graphCreator: GraphCreator = GraphCreator.builder()
                .withRepoRoot(path.join(__dirname, directory))
                .withDirectoryToCheck(path.join(__dirname, directory))
                .build();

            const testGraph = await graphCreator.createGraphForDir();
            if (throws) {
                expect(() => CycleCheckerUtil.checkForCycles(testGraph)).toThrow();
            } else {
                expect(() => CycleCheckerUtil.checkForCycles(testGraph)).not.toThrow();
            }
        });
    });
});
