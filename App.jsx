
import React, { useState } from 'react';
import { Sidebar } from './Sidebar.jsx';
import { Dashboard } from './Dashboard.jsx';
import { Tweaks } from './Tweaks.jsx';
import { Cleanup } from './Cleanup.jsx';
import { About } from './About.jsx';
import { View } from './types.js';
import { Debloat } from './Debloat.jsx';
import { Backup } from './Backup.jsx';
import { Install } from './Install.jsx';
import { Backend } from './Backend.jsx';

const App = () => {
  const [currentView, setCurrentView] = useState(View.Dashboard);

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
    <div className="flex h-screen bg-base text-text-primary font-sans">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 p-8 overflow-y-scroll">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
