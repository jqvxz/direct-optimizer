import React, { useState, useEffect } from 'react';
import { electronService } from '../services/tauriService';
import { SystemInfo } from '../types';

const bytesToGb = (bytes: number): string => {
    if (bytes === 0) return '0.0';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1);
}

const StatCard: React.FC<{ title: string; value: string; usage?: number }> = ({ title, value, usage }) => (
    <div className="bg-surface p-6 rounded-md shadow-md border border-muted">
        <h3 className="text-text-secondary text-sm font-medium tracking-widest">{title}</h3>
        <p className="text-3xl font-semibold mt-2 text-text-primary">{value}</p>
        {usage !== undefined && (
            <div className="w-full bg-muted rounded-full h-1.5 mt-4">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${usage}%` }}></div>
            </div>
        )}
    </div>
);

export const Dashboard: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const info = await electronService.getSystemInfo();
        setSystemInfo(info);
      } catch (error) {
        console.error("Failed to get system info:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
    
    // Refresh stats periodically
    const interval = setInterval(fetchInfo, 30000); // every 30 seconds
    return () => clearInterval(interval);

  }, []);

  if (loading || !systemInfo) {
    return (
        <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
    <div>
      <h2 className="text-4xl font-bold mb-2 text-primary tracking-wide">Dashboard</h2>
      <p className="text-text-secondary mb-8">System Overview &gt; OS: {systemInfo.os}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="CPU_USAGE" value={`${systemInfo.cpuUsage.toFixed(1)}%`} usage={systemInfo.cpuUsage} />
        <StatCard title="RAM_USAGE" value={`${systemInfo.ramUsage.toFixed(1)} / ${systemInfo.ramTotal.toFixed(1)} GB`} usage={(systemInfo.ramUsage / systemInfo.ramTotal) * 100} />
        <StatCard title="DISK_USAGE" value={`${bytesToGb(systemInfo.diskUsage)} / ${bytesToGb(systemInfo.diskTotal)} GB`} usage={(systemInfo.diskUsage / systemInfo.diskTotal) * 100} />
      </div>

      <div className="mt-10 bg-surface p-6 rounded-md shadow-md border border-muted">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-primary">DIRECT-optimizer_advanced</h3>
            <span className="text-sm font-mono text-subtle">v0.1.0-alpha</span>
        </div>
        <p className="text-text-secondary">
          An advanced utility for Windows optimization. Use the sidebar to navigate between modules.
          <br/>
          <span className='text-subtle'>[Tweaks] &gt; Apply granular system changes.</span>
          <br/>
          <span className='text-subtle'>[Debloat] &gt; Remove unnecessary stock applications.</span>
          <br/>
          <span className='text-subtle'>[Cleanup] &gt; Free up disk space.</span>
        </p>
      </div>
    </div>
  );
};