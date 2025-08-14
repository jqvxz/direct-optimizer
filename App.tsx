
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Tweaks } from './components/Tweaks';
import { Cleanup } from './components/Cleanup';
import { About } from './components/About';
import { View } from './types';
import { Debloat } from './components/Debloat';
import { Backup } from './components/Backup';
import { Install } from './components/Install';
import { Backend } from './components/Backend';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);

  const renderView = () => {
    switch (currentView) {
      case View.Dashboard:
        return <Dashboard />;
      case View.Tweaks:
        return <Tweaks />;
      case View.Debloat:
        return <Debloat />;
      case View.Cleanup:
        return <Cleanup />;
      case View.Install:
        return <Install />;
      case View.Backup:
        return <Backup />;
      case View.Backend:
        return <Backend />;
      case View.About:
        return <About />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-base text-text-primary font-mono">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 p-8 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default App;