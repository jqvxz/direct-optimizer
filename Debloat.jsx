
import React, { useState, useEffect, useCallback } from 'react';
import { DangerLevel } from './types.js';
import { electronService } from './electronService.js';
import { ExecuteBar } from './ExecuteBar.jsx';
import { Switch } from './Switch.jsx';


const DangerPill = ({ level }) => {
    const levelStyles = {
        [DangerLevel.No]: 'bg-muted/50 text-subtle border-subtle/50',
        [DangerLevel.Low]: 'bg-primary/20 text-primary border-primary/50',
        [DangerLevel.Medium]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
        [DangerLevel.High]: 'bg-red-500/20 text-red-400 border-red-500/50',
    };
    return (
        <span className={`px-2 py-1 text-xs font-bold rounded-full border ${levelStyles[level]}`}>
            {level === DangerLevel.No ? 'NO RISK' : `${level.toUpperCase()} RISK`}
        </span>
    );
};

export const Debloat = () => {
  const [tasks, setTasks] = useState([]);
  const [pendingChanges, setPendingChanges] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedTasks = await electronService.getDebloatTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Failed to fetch debloat tasks:", error);
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
        const originalState = tasks.find(t => t.id === id)?.applied;
        if (originalState === isChecked) {
            newChanges.delete(id);
        } else {
            newChanges.set(id, isChecked);
        }
        return newChanges;
    });
  };

  const handleToggleCategory = (category, isChecked) => {
    setPendingChanges(prev => {
      const newChanges = new Map(prev);
      const categoryTasks = tasks.filter(t => t.category === category && (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.description.toLowerCase().includes(searchTerm.toLowerCase())));

      categoryTasks.forEach(task => {
        const originalState = task.applied;
        if (originalState === isChecked) {
          newChanges.delete(task.id);
        } else {
          newChanges.set(task.id, isChecked);
        }
      });

      return newChanges;
    });
  };

  const handleApplyChanges = async () => {
    setIsApplying(true);
    const changesToApply = Object.fromEntries(pendingChanges);
    try {
        await electronService.applyChanges(changesToApply);
        setPendingChanges(new Map());
        await fetchTasks();
    } catch (error) {
        console.error("Failed to apply debloat tasks:", error);
    } finally {
        setIsApplying(false);
    }
  };

  const handleDiscardChanges = () => {
    setPendingChanges(new Map());
  };
  
  const isTaskChecked = (task) => {
    return pendingChanges.get(task.id) ?? task.applied;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div></div>;
  }
  
  const filteredTasks = tasks.filter(task =>
    task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['Definitely Recommended', 'Microsoft Apps', 'Games & Entertainment', 'Third-Party Apps', 'OEM Bloatware'];

  return (
    <div className="pb-24">
      <h2 className="text-4xl font-bold mb-2 text-primary tracking-wide">Debloat Windows</h2>
      <p className="text-text-secondary mb-6">Select components to remove. Proceed with caution.</p>
      
      <div className="bg-red-900/50 border border-red-500/80 text-red-300 px-4 py-3 rounded-md mb-8" role="alert">
        <strong className="font-bold">Warning: </strong>
        <span className="block sm:inline">Debloating can have unintended consequences. Only remove components you are sure you do not need.</span>
      </div>

       <div className="mb-8">
        <input
            type="text"
            placeholder="Search apps to remove..."
            className="w-full bg-surface border border-muted rounded-md px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-8">
        {categories.map(category => {
            const categoryTasks = filteredTasks.filter(t => t.category === category);
            if (categoryTasks.length === 0) return null;

            const areAllChecked = categoryTasks.every(t => isTaskChecked(t));

            return (
                <div key={category}>
                    <div className="flex justify-between items-center mb-4 border-b-2 border-muted pb-2">
                        <h3 className="text-2xl font-semibold text-primary/80">{`// ${category}`}</h3>
                         <div className="flex items-center gap-2">
                            <label htmlFor={`toggle-all-${category}`} className="text-sm text-text-secondary font-medium">Toggle All</label>
                            <Switch 
                                id={`toggle-all-${category}`}
                                checked={areAllChecked}
                                onChange={(e) => handleToggleCategory(category, e.target.checked)}
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        {categoryTasks.map(task => (
                            <div key={task.id} className="bg-surface p-4 rounded-md border border-muted flex items-center justify-between hover:border-primary/50 transition-colors">
                                <div className="flex items-center flex-grow">
                                    <Switch
                                        id={`task-${task.id}`}
                                        checked={isTaskChecked(task)}
                                        onChange={(e) => handleToggleTask(task.id, e.target.checked)}
                                        disabled={task.applied}
                                    />
                                    <label htmlFor={`task-${task.id}`} className="ml-4 flex-grow cursor-pointer">
                                        <div className="flex items-center gap-4 mb-1">
                                            <h4 className="font-semibold text-lg text-text-primary">{task.name}</h4>
                                            <DangerPill level={task.danger} />
                                        </div>
                                        <p className="text-text-secondary text-sm">{task.description}</p>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        })}
        {filteredTasks.length === 0 && (
            <div className="text-center text-text-secondary p-8 bg-surface rounded-md border border-muted">
                <p className="text-lg">No applications found matching your search.</p>
            </div>
        )}
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
