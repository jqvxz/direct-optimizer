import { Tweak, SystemInfo, CleanupTask, DebloatTask, BackupTask, InstallTask } from '../types';

// The global `window.electronAPI` is now typed in `types.ts`.

// This service directly uses the electronAPI exposed by the preload script.
// It assumes the application is always running in an Electron context.
const electronService = {
  getSystemInfo: (): Promise<SystemInfo> => window.electronAPI.getSystemInfo(),
  getTweaks: (): Promise<Tweak[]> => window.electronAPI.getTweaks(),
  getDebloatTasks: (): Promise<DebloatTask[]> => window.electronAPI.getDebloatTasks(),
  getCleanupTasks: (): Promise<CleanupTask[]> => window.electronAPI.getCleanupTasks(),
  getBackupTasks: (): Promise<BackupTask[]> => window.electronAPI.getBackupTasks(),
  getInstallTasks: (): Promise<InstallTask[]> => window.electronAPI.getInstallTasks(),
  runTask: (id: string): Promise<string> => window.electronAPI.runTask(id),
  applyChanges: (changes: Record<string, boolean>): Promise<string> => window.electronAPI.applyChanges(changes),
  getTweakExplanation: (tweakName: string): Promise<string> => window.electronAPI.getTweakExplanation(tweakName),
};

export { electronService };
