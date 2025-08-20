
import React, { useState, useEffect, useCallback } from 'react';
import { InstallTask, InstallCategory } from '../types';
import { electronService } from '../services/tauriService';

interface InstallItemProps {
    task: InstallTask;
}

const InstallItem: React.FC<InstallItemProps> = ({ task }) => {
    const [status, setStatus] = useState<'idle' | 'running' | 'done'>(task.installed ? 'done' : 'idle');
    const [message, setMessage] = useState('');

    const handleRun = async () => {
        setStatus('running');
        setMessage('');
        try {
            const result = await electronService.runTask(task.id);
            setMessage(result.replace('Execution complete for:', 'Installation complete for:'));
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
                disabled={status === 'running' || status === 'done'}
                className="bg-primary text-black font-bold py-2 px-4 rounded-md hover:bg-primary-hover transition-colors duration-200 disabled:bg-muted disabled:text-subtle disabled:cursor-not-allowed w-32 text-center"
            >
                {status === 'running' && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mx-auto"></div>}
                {status === 'idle' && 'Install'}
                {status === 'done' && 'Installed'}
            </button>
        </div>
    );
}


export const Install: React.FC = () => {
    const [tasks, setTasks] = useState<InstallTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
  
    const fetchTasks = useCallback(async () => {
      setLoading(true);
      try {
          const fetchedTasks = await electronService.getInstallTasks();
          setTasks(fetchedTasks);
      } catch (error) {
          console.error("Failed to fetch install tasks:", error);
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

    const filteredTasks = tasks.filter(task =>
        task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories: InstallCategory[] = ['Utilities', 'Browsers', 'Productivity', 'Developer Tools'];
    
    return (
      <div>
        <h2 className="text-4xl font-bold mb-2 text-primary tracking-wide">Install Software</h2>
        <p className="text-text-secondary mb-8">Install useful, community-recommended software with one click.</p>
        
        <div className="mb-8">
            <input
                type="text"
                placeholder="Search software..."
                className="w-full bg-surface border border-muted rounded-md px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="space-y-8">
            {categories.map(category => {
                const categoryTasks = filteredTasks.filter(t => t.category === category);
                if (categoryTasks.length === 0) return null;
                return (
                    <div key={category}>
                        <h3 className="text-2xl font-semibold mb-4 text-primary/80 border-b-2 border-muted pb-2">{`// ${category}`}</h3>
                        <div className="space-y-4">
                            {categoryTasks.map(task => (
                                <InstallItem key={task.id} task={task} />
                            ))}
                        </div>
                    </div>
                )
            })}
             {filteredTasks.length === 0 && (
                <div className="text-center text-text-secondary p-8 bg-surface rounded-md border border-muted">
                    <p className="text-lg">No software found matching your search.</p>
                </div>
            )}
        </div>
      </div>
    );
  };