import React, { useState, useEffect, useCallback } from 'react';
import { CleanupTask } from '../types';
import { electronService } from '../services/tauriService';

interface CleanupItemProps {
    task: CleanupTask;
}

const CleanupItem: React.FC<CleanupItemProps> = ({ task }) => {
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
            setStatus('idle'); // or 'error'
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

export const Cleanup: React.FC = () => {
  const [tasks, setTasks] = useState<CleanupTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
        const fetchedTasks = await electronService.getCleanupTasks();
        setTasks(fetchedTasks);
    } catch (error) {
        console.error("Failed to fetch cleanup tasks:", error);
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
      <h2 className="text-4xl font-bold mb-2 text-primary tracking-wide">System Cleanup</h2>
      <p className="text-text-secondary mb-8">Free up disk space by removing unnecessary files and caches from your system.</p>
      
      <div className="space-y-4">
        {tasks.map(task => (
            <CleanupItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};