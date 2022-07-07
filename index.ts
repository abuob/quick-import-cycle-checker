import * as path from 'path';
import * as fs from 'fs';

class ImportGraphCreatorUtil {
    private static repoRoot = path.join(__dirname, './');

    public static createGraphForDir(absoluteDir: string): Record<string, string[]> {
        const fileToImportsMap: Record<string, string[]> = {};
        const allFiles: string[] = ImportGraphCreatorUtil.getFilePathsRecursively(absoluteDir)
            .filter((filePath) => /\.ts$/.test(filePath))
            .map((filePath) => ImportGraphCreatorUtil.convertAbsolutePathToPathRelativeToRoot(filePath));

        allFiles.forEach((filePath: string) => {
            fileToImportsMap[filePath] = ImportGraphCreatorUtil.getAllRelevantImportsRelativeToRoot(filePath);
        });
        return fileToImportsMap;
    }

    private static getAllRelevantImportsRelativeToRoot(filePath: string): string[] {
        const absoluteFilePath = path.join(ImportGraphCreatorUtil.repoRoot, filePath);
        const allImportsRelativeToFilePath = ImportGraphCreatorUtil.getImportsRelativeToFile(absoluteFilePath);

        return allImportsRelativeToFilePath
            .map((relativeToFile) => path.join(filePath, '../', relativeToFile))
            .map((filePath) => `${filePath}.ts`);
    }

    private static getImportsRelativeToFile(absoluteFilePath: string): string[] {
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
            .filter((relativeOrPackage: string) => ImportGraphCreatorUtil.isRelativeImport(relativeOrPackage));
    }

    private static isRelativeImport(packageOrRelativeImport: string): boolean {
        return packageOrRelativeImport.startsWith('.') && !/.json/.test(packageOrRelativeImport);
    }

    private static getFilePathsRecursively(absoluteDirPath: string): string[] {
        const excludedDirectories: string[] = ['node_modules', 'dist', '.git'];
        const directoryContent: string[] = fs.readdirSync(absoluteDirPath);
        return directoryContent
            .filter((fileOrDirectory: string) => !excludedDirectories.includes(fileOrDirectory))
            .reduce((prev: string[], curr: string): string[] => {
                const currentEntry = fs.statSync(path.join(absoluteDirPath, curr)).isDirectory()
                    ? ImportGraphCreatorUtil.getFilePathsRecursively(path.join(absoluteDirPath, curr))
                    : [path.join(absoluteDirPath, curr)];
                return prev.concat(currentEntry);
            }, []);
    }

    private static convertAbsolutePathToPathRelativeToRoot(absoluteFileOrDirPath: string) {
        return absoluteFileOrDirPath.replace(ImportGraphCreatorUtil.repoRoot, '');
    }
}

class ImportGraphCycleCheckerUtil {
    public static checkForCycles(filePathToImportPathsMap: Record<string, string[]>): void {
        let visitedAlready: string[] = [];
        Object.keys(filePathToImportPathsMap).forEach((filePath) => {
            ImportGraphCycleCheckerUtil.checkForCycleRecursively(filePathToImportPathsMap, filePath, visitedAlready, []);
            visitedAlready = visitedAlready.concat(filePath);
        });
    }

    private static checkForCycleRecursively(
        filePathToImportPathsMap: Record<string, string[]>,
        filePath: string,
        visitedAlready: string[],
        nodesInDfsTraversal: string[]
    ): string[] {
        if (visitedAlready.includes(filePath)) {
            return visitedAlready;
        }
        if (nodesInDfsTraversal.includes(filePath)) {
            const cyclicFiles = nodesInDfsTraversal.slice(nodesInDfsTraversal.indexOf(filePath)).concat(filePath);
            const cyclicFilesFormatted = `${cyclicFiles.join('\n')}`;
            console.error(`Import cycle found between the following files; first and last file should be equal:`);
            console.log(`${cyclicFilesFormatted}`);
            process.exit(1);
        }
        const importsOfFile = filePathToImportPathsMap[filePath];
        if (!importsOfFile) {
            console.error(`Couldn't find imports of file "${filePath}", aborting!`);
            process.exit(1);
        }
        if (importsOfFile.length === 0) {
            return visitedAlready;
        }
        return importsOfFile.reduce((prev, curr) => {
            const visited = ImportGraphCycleCheckerUtil.checkForCycleRecursively(
                filePathToImportPathsMap,
                curr,
                prev,
                nodesInDfsTraversal.concat(filePath)
            );
            return [...new Set([...prev, ...visited, curr])];
        }, visitedAlready);
    }
}

function main() {
    // TODO Make this more elegant/configurable
    const dirPath = __dirname;

    const importGraph = ImportGraphCreatorUtil.createGraphForDir(dirPath);
    ImportGraphCycleCheckerUtil.checkForCycles(importGraph);
}

main();
