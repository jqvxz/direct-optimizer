
import { invoke } from '@tauri-apps/api/core';
import { Tweak, SystemInfo, CleanupTask, DebloatTask, BackupTask, InstallTask } from '../types';

// Check if the app is running in a real Tauri context.
const isTauri = !!(window as any).__TAURI_INTERNALS__;

// --- Mock Service for non-Tauri environments ---
// Returns empty or default data to prevent UI errors in previewers,
// forcing the app to rely on the real backend when built.
const mockService = {
  getSystemInfo: (): Promise<SystemInfo> => Promise.resolve({
    cpuUsage: 0, ramUsage: 0, ramTotal: 0, diskUsage: 0, diskTotal: 0, os: 'Not in Tauri environment'
  }),
  getTweaks: (): Promise<Tweak[]> => Promise.resolve([]),
  getDebloatTasks: (): Promise<DebloatTask[]> => Promise.resolve([]),
  getCleanupTasks: (): Promise<CleanupTask[]> => Promise.resolve([]),
  getBackupTasks: (): Promise<BackupTask[]> => Promise.resolve([]),
  getInstallTasks: (): Promise<InstallTask[]> => Promise.resolve([]),
  runTask: (id: string): Promise<string> => Promise.reject(`Cannot run task '${id}' in a browser.`),
  applyChanges: (changes: Record<string, boolean>): Promise<string> => Promise.reject(`Cannot apply changes in a browser.`),
};

const realService = {
  getSystemInfo: (): Promise<SystemInfo> => invoke('get_system_info'),
  getTweaks: (): Promise<Tweak[]> => invoke('get_tweaks'),
  getDebloatTasks: (): Promise<DebloatTask[]> => invoke('get_debloat_tasks'),
  getCleanupTasks: (): Promise<CleanupTask[]> => invoke('get_cleanup_tasks'),
  getBackupTasks: (): Promise<BackupTask[]> => invoke('get_backup_tasks'),
  getInstallTasks: (): Promise<InstallTask[]> => invoke('get_install_tasks'),
  runTask: (id: string): Promise<string> => invoke('run_task', { id }),
  applyChanges: (changes: Record<string, boolean>): Promise<string> => invoke('apply_changes', { changes }),
};

export const tauriService = isTauri ? realService : mockService;