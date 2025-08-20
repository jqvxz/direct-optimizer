import React, { useState, useEffect, useCallback } from 'react';
import { BackupTask } from '../types';
import { electronService } from '../services/tauriService';

interface BackupItemProps {
    task: BackupTask;
}

const BackupItem: React.FC<BackupItemProps> = ({ task }) => {
    const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
    const [message, setMessage] = useState('');

    const handleRun = async () => {
        setStatus('running');
        setMessage('');
        try {
            const result = await electronService.runTask(task.id);
            setMessage(result);
            setStatus('done');
        } catch (error) {
            console.error(`Failed to run task ${task.id}:`, error);
            setMessage('An error occurred.');
            setStatus('idle');
        }
    };

    return (
        <div className="bg-surface p-4 rounded-md border border-muted flex items-center justify-between">
            <div>
                <h4 className="font-semibold text-lg text-text-primary">{task.name}</h4>
                <p className="text-text-secondary text-sm">{task.description}</p>
                {message && <p className={`text-sm mt-2 font-mono ${status === 'done' ? 'text-primary' : 'text-red-400'}`}>{`> ${message}`}</p>}
            </div>
            <button
                onClick={handleRun}
                disabled={status === 'running'}
                className="bg-primary text-black font-bold py-2 px-4 rounded-md hover:bg-primary-hover transition-colors duration-200 disabled:bg-muted disabled:cursor-not-allowed w-32 text-center"
            >
                {status === 'running' && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mx-auto"></div>}
                {status === 'idle' && 'Execute'}
                {status === 'done' && 'Done'}
            </button>
        </div>
    );
}

export const Backup: React.FC = () => {
  const [tasks, setTasks] = useState<BackupTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
        const fetchedTasks = await electronService.getBackupTasks();
        setTasks(fetchedTasks);
    } catch (error) {
        console.error("Failed to fetch backup tasks:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div></div>;
  }
  
  return (
    <div>
      <h2 className="text-4xl font-bold mb-2 text-primary tracking-wide">Backup & Restore</h2>
      <p className="text-text-secondary mb-6">Create backups and restore points before making significant system changes.</p>
      
       <div className="bg-yellow-900/50 border border-yellow-500/80 text-yellow-300 px-4 py-3 rounded-md mb-8" role="alert">
        <strong className="font-bold">Important: </strong>
        <span className="block sm:inline">Regularly creating backups and restore points is crucial for system safety.</span>
      </div>
      
      <div className="space-y-4">
        {tasks.map(task => (
            <BackupItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};