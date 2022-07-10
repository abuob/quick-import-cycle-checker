import { GraphCreator } from './util/graph.creator';
import { CycleCheckerUtil } from './util/cycle-checker.util';

export async function main() {
    // TODO Make this more elegant/configurable
    const directoryToCheck = __dirname;
    const repoRoot = __dirname;

    const graphCreator: GraphCreator = GraphCreator.builder().withRepoRoot(directoryToCheck).withDirectoriesToCheck(repoRoot).build();

    const importGraph = await graphCreator.createGraphForDir();
    CycleCheckerUtil.checkForCycles(importGraph);
}
