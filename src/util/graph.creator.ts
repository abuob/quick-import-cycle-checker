import path from 'path';
import fs from 'fs';
import util from 'util';
import { ImportLocation, RelativeFileImport } from '../types/import-location.types';

export class GraphCreator {
    constructor(private directoriesToCheckAbsolutePaths: string[], private exclusionRegexes: RegExp[]) {}

    public static builder(): GraphCreatorBuilder {
        return new GraphCreatorBuilder();
    }

    public async createImportGraph(): Promise<Record<string, string[]>> {
        const absoluteFilePathImportGraph: Record<string, string[]> = {};
        const allAbsoluteFilePaths: string[] = this.getAllFilesThatNeedCheck();
        const allFilesHandledPromises: Promise<void>[] = allAbsoluteFilePaths.map((absoluteFilePath: string): Promise<void> => {
            return this.getImportLocationLiteralsFromFile(absoluteFilePath)
                .then((importLocationLiterals: string[]): ImportLocation[] => {
                    return importLocationLiterals.map((importLocationLiteral: string): ImportLocation => {
                        return GraphCreator.parseRawImportLocation(absoluteFilePath, importLocationLiteral);
                    });
                })
                .then((importLocations: ImportLocation[]): void => {
                    absoluteFilePathImportGraph[absoluteFilePath] = importLocations
                        .filter(
                            (importLocation: ImportLocation): importLocation is RelativeFileImport =>
                                importLocation.type === 'relative-file-import'
                        )
                        .map((importLocation) => importLocation.resolvedAbsoluteFilePath);
                });
        });
        return Promise.all(allFilesHandledPromises).then((): Record<string, string[]> => {
            return absoluteFilePathImportGraph;
        });
    }

    private static prepareFileContent(fileContent: string): string {
        return fileContent
            .replace(/[/][*](.|\n|\r)*?[*][/]/g, '') // Strip block-comments
            .replace(/export(?!([ ]+(const|class|function|interface|type|default|enum|let|abstract)[ ]))(.|\n|\r\n)+?from[ ]/g, ''); // Strip export-from statements;
    }

    private static searchRawImportLocations(preparedFileContent: string): string[] {
        return preparedFileContent
            .split('\n')
            .filter((line: string) => /[ ]from[ ]['"].*['"]/.test(line)) // import begins with .
            .map((fromLine: string): string | null => {
                return GraphCreator.getImportLocationLiteral(fromLine);
            })
            .reduce((prev: string[], curr: string | null): string[] => (curr ? prev.concat(curr) : prev), []);
    }

    private static getImportLocationLiteral(line: string): string | null {
        const strippedFromComments: string = line.replace(/[/][/].*/, '').trim();
        if (!/from/.test(strippedFromComments)) {
            return null;
        }
        return strippedFromComments
            .replace(/.*from/, '')
            .replace(/['"]/g, '')
            .replace(';', '')
            .trim();
    }

    private static parseRawImportLocation(absoluteFilePathOfImporter: string, rawImportLocation: string): ImportLocation {
        if (/.json$/.test(rawImportLocation)) {
            return {
                type: 'json-module-import',
                rawLiteral: rawImportLocation
            };
        }
        if (rawImportLocation.startsWith('.')) {
            // If this string is path/to/file, we need to resolve relative to path/to, hence the "../" to get rid of "file"
            const fileDirectory: string = path.join(absoluteFilePathOfImporter, '../');
            return {
                type: 'relative-file-import',
                rawLiteral: rawImportLocation,
                resolvedAbsoluteFilePath: path.join(fileDirectory, GraphCreator.resolveModule(rawImportLocation, fileDirectory))
            };
        }
        return {
            type: 'package-import',
            packageName: rawImportLocation
        };
    }

    private static resolveModule(rawImportLocation: string, originDirectory: string): string {
        if (/[.]ts$/.test(rawImportLocation)) {
            // import ends in .ts => has to be a file
            return rawImportLocation;
        }

        if (
            fs.existsSync(path.join(originDirectory, rawImportLocation, '.ts')) &&
            fs.lstatSync(path.join(originDirectory, rawImportLocation, '.ts')).isFile()
        ) {
            return `${rawImportLocation}.ts`;
        }

        // Not a .ts file
        if (
            fs.existsSync(path.join(originDirectory, rawImportLocation)) &&
            fs.lstatSync(path.join(originDirectory, rawImportLocation)).isDirectory()
        ) {
            if (
                fs.existsSync(path.join(originDirectory, rawImportLocation, '/index.ts')) &&
                fs.lstatSync(path.join(originDirectory, rawImportLocation, '/index.ts')).isFile()
            ) {
                return `${rawImportLocation}/index.ts`;
            }
        }
        // Currently hard-coded to just support typescript for the time being.
        // TODO: Make customizable/configurable

        // TODO: Module resolution if there is a non path import like from 'moduleA'
        return `${rawImportLocation}.ts`;
    }

    private async getImportLocationLiteralsFromFile(absoluteFilePath: string): Promise<string[]> {
        return util
            .promisify(fs.readFile)(absoluteFilePath)
            .then((fileContent): string[] => {
                const preparedFileContent: string = GraphCreator.prepareFileContent(fileContent.toString());
                return GraphCreator.searchRawImportLocations(preparedFileContent);
            });
    }

    private getAllFilesThatNeedCheck(): string[] {
        return this.directoriesToCheckAbsolutePaths
            .map((directoryToCheck: string): string[] => {
                return this.getFilePathsRecursively(directoryToCheck)
                    .filter((filePath) => /\.ts$/.test(filePath))
                    .filter(
                        (absoluteFilePath: string) =>
                            !this.exclusionRegexes.some((exclusionRegExp: RegExp) => exclusionRegExp.test(absoluteFilePath))
                    );
            })
            .reduce((prev: string[], curr: string[]): string[] => prev.concat(curr), []);
    }

    private getFilePathsRecursively(absoluteDirPath: string): string[] {
        const excludedDirectories: string[] = ['node_modules', '.git'];
        const directoryContent: string[] = fs.readdirSync(absoluteDirPath);
        return directoryContent
            .filter((fileOrDirectory: string) => !excludedDirectories.includes(fileOrDirectory))
            .reduce((prev: string[], curr: string): string[] => {
                const currentEntry = fs.statSync(path.join(absoluteDirPath, curr)).isDirectory()
                    ? this.getFilePathsRecursively(path.join(absoluteDirPath, curr))
                    : [path.join(absoluteDirPath, curr)];
                return prev.concat(currentEntry);
            }, []);
    }
}

class GraphCreatorBuilder {
    private directoriesToCheck: string[] = [];
    private exclusionRegexes: RegExp[] = [];

    public withDirectoriesToCheck(...absoluteDirectoryPaths: string[]): GraphCreatorBuilder {
        this.directoriesToCheck = absoluteDirectoryPaths;
        return this;
    }

    public withExclusions(exclusionRegexes: RegExp[]): GraphCreatorBuilder {
        this.exclusionRegexes = exclusionRegexes;
        return this;
    }

    public build(): GraphCreator {
        if (this.directoriesToCheck.length === 0) {
            throw new Error('No directories provided, abort!');
        }
        return new GraphCreator(this.directoriesToCheck, this.exclusionRegexes);
    }
}
