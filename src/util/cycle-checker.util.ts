export class CycleCheckerUtil {
    public static checkForCycles(filePathToImportPathsMap: Record<string, string[]>): void {
        let visitedAlready: string[] = [];
        Object.keys(filePathToImportPathsMap).forEach((filePath) => {
            CycleCheckerUtil.checkForCycleRecursively(filePathToImportPathsMap, filePath, visitedAlready, []);
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
            throw new Error();
        }
        const importsOfFile = filePathToImportPathsMap[filePath];
        if (!importsOfFile) {
            console.error(`Couldn't find imports of file "${filePath}", aborting!`);
            throw new Error();
        }
        if (importsOfFile.length === 0) {
            return visitedAlready;
        }
        return importsOfFile.reduce((prev, curr) => {
            const visited = CycleCheckerUtil.checkForCycleRecursively(
                filePathToImportPathsMap,
                curr,
                prev,
                nodesInDfsTraversal.concat(filePath)
            );
            return [...new Set([...prev, ...visited, curr])];
        }, visitedAlready);
    }
}
