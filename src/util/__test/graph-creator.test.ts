import { GraphCreator } from '../graph.creator';
import path from 'path';
import { ImportLocation, RelativeFileImport } from '../../types/import-location.types';

describe('GraphCreator', () => {
    describe('getImportLocationLiteral', () => {
        it('should extract the raw content of the import location in a `... from "<...>"`', () => {
            // @ts-expect-error private; only require access for testing
            const getImportLocationLiteral: (line: string) => string = new GraphCreator('', []).getImportLocationLiteral;
            expect(getImportLocationLiteral("import {} from 'some-package';")).toEqual('some-package');
            expect(getImportLocationLiteral("import {} from '@stuff/some-package';")).toEqual('@stuff/some-package');
            expect(getImportLocationLiteral("import {} from '../../relative/path';")).toEqual('../../relative/path');
            expect(getImportLocationLiteral("import {} from './file';")).toEqual('./file');
            expect(getImportLocationLiteral("import {} from '../some-thing';")).toEqual('../some-thing');
        });
    });

    describe('getImportLocationLiteralsFromFile', () => {
        it('should read a file and then invoke the "getImportLocationLiteral"-method on the relevant lines`', async () => {
            const getImportLocationLiteralsFromFile: (absoluteFilePath: string) => Promise<string[]> = (absoluteFilePath) =>
                // @ts-expect-error private; only require access for testing
                new GraphCreator('', []).getImportLocationLiteralsFromFile(absoluteFilePath);

            const filePath1: string = path.join(__dirname, '/fixtures/handle-import-with-doublequotes/file-imports-A.ts');
            const result1: string[] = await getImportLocationLiteralsFromFile(filePath1);
            expect(result1).toStrictEqual(['./file-imports-B']);

            const filePath2: string = path.join(__dirname, '/fixtures/simple-cycle-with-subdir/file-imports-A.ts');
            const result2: string[] = await getImportLocationLiteralsFromFile(filePath2);
            expect(result2).toStrictEqual(['./sub/file-A']);

            const filePath3: string = path.join(__dirname, '/fixtures/simple-cycle-with-subdir/sub/file-A.ts');
            const result3: string[] = await getImportLocationLiteralsFromFile(filePath3);
            expect(result3).toStrictEqual(['../file-imports-B']);
        });
    });

    describe('parseRawImportLocation', () => {
        it('should resolve relative file imports', async () => {
            const parseRawImportLocation: (absoluteFilePathOfImporter: string, rawImportLocation: string) => ImportLocation = (
                absoluteFilePathOfImporter: string,
                rawImportLocation: string
            ): ImportLocation =>
                // @ts-expect-error private; only require access for testing
                new GraphCreator('', []).parseRawImportLocation(absoluteFilePathOfImporter, rawImportLocation);

            const actual1 = parseRawImportLocation('/my/absolute/file/path/some-file.ts', './some-other-file.ts');
            const expected1: RelativeFileImport = {
                type: 'relative-file-import',
                rawLiteral: './some-other-file.ts',
                resolvedAbsoluteFilePath: '/my/absolute/file/path/some-other-file.ts'
            };
            expect(actual1).toEqual(expected1);

            const actual2 = parseRawImportLocation('/my/absolute/file/path/some-file.ts', '../../some-other-file.ts');
            const expected2: RelativeFileImport = {
                type: 'relative-file-import',
                rawLiteral: '../../some-other-file.ts',
                resolvedAbsoluteFilePath: '/my/absolute/some-other-file.ts'
            };
            expect(actual2).toEqual(expected2);

            const actual3 = parseRawImportLocation('/my/absolute/file/path/some-file.ts', '../../some-module');
            const expected3: RelativeFileImport = {
                type: 'relative-file-import',
                rawLiteral: '../../some-module',
                resolvedAbsoluteFilePath: '/my/absolute/some-module.ts'
            };
            expect(actual3).toEqual(expected3);
        });
    });
});
