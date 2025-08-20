
import React, { useState, useEffect, useCallback } from 'react';
import { electronService } from './electronService.js';
import { ExecuteBar } from './ExecuteBar.jsx';
import { Switch } from './Switch.jsx';

const CleanupItem = ({ task, isChecked, onToggle }) => {
    return (
        <div className="bg-surface p-4 rounded-md border border-muted flex items-center justify-between hover:border-primary/50 transition-colors">
            <div className="flex items-center flex-grow">
                <Switch
                    id={`cleanup-${task.id}`}
                    checked={isChecked}
                    onChange={(e) => onToggle(task.id, e.target.checked)}
                />
                <label htmlFor={`cleanup-${task.id}`} className="ml-4 cursor-pointer flex-grow">
                    <h4 className="font-semibold text-lg text-text-primary">{task.name}</h4>
                    <p className="text-text-secondary text-sm">{task.description}</p>
                </label>
            </div>
        </div>
    );
}

export const Cleanup = () => {
  const [tasks, setTasks] = useState([]);
  const [pendingChanges, setPendingChanges] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

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

  const handleToggleTask = (id, isChecked) => {
    setPendingChanges(prev => {
        const newChanges = new Map(prev);
        if (isChecked) {
            newChanges.set(id, true);
        } else {
            newChanges.delete(id);
        }
        return newChanges;
    });
  };

  const handleApplyChanges = async () => {
      setIsApplying(true);
      const tasksToRun = Array.from(pendingChanges.keys());
      try {
          const promises = tasksToRun.map(id => electronService.runTask(id));
          await Promise.all(promises);
          // Reset state after successful execution
          setPendingChanges(new Map());
      } catch (error) {
          console.error("Failed to apply cleanup tasks:", error);
          // Optionally, show an error message to the user
      } finally {
          setIsApplying(false);
      }
  };

  const handleDiscardChanges = () => {
      setPendingChanges(new Map());
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div></div>;
  }
  
  return (
    <div className="pb-24">
      <h2 className="text-4xl font-bold mb-2 text-primary tracking-wide">System Cleanup</h2>
      <p className="text-text-secondary mb-8">Free up disk space by removing unnecessary files and caches from your system.</p>
      
      <div className="space-y-4">
        {tasks.map(task => (
            <CleanupItem 
                key={task.id} 
                task={task} 
                isChecked={pendingChanges.has(task.id)}
                onToggle={handleToggleTask}
            />
        ))}
      </div>

      {pendingChanges.size > 0 && (
        <ExecuteBar 
            changeCount={pendingChanges.size}
            onApply={handleApplyChanges}
            onDiscard={handleDiscardChanges}
            isApplying={isApplying}
        />
      )}
    </div>
  );
};
