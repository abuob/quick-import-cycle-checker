import { LoggerUtil } from '../logger.util';

describe('LoggerUtil', () => {
    describe('createCycleResultLog', () => {
        it('should report no cycle', () => {
            const actual: string = LoggerUtil.createCycleResultLog({
                cycles: [],
                undefinedNodeReferences: [],
                notPartOfCycle: []
            });
            const expected: string = 'No cycle found.';
            expect(actual).toEqual(expected);
        });

        it('should report a simple cycle', () => {
            const actual: string = LoggerUtil.createCycleResultLog({
                cycles: [['file/a.ts', 'some/file/b.ts']],
                undefinedNodeReferences: [],
                notPartOfCycle: []
            });
            const expected: string = 'Found 1 cycles!\n' + '--- Cycle #1:\n' + 'file/a.ts\n' + 'some/file/b.ts\n' + 'file/a.ts';
            expect(actual).toEqual(expected);
        });

        it('should report two cycles', () => {
            const actual: string = LoggerUtil.createCycleResultLog({
                cycles: [
                    ['file/a.ts', 'some/file/b.ts'],
                    ['file/c.ts', 'some/file/d.ts']
                ],
                undefinedNodeReferences: [],
                notPartOfCycle: []
            });
            const expected: string =
                'Found 2 cycles!\n' +
                '--- Cycle #1:\n' +
                'file/a.ts\n' +
                'some/file/b.ts\n' +
                'file/a.ts\n' +
                '--- Cycle #2:\n' +
                'file/c.ts\n' +
                'some/file/d.ts\n' +
                'file/c.ts';
            expect(actual).toEqual(expected);
        });
    });
});
