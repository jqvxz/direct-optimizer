
// This service directly uses the electronAPI exposed by the preload script.
// It assumes the application is always running in an Electron context.
const electronService = {
  getSystemInfo: () => window.electronAPI.getSystemInfo(),
  getTweaks: () => window.electronAPI.getTweaks(),
  getDebloatTasks: () => window.electronAPI.getDebloatTasks(),
  getCleanupTasks: () => window.electronAPI.getCleanupTasks(),
  getBackupTasks: () => window.electronAPI.getBackupTasks(),
  getInstallTasks: () => window.electronAPI.getInstallTasks(),
  runTask: (id) => window.electronAPI.runTask(id),
  applyChanges: (changes) => window.electronAPI.applyChanges(changes),
};

export { electronService };
