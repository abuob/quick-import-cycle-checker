import { CycleValidationResult } from '../types/cycle-validation-result.types';

export class LoggerUtil {
    public static createCycleResultLog(validationResult: CycleValidationResult, absoluteDirectoryRoot: string | null): string {
        const cycles: string[][] = validationResult.cycles.map((cycle: string[]) => {
            if (!absoluteDirectoryRoot) {
                return cycle;
            }
            return cycle.map((absoluteFilePath: string) => absoluteFilePath.replace(absoluteDirectoryRoot, ''));
        });
        if (cycles.length === 0) {
            return 'No cycle found.';
        }
        const numberOfCyclesLine: string = `Found ${cycles.length} cycles!`;
        const cycleReportLines: string[] = cycles.map((cycle: string[], index: number): string => {
            const cycleNumberLine: string = `--- Cycle #${index + 1}:`;
            return [cycleNumberLine, ...cycle, cycle[0]].join('\n');
        });
        return [numberOfCyclesLine, ...cycleReportLines].join('\n');
    }
}
