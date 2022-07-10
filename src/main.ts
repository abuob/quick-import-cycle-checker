import { GraphCreator } from './util/graph.creator';
import { CycleCheckerUtil } from './util/cycle-checker.util';

export async function main() {
    // TODO Make this more elegant/configurable
    const directoryToCheck = process.cwd();
    const repoRoot = process.cwd();

    const graphCreator: GraphCreator = GraphCreator.builder().withRepoRoot(directoryToCheck).withDirectoriesToCheck(repoRoot).build();

    const importGraph = await graphCreator.createGraphForDir();
    CycleCheckerUtil.checkForCycles(importGraph);
}
