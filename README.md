# quick-import-cycle-checker

The aim of this project is to provide a very fast way to check for cyclic imports in a typescript-project.
There are already plenty of similar projects out there, however, most are relatively slow because they create
an abstract syntax tree (AST) to validate the imports, which is rather expensive.

`quick-import-cycle-checker` has no dependencies, and will remain so.

## Assumptions

In order to be fast and to be able to skip the creation of an AST, quick-import-cycle-checker makes a few assumptions:

-   There's at most one import-statement per line of code
-   You are using only relative imports (or imports from packages, which are ignored)

Currently, quick-import-cycle-checker does _not_ support the following:

-   Typescript path-mapping; will be ignored
-   Imports relative to the `baseUrl` [as described here](https://www.typescriptlang.org/tsconfig#baseUrl).
    The imports _must_ be relative, using `./` and `../`, otherwise it will not work.
-   In short: Every import that does not start with a `.` is currently being ignored.

## Usage

### Installation

Install via npm: `npm install --save-dev quick-import-cycle-checker`

### Via CLI

The `quick-import-cycle-checker` exposes a `bin`-entry that e.g. can be used as follows in your package.json:

```json
{
    "scripts": {
        "quick-import-cycle-checker": "quick-import-cycle-checker"
    }
}
```

`npm run quick-import-cycle-checker` will discover all `*.ts`-files in the current directory
and all subdirectories, and then check if there are cycles.
If there are any, it will exit non-zero and print the files that are part of the cycle.
Otherwise, it will not print anything and exit with zero.

### Programmatically

It can be used programmatically e.g. in node as follows:

```javascript
const path = require('path');
const QuickImportCycleChecker = require('quick-import-cycle-checker').QuickImportCycleChecker;

QuickImportCycleChecker.forDirectories(
    // paths need to be absolute
    path.join(__dirname, './some/folder'),
    path.join(__dirname, './some/other/folder')
)
    .withRootDirectory(__dirname)
    .checkForCycles();
```
