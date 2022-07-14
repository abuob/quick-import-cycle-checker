// @ts-expect-error import from non-existent module
import {} from './file-A';
// @ts-expect-error import from non-existent module
import {} from './module-followed-by-comment'; // some comment
import path from 'path';
/**
 * import {} from './block-commented-import';
 */
// @ts-expect-error export from non-existent module
export * from './module-to-be-exported';
// @ts-expect-error import from non-existent module
import {} from "./file-B";
