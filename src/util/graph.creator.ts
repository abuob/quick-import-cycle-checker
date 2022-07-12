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
                        return this.parseRawImportLocation(absoluteFilePath, importLocationLiteral);
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

    private async getImportLocationLiteralsFromFile(absoluteFilePath: string): Promise<string[]> {
        return util
            .promisify(fs.readFile)(absoluteFilePath)
            .then((fileContent): string[] => {
                return fileContent
                    .toString()
                    .split('\n')
                    .filter((line: string) => /[ ]from[ ]['"].*['"]/.test(line))
                    .map((fromLine) => {
                        return this.getImportLocationLiteral(fromLine);
                    });
            });
    }

    private parseRawImportLocation(absoluteFilePathOfImporter: string, rawImportLocation: string): ImportLocation {
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
                resolvedAbsoluteFilePath: path.join(fileDirectory, this.resolveModule(rawImportLocation))
            };
        }
        return {
            type: 'package-import',
            packageName: rawImportLocation
        };
    }

    private resolveModule(rawImportLocation: string): string {
        if (/[.]ts$/.test(rawImportLocation)) {
            return rawImportLocation;
        }
        // Currently hard-coded to just support typescript for the time being.
        // TODO: Make customizable/configurable
        return `${rawImportLocation}.ts`;
    }

    private getImportLocationLiteral(line: string): string {
        return line
            .replace(/.*from/, '')
            .replace(/['"]/g, '')
            .replace(';', '')
            .trim();
    }

    private getFilePathsRecursively(absoluteDirPath: string): string[] {
        const excludedDirectories: string[] = ['node_modules', 'dist', '.git'];
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
