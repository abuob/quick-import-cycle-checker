import path from 'path';
import fs from 'fs';
import util from 'util';

export class GraphCreator {
    /**
     *
     * @param repoRoot: absolute path
     * @param directoryToCheck: absolute path
     */
    constructor(private repoRoot: string, private directoryToCheck: string) {}

    public static builder() {
        return new GraphCreatorBuilder();
    }

    public async createGraphForDir(): Promise<Record<string, string[]>> {
        const allFiles: string[] = this.getFilePathsRecursively(this.directoryToCheck)
            .filter((filePath) => /\.ts$/.test(filePath))
            .map((filePath) => this.convertAbsolutePathToPathRelativeToRoot(filePath));

        return this.getAllRelevantImportsRelativeToRootFromFiles(allFiles);
    }

    private async getAllRelevantImportsRelativeToRootFromFiles(relativeFilePaths: string[]): Promise<Record<string, string[]>> {
        const relevantImportsRelativeToRoot: Record<string, string[]> = {};
        const promises: Promise<void>[] = relativeFilePaths.map((relativeFilePath: string) => {
            const absoluteFilePath = path.join(this.repoRoot, relativeFilePath);
            return util
                .promisify(fs.readFile)(absoluteFilePath)
                .then((fileContent): void => {
                    const response = fileContent
                        .toString()
                        .split('\n')
                        .filter((line: string) => /from '.*';/.test(line))
                        .map((fromLine: string): string =>
                            fromLine
                                .replace(/.*from/, '')
                                .replace(/['"]/g, '')
                                .replace(';', '')
                        )
                        .map((relativeOrPackage: string): string => relativeOrPackage.trim())
                        .filter((relativeOrPackage: string) => this.isRelativeImport(relativeOrPackage));
                    relevantImportsRelativeToRoot[relativeFilePath] = response;
                });
        });
        return Promise.all(promises).then((): Record<string, string[]> => {
            return relevantImportsRelativeToRoot;
        });
    }
    private getAllRelevantImportsRelativeToRoot(filePath: string): string[] {
        const absoluteFilePath = path.join(this.repoRoot, filePath);
        const allImportsRelativeToFilePath = this.getImportsRelativeToFile(absoluteFilePath);

        return allImportsRelativeToFilePath
            .map((relativeToFile) => path.join(filePath, '../', relativeToFile))
            .map((filePath) => `${filePath}.ts`);
    }

    private getImportsRelativeToFile(absoluteFilePath: string): string[] {
        // TODO Make file-reads nonblocking
        return fs
            .readFileSync(absoluteFilePath)
            .toString()
            .split('\n')
            .filter((line: string) => /from '.*';/.test(line))
            .map((fromLine: string): string =>
                fromLine
                    .replace(/.*from/, '')
                    .replace(/['"]/g, '')
                    .replace(';', '')
            )
            .map((relativeOrPackage: string): string => relativeOrPackage.trim())
            .filter((relativeOrPackage: string) => this.isRelativeImport(relativeOrPackage));
    }

    private isRelativeImport(packageOrRelativeImport: string): boolean {
        return packageOrRelativeImport.startsWith('.') && !/.json/.test(packageOrRelativeImport);
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

    private convertAbsolutePathToPathRelativeToRoot(absoluteFileOrDirPath: string) {
        return absoluteFileOrDirPath.replace(this.repoRoot, '');
    }
}

class GraphCreatorBuilder {
    public repoRoot: string | null = null;
    public directoryToCheck: string | null = null;

    public withRepoRoot(repoRoot: string): GraphCreatorBuilder {
        this.repoRoot = repoRoot;
        return this;
    }

    public withDirectoryToCheck(absoluteDirectoryPath: string): GraphCreatorBuilder {
        this.directoryToCheck = absoluteDirectoryPath;
        return this;
    }

    public build(): GraphCreator {
        if (!this.directoryToCheck) {
            console.error('Cannot build GraphCreator, abort!');
            process.exit(1);
            return new GraphCreator('invalid-path', 'invalid-path');
        }
        return new GraphCreator(this.directoryToCheck, this.directoryToCheck);
    }
}
