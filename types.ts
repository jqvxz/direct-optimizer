
export enum View {
  Dashboard = 'dashboard',
  Tweaks = 'tweaks',
  Debloat = 'debloat',
  Cleanup = 'cleanup',
  Install = 'install',
  Backup = 'backup',
  Backend = 'backend',
  About = 'about',
}

export type TweakCategory = 'Performance' | 'Privacy' | 'UI' | 'Network' | 'Advanced' | 'System Repair';

export interface Tweak {
  id: string;
  name: string;
  description: string;
  category: TweakCategory;
  // State-based tweaks have 'applied' and are toggled
  applied?: boolean; 
  // Action-based tweaks are one-off commands
  type?: 'toggle' | 'action';
}


export interface CleanupTask {
  id: string;
  name: string;
  description: string;
}

export interface BackupTask {
    id: string;
    name: string;
    description: string;
}

export type InstallCategory = 'Utilities' | 'Browsers' | 'Productivity' | 'Developer Tools';

export interface InstallTask {
    id: string;
    name: string;
    description: string;
    category: InstallCategory;
    installed?: boolean;
}

export enum DangerLevel {
    No = 'No',
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
}

export type DebloatCategory = 'Definitely Recommended' | 'Microsoft Apps' | 'Games & Entertainment' | 'Third-Party Apps' | 'OEM Bloatware';

export interface DebloatTask {
    id:string;
    name: string;
    description: string;
    applied: boolean;
    danger: DangerLevel;
    category: DebloatCategory;
}

export interface SystemInfo {
    cpuUsage: number;
    ramUsage: number;
    ramTotal: number;
    diskUsage: number;
    diskTotal: number;

    os: string;
}

// The API exposed by the preload script
export interface ElectronAPI {
  getSystemInfo: () => Promise<SystemInfo>;
  getTweaks: () => Promise<Tweak[]>;
  getDebloatTasks: () => Promise<DebloatTask[]>;
  getCleanupTasks: () => Promise<CleanupTask[]>;
  getBackupTasks: () => Promise<BackupTask[]>;
  getInstallTasks: () => Promise<InstallTask[]>;
  runTask: (id: string) => Promise<string>;
  applyChanges: (changes: Record<string, boolean>) => Promise<string>;
  getTweakExplanation: (tweakName: string) => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
