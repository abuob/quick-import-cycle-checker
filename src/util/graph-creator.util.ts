import path from 'path';
import fs from 'fs';

export class GraphCreatorUtil {
    private static repoRoot = path.join(__dirname, './');

    public static createGraphForDir(absoluteDir: string): Record<string, string[]> {
        const fileToImportsMap: Record<string, string[]> = {};
        const allFiles: string[] = GraphCreatorUtil.getFilePathsRecursively(absoluteDir)
            .filter((filePath) => /\.ts$/.test(filePath))
            .map((filePath) => GraphCreatorUtil.convertAbsolutePathToPathRelativeToRoot(filePath));

        allFiles.forEach((filePath: string) => {
            fileToImportsMap[filePath] = GraphCreatorUtil.getAllRelevantImportsRelativeToRoot(filePath);
        });
        return fileToImportsMap;
    }

    private static getAllRelevantImportsRelativeToRoot(filePath: string): string[] {
        const absoluteFilePath = path.join(GraphCreatorUtil.repoRoot, filePath);
        const allImportsRelativeToFilePath = GraphCreatorUtil.getImportsRelativeToFile(absoluteFilePath);

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
            .filter((relativeOrPackage: string) => GraphCreatorUtil.isRelativeImport(relativeOrPackage));
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
                    ? GraphCreatorUtil.getFilePathsRecursively(path.join(absoluteDirPath, curr))
                    : [path.join(absoluteDirPath, curr)];
                return prev.concat(currentEntry);
            }, []);
    }

    private static convertAbsolutePathToPathRelativeToRoot(absoluteFileOrDirPath: string) {
        return absoluteFileOrDirPath.replace(GraphCreatorUtil.repoRoot, '');
    }
}
