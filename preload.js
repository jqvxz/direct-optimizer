
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Getters
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getTweaks: () => ipcRenderer.invoke('get-tweaks'),
  getDebloatTasks: () => ipcRenderer.invoke('get-debloat-tasks'),
  getCleanupTasks: () => ipcRenderer.invoke('get-cleanup-tasks'),
  getBackupTasks: () => ipcRenderer.invoke('get-backup-tasks'),
  getInstallTasks: () => ipcRenderer.invoke('get-install-tasks'),

  // Actions
  runTask: (id) => ipcRenderer.invoke('run-task', id),
  applyChanges: (changes) => ipcRenderer.invoke('apply-changes', changes),
});