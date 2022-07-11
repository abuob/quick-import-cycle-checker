import { GraphCreator } from './util/graph.creator';
import { CycleCheckerUtil } from './util/cycle-checker.util';
import { CycleValidationResult } from './types/cycle-validation-result.types';
import { LoggerUtil } from './util/logger.util';

export class QuickImportCycleChecker {
    private absoluteDirectoryPaths: string[] = [];
    private absoluteRootDirectoryPath: string | null = null;
    private importGraphPromise: Promise<Record<string, string[]>> | null = null;
    private importCycleValidationResultPromise: Promise<CycleValidationResult> | null = null;

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

    public createImportGraph(): QuickImportCycleChecker {
        const graphCreator: GraphCreator = GraphCreator.builder()
            .withDirectoriesToCheck(...this.absoluteDirectoryPaths)
            .build();
        this.importGraphPromise = graphCreator.createImportGraph();
        return this;
    }

    public searchForImportCycles(): QuickImportCycleChecker {
        if (!this.importGraphPromise) {
            throw new Error('No import graph available, abort!');
        }
        this.importCycleValidationResultPromise = this.importGraphPromise.then(
            (importGraph: Record<string, string[]>): CycleValidationResult => {
                return CycleCheckerUtil.searchForCycles(importGraph);
            }
        );
        return this;
    }

    public reportCyclesAndExit(): void {
        if (!this.importCycleValidationResultPromise) {
            throw new Error('Import Graph has not been searched for cycles yet, abort!');
        }
        this.importCycleValidationResultPromise.then((validationResult: CycleValidationResult): void => {
            const cycles: string[][] = validationResult.cycles;
            const loggingOutput: string = LoggerUtil.createCycleResultLog(validationResult, this.absoluteRootDirectoryPath);
            if (cycles.length === 0) {
                // eslint-disable-next-line no-console
                console.info(loggingOutput);
                process.exit(0);
                return;
            }
            // eslint-disable-next-line no-console
            console.error(loggingOutput);
            process.exit(1);
        });
    }

    public getCycleValiationResult(): Promise<CycleValidationResult> {
        if (!this.importCycleValidationResultPromise) {
            throw new Error('Import Graph has not been searched for cycles yet, abort!');
        }
        return this.importCycleValidationResultPromise;
    }
}
