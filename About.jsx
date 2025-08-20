import React from 'react';

export const About = () => {
  return (
    <div>
      <h2 className="text-4xl font-bold mb-2 text-primary tracking-wide">About</h2>
      <p className="text-text-secondary mb-8">DIRECT-optimizer_advanced // Information</p>
      
      <div className="bg-surface p-6 rounded-md border border-muted space-y-4 prose prose-invert max-w-none">
        <h3 className="text-xl font-semibold text-primary/80">{'// Technology_Stack'}</h3>
        <ul>
          <li><strong className='text-text-primary'>Frontend:</strong> React with JavaScript</li>
          <li><strong className='text-text-primary'>Styling:</strong> Tailwind CSS</li>
          <li><strong className='text-text-primary'>UI Font:</strong> Fira Code</li>
          <li><strong className='text-text-primary'>Backend Framework:</strong> Electron with Node.js</li>
        </ul>
        
        <h3 className="text-xl font-semibold text-primary/80">{'// How_It_Works'}</h3>
        <p>
          DIRECT-optimizer uses an Electron main process running Node.js to safely interact with the Windows OS. 
          The React frontend (renderer process) communicates with this backend via an IPC (Inter-Process Communication) bridge to get system information and apply system-level changes.
        </p>
        <p>
          This approach provides a modern, responsive user interface while leveraging the extensive Node.js ecosystem for powerful system tasks.
        </p>
        

        <h3 className="text-xl font-semibold text-primary/80">{'// Disclaimer'}</h3>
        <p>
            System tweaking and debloating tools can have unintended consequences. Always ensure you have a recent system backup before applying significant changes. The developers of this application are not responsible for any damage to your system. Use at your own risk.
        </p>
      </div>
    </div>
  );
};
