export function parseArgs(args: string[]): Record<string, string[]> {
    let currentKey: string = '';
    const emptyCliSettings: Record<string, string[]> = {};

    return args.reduce((prev: Record<string, string[]>, curr: string): Record<string, string[]> => {
        if (/^--.*/.test(curr)) {
            currentKey = curr;
            return prev;
        }
        return {
            ...prev,
            [currentKey]: [...(prev[currentKey] ?? []), curr]
        };
    }, emptyCliSettings);
}
