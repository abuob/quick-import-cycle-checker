import { CycleCheckerUtil } from '../cycle-checker.util';
import { CycleValidationResult } from '../../types/cycle-validation-result.types';

describe('CycleCheckerUtil', () => {
    describe('searchForCycles', () => {
        it('should handle a simple graph without cycles correctly', () => {
            const graph: Record<string, string[]> = {
                a: ['b', 'c'],
                b: ['c'],
                c: ['d'],
                d: []
            };
            const expected: CycleValidationResult = {
                undefinedNodeReferences: [],
                notPartOfCycle: ['d', 'c', 'b', 'a'],
                cycles: []
            };
            expect(CycleCheckerUtil.searchForCycles(graph)).toEqual(expected);
        });

        it('should find a simple cycle', () => {
            const graph: Record<string, string[]> = {
                a: ['b'],
                b: ['c'],
                c: ['d'],
                d: ['a']
            };
            const expected: CycleValidationResult = {
                undefinedNodeReferences: [],
                notPartOfCycle: [],
                cycles: [['a', 'b', 'c', 'd']]
            };
            expect(CycleCheckerUtil.searchForCycles(graph)).toEqual(expected);
        });

        it('should find multiple cycles', () => {
            const graph: Record<string, string[]> = {
                a: ['b'],
                b: ['a'],
                c: ['d'],
                d: ['c']
            };
            const expected: CycleValidationResult = {
                undefinedNodeReferences: [],
                notPartOfCycle: [],
                cycles: [
                    ['a', 'b'],
                    ['c', 'd']
                ]
            };
            expect(CycleCheckerUtil.searchForCycles(graph)).toEqual(expected);
        });

        it('should handle undefined edge-connections properly', () => {
            const graph: Record<string, string[]> = {
                a: ['b'],
                b: ['TOTALLY-NOT-DEFINED']
            };
            const expected: CycleValidationResult = {
                undefinedNodeReferences: ['TOTALLY-NOT-DEFINED'],
                notPartOfCycle: ['b', 'a'],
                cycles: []
            };
            expect(CycleCheckerUtil.searchForCycles(graph)).toEqual(expected);
        });

        it('should ignore nodes that are already part of a cycle', () => {
            const graph: Record<string, string[]> = {
                a: ['b'],
                b: ['a'],
                c: ['a'],
                d: ['b']
            };
            const expected: CycleValidationResult = {
                undefinedNodeReferences: [],
                notPartOfCycle: ['c', 'd'],
                cycles: [['a', 'b']]
            };
            expect(CycleCheckerUtil.searchForCycles(graph)).toEqual(expected);
        });
    });
});
