import { CycleValidationResult } from '../types/cycle-validation-result.types';

export class CycleCheckerUtil {
    public static searchForCycles(graph: Record<string, string[]>): CycleValidationResult {
        const initialCycleValidationResult: CycleValidationResult = {
            notPartOfCycle: [],
            undefinedNodeReferences: [],
            cycles: []
        };
        return Object.keys(graph).reduce((prev: CycleValidationResult, curr: string): CycleValidationResult => {
            const nextResult: CycleValidationResult = this.searchGraphForCyclesRecursively(graph, curr, prev, []);
            if (!CycleCheckerUtil.isPartOfExistingCycle(curr, nextResult)) {
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
            CycleCheckerUtil.isPartOfExistingCycle(currentNode, currentResult) ||
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

    private static isPartOfExistingCycle(node: string, cycleValidationResult: CycleValidationResult): boolean {
        return cycleValidationResult.cycles.some((cycle: string[]) => cycle.includes(node));
    }

    private static isAlreadyUnknownNode(node: string, cycleValidationResult: CycleValidationResult): boolean {
        return cycleValidationResult.undefinedNodeReferences.includes(node);
    }
}
