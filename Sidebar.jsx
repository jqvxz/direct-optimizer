
import React from 'react';
import { View } from './types.js';
import { DashboardIcon } from './DashboardIcon.jsx';
import { TweakIcon } from './TweakIcon.jsx';
import { CleanupIcon } from './CleanupIcon.jsx';
import { AboutIcon } from './AboutIcon.jsx';
import { DebloatIcon } from './DebloatIcon.jsx';
import { BackupIcon } from './BackupIcon.jsx';
import { InstallIcon } from './InstallIcon.jsx';
import { BackendIcon } from './BackendIcon.jsx';

const NavItem = ({ icon, label, isActive, onClick }) => {
  return (
    <li
      className={`flex items-center p-3 my-1 rounded-sm cursor-pointer transition-colors duration-200 border-l-2 ${
        isActive
          ? 'bg-primary/20 border-primary text-white'
          : 'border-transparent text-text-secondary hover:bg-muted hover:text-white'
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="ml-4 font-medium tracking-wider">{label}</span>
    </li>
  );
};

export const Sidebar = ({ currentView, setCurrentView }) => {
  return (
    <aside className="w-64 bg-surface p-4 flex flex-col border-r border-muted overflow-y-hidden">
      <div className="flex justify-center items-center mb-4 h-10">
        <h1 className="text-2xl font-bold text-primary tracking-[0.3em]">DIRECT</h1>
      </div>
      <hr className="border-muted mb-4" />
      <nav>
        <ul>
          <NavItem
            icon={<DashboardIcon className="h-6 w-6" />}
            label="Dashboard"
            isActive={currentView === View.Dashboard}
            onClick={() => setCurrentView(View.Dashboard)}
          />
          <NavItem
            icon={<TweakIcon className="h-6 w-6" />}
            label="Tweaks"
            isActive={currentView === View.Tweaks}
            onClick={() => setCurrentView(View.Tweaks)}
          />
          <NavItem
            icon={<DebloatIcon className="h-6 w-6" />}
            label="Debloat"
            isActive={currentView === View.Debloat}
            onClick={() => setCurrentView(View.Debloat)}
          />
          <NavItem
            icon={<CleanupIcon className="h-6 w-6" />}
            label="Cleanup"
            isActive={currentView === View.Cleanup}
            onClick={() => setCurrentView(View.Cleanup)}
          />
          <NavItem
            icon={<InstallIcon className="h-6 w-6" />}
            label="Install"
            isActive={currentView === View.Install}
            onClick={() => setCurrentView(View.Install)}
          />
          <NavItem
            icon={<BackupIcon className="h-6 w-6" />}
            label="Backup"
            isActive={currentView === View.Backup}
            onClick={() => setCurrentView(View.Backup)}
          />
          <NavItem
            icon={<BackendIcon className="h-6 w-6" />}
            label="Backend"
            isActive={currentView === View.Backend}
            onClick={() => setCurrentView(View.Backend)}
          />
        </ul>
      </nav>
      <div className="mt-auto">
        <ul>
            <NavItem
                icon={<AboutIcon className="h-6 w-6" />}
                label="About"
                isActive={currentView === View.About}
                onClick={() => setCurrentView(View.About)}
            />
            <hr className="border-muted my-2" />
            <li className="text-xs text-subtle text-center px-2">Alpha Build</li>
        </ul>
      </div>
    </aside>
  );
};
