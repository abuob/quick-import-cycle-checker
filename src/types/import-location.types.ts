export type ImportLocation = JsonModuleImport | PackageImport | RelativeFileImport;

export interface RelativeFileImport {
    type: 'relative-file-import';
    rawLiteral: string;
    resolvedAbsoluteFilePath: string;
}

export interface JsonModuleImport {
    type: 'json-module-import';
    rawLiteral: string;
}

export interface PackageImport {
    type: 'package-import';
    packageName: string;
}
