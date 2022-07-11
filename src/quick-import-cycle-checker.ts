import { GraphCreator } from './util/graph.creator';
import { CycleCheckerUtil } from './util/cycle-checker.util';

export class QuickImportCycleChecker {
    private absoluteDirectoryPaths: string[] = [];
    private absoluteRootDirectoryPath: string | null = null;

    constructor(absoluteDirectoryPaths: string[]) {
        this.absoluteDirectoryPaths = absoluteDirectoryPaths;
    }

    public static forDirectories(...absoluteDirectoryPaths: string[]): QuickImportCycleChecker {
        return new QuickImportCycleChecker(absoluteDirectoryPaths);
    }

    public withRootDirectory(absoluteRootDirectoryPath: string): QuickImportCycleChecker {
        this.absoluteRootDirectoryPath = absoluteRootDirectoryPath;
        return this;
    }

    public async checkForCycles(): Promise<void> {
        const graphCreator: GraphCreator = GraphCreator.builder()
            .withDirectoriesToCheck(...this.absoluteDirectoryPaths)
            .build();
        return graphCreator.createImportGraph().then((importGraph: Record<string, string[]>): void => {
            CycleCheckerUtil.checkForCycles(importGraph);
        });
    }
}
