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
            return CycleCheckerUtil.addNodeToExistingResult(curr, nextResult);
        }, initialCycleValidationResult);
    }

    private static searchGraphForCyclesRecursively(
        graph: Record<string, string[]>,
        currentNode: string,
        currentResult: CycleValidationResult,
        nodesInDfsTraversal: string[]
    ): CycleValidationResult {
        if (
            CycleCheckerUtil.isAlreadyNotPartOfACycle(currentNode, currentResult) ||
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
            const nextResult: CycleValidationResult = this.searchGraphForCyclesRecursively(graph, curr, prev, [
                ...nodesInDfsTraversal,
                currentNode
            ]);
            return CycleCheckerUtil.addNodeToExistingResult(curr, nextResult);
        }, currentResult);
    }

    private static addNodeToExistingResult(node: string, cycleValidationResult: CycleValidationResult): CycleValidationResult {
        if (CycleCheckerUtil.isPartOfExistingCycle(node, cycleValidationResult)) {
            return cycleValidationResult;
        }
        if (CycleCheckerUtil.isAlreadyUnknownNode(node, cycleValidationResult)) {
            return cycleValidationResult;
        }
        if (CycleCheckerUtil.isAlreadyNotPartOfACycle(node, cycleValidationResult)) {
            return cycleValidationResult;
        }
        return {
            ...cycleValidationResult,
            notPartOfCycle: [...cycleValidationResult.notPartOfCycle, node]
        };
    }

    private static isPartOfExistingCycle(node: string, cycleValidationResult: CycleValidationResult): boolean {
        return cycleValidationResult.cycles.some((cycle: string[]) => cycle.includes(node));
    }

    private static isAlreadyUnknownNode(node: string, cycleValidationResult: CycleValidationResult): boolean {
        return cycleValidationResult.undefinedNodeReferences.includes(node);
    }

    private static isAlreadyNotPartOfACycle(node: string, cycleValidationResult: CycleValidationResult): boolean {
        return cycleValidationResult.notPartOfCycle.includes(node);
    }
}
