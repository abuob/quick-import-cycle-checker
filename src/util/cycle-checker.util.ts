import { CycleValidationResult } from '../types/cycle-validation-result.types';

export class CycleCheckerUtil {
    public static checkForCycles(filePathToImportPathsMap: Record<string, string[]>): void {
        let visitedAlready: string[] = [];
        Object.keys(filePathToImportPathsMap).forEach((filePath) => {
            CycleCheckerUtil.checkForCycleRecursively(filePathToImportPathsMap, filePath, visitedAlready, []);
            visitedAlready = visitedAlready.concat(filePath);
        });
    }

    public static searchForCycles(graph: Record<string, string[]>): CycleValidationResult {
        const initialCycleValidationResult: CycleValidationResult = {
            notPartOfCycle: [],
            undefinedNodeReferences: [],
            cycles: []
        };
        return Object.keys(graph).reduce((prev: CycleValidationResult, curr: string): CycleValidationResult => {
            const nextResult: CycleValidationResult = this.searchGraphForCyclesRecursively(graph, curr, prev, []);
            if (!CycleCheckerUtil.isPartExistingOfCycle(curr, nextResult)) {
                return {
                    ...nextResult,
                    notPartOfCycle: [...nextResult.notPartOfCycle, curr]
                };
            }
            return nextResult;
        }, initialCycleValidationResult);
    }

    private static searchGraphForCyclesRecursively(
        graph: Record<string, string[]>,
        currentNode: string,
        currentResult: CycleValidationResult,
        nodesInDfsTraversal: string[]
    ): CycleValidationResult {
        if (currentResult.notPartOfCycle.includes(currentNode)) {
            return currentResult;
        }
        if (
            CycleCheckerUtil.isPartExistingOfCycle(currentNode, currentResult) ||
            CycleCheckerUtil.isAlreadyUnknownNode(currentNode, currentResult)
        ) {
            return currentResult;
        }
        if (nodesInDfsTraversal.includes(currentNode)) {
            const nodesInCycle: string[] = nodesInDfsTraversal.slice(nodesInDfsTraversal.indexOf(currentNode));
            return {
                ...currentResult,
                cycles: [...currentResult.cycles, nodesInCycle]
            };
        }
        const connectedNodes: string[] | undefined = graph[currentNode];
        if (!connectedNodes) {
            return {
                ...currentResult,
                undefinedNodeReferences: [...currentResult.undefinedNodeReferences, currentNode]
            };
        }
        return connectedNodes.reduce((prev: CycleValidationResult, curr: string): CycleValidationResult => {
            return this.searchGraphForCyclesRecursively(graph, curr, prev, [...nodesInDfsTraversal, currentNode]);
        }, currentResult);
    }

    private static isPartExistingOfCycle(node: string, cycleValidationResult: CycleValidationResult): boolean {
        return cycleValidationResult.cycles.some((cycle: string[]) => cycle.includes(node));
    }

    private static isAlreadyUnknownNode(node: string, cycleValidationResult: CycleValidationResult): boolean {
        return cycleValidationResult.undefinedNodeReferences.includes(node);
    }

    private static checkForCycleRecursively(
        filePathToImportPathsMap: Record<string, string[]>,
        filePath: string,
        visitedAlready: string[],
        nodesInDfsTraversal: string[]
    ): string[] {
        if (visitedAlready.includes(filePath)) {
            return visitedAlready;
        }
        if (nodesInDfsTraversal.includes(filePath)) {
            const cyclicFiles = nodesInDfsTraversal.slice(nodesInDfsTraversal.indexOf(filePath)).concat(filePath);
            const cyclicFilesFormatted = `${cyclicFiles.join('\n')}`;
            // eslint-disable-next-line no-console
            console.error(`Import cycle found between the following files; first and last file should be equal:`);
            // eslint-disable-next-line no-console
            console.log(`${cyclicFilesFormatted}`);
            throw new Error();
        }
        const importsOfFile: string[] | undefined = filePathToImportPathsMap[filePath];
        if (!importsOfFile) {
            // eslint-disable-next-line no-console
            console.error(`Couldn't find imports of file "${filePath}", aborting!`);
            throw new Error();
        }
        if (importsOfFile.length === 0) {
            return visitedAlready;
        }
        return importsOfFile.reduce((prev: string[], curr: string): string[] => {
            const visited = CycleCheckerUtil.checkForCycleRecursively(
                filePathToImportPathsMap,
                curr,
                prev,
                nodesInDfsTraversal.concat(filePath)
            );
            return [...new Set([...prev, ...visited, curr])];
        }, visitedAlready);
    }
}
