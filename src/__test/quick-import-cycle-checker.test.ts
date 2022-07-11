import * as path from 'path';
import { QuickImportCycleChecker } from '../quick-import-cycle-checker';

describe('CycleCheckerUtil', () => {
    async function checkDirectory(directoryPath: string): Promise<void> {
        const absoluteDirectoryPath: string = path.join(__dirname, directoryPath);
        return QuickImportCycleChecker.forDirectories(absoluteDirectoryPath).withRootDirectory(absoluteDirectoryPath).checkForCycles();
    }

    it('should detect a simple cycle', async () => {
        await expect(checkDirectory('./fixtures/simple-cycle')).rejects.toThrow();
    });

    it('should detect a simple cycle and handle subdir', async () => {
        await expect(checkDirectory('./fixtures/simple-cycle-with-subdir')).rejects.toThrow();
    });

    it('should detect a simple cycle and handle doublequotes gracefully', async () => {
        await expect(checkDirectory('./fixtures/handle-import-with-doublequotes')).rejects.toThrow();
    });

    it('should not throw if there is no cycle', async () => {
        await expect(checkDirectory('./fixtures/no-cycle-simple')).resolves.not.toThrow();
    });

    it('should not throw if there is no cycle, including subdirs', async () => {
        await expect(checkDirectory('./fixtures/no-cycle-with-subdir')).resolves.not.toThrow();
    });
});
