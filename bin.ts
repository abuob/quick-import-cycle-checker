#!/usr/bin/env node

import { QuickImportCycleChecker } from './src/quick-import-cycle-checker';
import { parseArgs } from './src/util/parse-arguments.util';

export interface cliSettings {
    checkDirs: string[];
    root: string;
    exclusions: RegExp[];
}

const argumentsParsed = parseArgs(process.argv.slice(2));
const settings: cliSettings = {
    checkDirs: argumentsParsed['--checkDirs'] ?? [process.cwd()],
    root: argumentsParsed['--root'] ? argumentsParsed['--root'][0] : process.cwd(),
    exclusions: argumentsParsed['--exclusions']?.map((str) => new RegExp(str)) ?? []
};

QuickImportCycleChecker.forDirectories(...settings.checkDirs)
    .withRootDirectory(settings.root)
    .withExclusions(settings.exclusions)
    .createImportGraph()
    .searchForImportCycles()
    .reportCyclesAndExit();
