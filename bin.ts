#!/usr/bin/env node

import { QuickImportCycleChecker } from './src/quick-import-cycle-checker';
import path from 'path';

export interface cliSettings {
    checkDirectories: string[];
    root: string;
    exclusions: RegExp[];
}

const settings: cliSettings = {
    checkDirectories: process.env.npm_config_checkdirectories?.split(',').map((directory: string): string => {
        if (/^\.\//.test(directory)) {
            return path.join(process.cwd(), directory);
        }
        return directory;
    }) ?? [process.cwd()],
    root: process.env.npm_config_root ?? process.cwd(),
    exclusions: process.env.npm_config_exclusions
        ? process.env.npm_config_exclusions?.split(',').map((str: string): RegExp => {
              return new RegExp(str);
          })
        : []
};

QuickImportCycleChecker.forDirectories(...settings.checkDirectories)
    .withRootDirectory(settings.root)
    .withExclusions(settings.exclusions)
    .createImportGraph()
    .searchForImportCycles()
    .reportCyclesAndExit();
