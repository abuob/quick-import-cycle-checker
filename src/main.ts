import { GraphCreator } from './util/graph.creator';
import { CycleCheckerUtil } from './util/cycle-checker.util';

export async function main() {
    // TODO Make this more elegant/configurable
    const directoryToCheck = process.cwd();

    const graphCreator: GraphCreator = GraphCreator.builder().withDirectoriesToCheck(directoryToCheck).build();

    const importGraph = await graphCreator.createImportGraph();
    CycleCheckerUtil.checkForCycles(importGraph);
}
