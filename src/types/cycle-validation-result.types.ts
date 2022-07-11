export interface CycleValidationResult {
    notPartOfCycle: string[];
    cycles: string[][];
    undefinedNodeReferences: string[];
}
