export function parseArgs(argv: string[]): Record<string, string[]> {
    const parsed: Record<string, string[]> = {};

    const args: string[] = argv.slice(2);
    const indicesOfFlags: number[] = [];

    for (let i = 0; i < args.length; i++) {
        const res = args.slice(i).findIndex((value: string): boolean => {
            return /^--.*/.test(value);
        });
        if (res >= 0) {
            indicesOfFlags.push(res + i);
            i += res;
        }
    }

    indicesOfFlags.forEach((flagIndexInArgs: number, indexInIndices: number): void => {
        const nextFlagIndexInArgs = indicesOfFlags[indexInIndices + 1] || args.length;
        if (flagIndexInArgs + 1 >= nextFlagIndexInArgs) {
            // Boolean Flag
            parsed[args[flagIndexInArgs]] = ['true'];
        } else {
            parsed[args[flagIndexInArgs]] = args.slice(flagIndexInArgs + 1, nextFlagIndexInArgs);
        }
    });

    return parsed;
}
