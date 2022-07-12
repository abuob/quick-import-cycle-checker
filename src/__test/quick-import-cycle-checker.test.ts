import * as path from 'path';
import { QuickImportCycleChecker } from '../quick-import-cycle-checker';
import { CycleValidationResult } from '../types/cycle-validation-result.types';

describe('CycleCheckerUtil', () => {
    async function getImportCycles(directoryPath: string, exclusionRegexes: RegExp[] = []): Promise<string[][]> {
        const absoluteDirectoryPath: string = path.join(__dirname, directoryPath);
        return QuickImportCycleChecker.forDirectories(absoluteDirectoryPath)
            .withRootDirectory(absoluteDirectoryPath)
            .withExclusions(exclusionRegexes)
            .createImportGraph()
            .searchForImportCycles()
            .getCycleValiationResult()
            .then((validationResult: CycleValidationResult): string[][] => validationResult.cycles);
    }

    it('should detect a simple cycle', async () => {
        const cycles: string[][] = await getImportCycles('./fixtures/simple-cycle');
        expect(cycles).toHaveLength(1);
    });

    it('should detect a simple cycle and handle subdir', async () => {
        const cycles: string[][] = await getImportCycles('./fixtures/simple-cycle-with-subdir');
        expect(cycles).toHaveLength(1);
    });

    it('should detect a simple cycle and handle doublequotes gracefully', async () => {
        const cycles: string[][] = await getImportCycles('./fixtures/handle-import-with-doublequotes');
        expect(cycles).toHaveLength(1);
    });

    it('should not report a cycle if the directory containing the cycle is excluded', async () => {
        const cycles: string[][] = await getImportCycles('./fixtures/simple-cycle-with-subdir', [/[\/]sub[\/]/]);
        expect(cycles).toHaveLength(0);
    });

    it('should not throw if there is no cycle', async () => {
        const cycles: string[][] = await getImportCycles('./fixtures/no-cycle-simple');
        expect(cycles).toHaveLength(0);
    });

    it('should not throw if there is no cycle, including subdirs', async () => {
        const cycles: string[][] = await getImportCycles('./fixtures/no-cycle-with-subdir');
        expect(cycles).toHaveLength(0);
    });
});
