import { LoggerUtil } from '../logger.util';

describe('LoggerUtil', () => {
    describe('createCycleResultLog', () => {
        it('should report no cycle', () => {
            const actual: string = LoggerUtil.createCycleResultLog(
                {
                    cycles: [],
                    undefinedNodeReferences: [],
                    notPartOfCycle: []
                },
                null
            );
            const expected: string = 'No cycle found.';
            expect(actual).toEqual(expected);
        });

        it('should report a simple cycle', () => {
            const actual: string = LoggerUtil.createCycleResultLog(
                {
                    cycles: [['file/a.ts', 'some/file/b.ts']],
                    undefinedNodeReferences: [],
                    notPartOfCycle: []
                },
                null
            );
            const expected: string = 'Found 1 cycles!\n' + '--- Cycle #1:\n' + 'file/a.ts\n' + 'some/file/b.ts\n' + 'file/a.ts';
            expect(actual).toEqual(expected);
        });

        it('should report two cycles', () => {
            const actual: string = LoggerUtil.createCycleResultLog(
                {
                    cycles: [
                        ['file/a.ts', 'some/file/b.ts'],
                        ['file/c.ts', 'some/file/d.ts']
                    ],
                    undefinedNodeReferences: [],
                    notPartOfCycle: []
                },
                null
            );
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

        it('should cut the root-directory out when available', () => {
            const actual: string = LoggerUtil.createCycleResultLog(
                {
                    cycles: [
                        ['path/to/root/src/a.ts', 'path/to/root/src/b.ts'],
                        ['path/to/root/src/c.ts', 'path/to/root/src/d.ts']
                    ],
                    undefinedNodeReferences: [],
                    notPartOfCycle: []
                },
                'path/to/root/'
            );
            const expected: string =
                'Found 2 cycles!\n' +
                '--- Cycle #1:\n' +
                'src/a.ts\n' +
                'src/b.ts\n' +
                'src/a.ts\n' +
                '--- Cycle #2:\n' +
                'src/c.ts\n' +
                'src/d.ts\n' +
                'src/c.ts';
            expect(actual).toEqual(expected);
        });
    });
});
