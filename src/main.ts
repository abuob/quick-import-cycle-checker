import { GraphCreatorUtil } from './util/graph-creator.util';
import { CycleCheckerUtil } from './util/cycle-checker.util';

export function main() {
    // TODO Make this more elegant/configurable
    const dirPath = __dirname;

    const importGraph = GraphCreatorUtil.createGraphForDir(dirPath);
    CycleCheckerUtil.checkForCycles(importGraph);
}
