import { parseArgs } from '../parse-arguments.util';

describe('Parse-Arguments Util', () => {
    describe('parse simple arguments', () => {
        it('should handle empty arguments', () => {
            const args: string[] = [];

            const expected: Record<string, string[]> = {};

            const actual = parseArgs(args);
            expect(actual).toEqual(expected);
        });

        it('should return the expected arguments', () => {
            const args: string[] = ['--firstArg', 'parameter1', 'parameter2'];

            const expected: Record<string, string[]> = {
                '--firstArg': ['parameter1', 'parameter2']
            };

            const actual = parseArgs(args);
            expect(actual).toEqual(expected);
        });
        it('should handle multiple flags', () => {
            const args: string[] = ['--firstArg', 'parameter1', '--secondArg', 'parameter2'];

            const expected: Record<string, string[]> = {
                '--firstArg': ['parameter1'],
                '--secondArg': ['parameter2']
            };

            const actual = parseArgs(args);
            expect(actual).toEqual(expected);
        });
    });
});
