#!/usr/bin/env node

import { QuickImportCycleChecker } from './src/quick-import-cycle-checker';

// TODO Make this more elegant/configurable
const directoryToCheck = process.cwd();
const rootDirectory = process.cwd();

QuickImportCycleChecker.forDirectories(directoryToCheck).withRootDirectory(rootDirectory).checkForCycles();
