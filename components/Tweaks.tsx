
import React, { useState, useEffect, useCallback } from 'react';
import { Tweak, TweakCategory } from '../types';
import { tauriService } from '../services/tauriService';
import { getTweakExplanation } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { ExecuteBar } from './ExecuteBar';
import { Switch } from './Switch';

interface TweakToggleItemProps {
  tweak: Tweak;
  isChecked: boolean;
  onToggle: (id: string, isChecked: boolean) => void;
  onShowExplanation: (tweakName: string) => void;
}

const TweakToggleItem: React.FC<TweakToggleItemProps> = ({ tweak, isChecked, onToggle, onShowExplanation }) => {
  return (
    <div className="bg-surface p-4 rounded-md border border-muted flex items-center justify-between hover:border-primary/50 transition-colors">
      <div className="flex items-center flex-grow">
        <Switch
            id={`tweak-${tweak.id}`}
            checked={isChecked}
            onChange={(e) => onToggle(tweak.id, e.target.checked)}
        />
        <label htmlFor={`tweak-${tweak.id}`} className="ml-4 cursor-pointer flex-grow">
            <h4 className="font-semibold text-lg text-text-primary">{tweak.name}</h4>
            <p className="text-text-secondary text-sm">{tweak.description}</p>
        </label>
      </div>
      <div className="flex items-center space-x-2 ml-4">
        <button
          onClick={() => onShowExplanation(tweak.name)}
          className="p-2 rounded-full hover:bg-muted transition-colors text-text-secondary hover:text-primary"
          title="Get AI Explanation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-surface rounded-md shadow-xl w-full max-w-2xl p-6 relative border border-muted" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold mb-4 text-primary">{title}</h3>
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="prose prose-invert max-w-none text-text-primary">{children}</div>
            </div>
        </div>
    );
};

export const Tweaks: React.FC = () => {
  const [tweaks, setTweaks] = useState<Tweak[]>([]);
  const [pendingChanges, setPendingChanges] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTweaks = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedTweaks = await tauriService.getTweaks();
      setTweaks(fetchedTweaks);
    } catch (error) {
      console.error("Failed to fetch tweaks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTweaks();
  }, [fetchTweaks]);

  const handleToggleTweak = (id: string, isChecked: boolean) => {
    setPendingChanges(prev => {
        const newChanges = new Map(prev);
        const tweak = tweaks.find(t => t.id === id);

        if (!tweak) return prev;

        if (tweak.type === 'action') {
            if (isChecked) {
                newChanges.set(id, true);
            } else {
                newChanges.delete(id);
            }
        } else { // 'toggle' type
            const originalState = tweak.applied;
            if (originalState === isChecked) {
                newChanges.delete(id);
            } else {
                newChanges.set(id, isChecked);
            }
        }
        return newChanges;
    });
  };
  
  const handleToggleCategory = (category: TweakCategory, isChecked: boolean) => {
    setPendingChanges(prev => {
      const newChanges = new Map(prev);
      const categoryTweaks = tweaks.filter(t => t.category === category && (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.description.toLowerCase().includes(searchTerm.toLowerCase())));

      categoryTweaks.forEach(tweak => {
         if (tweak.type === 'action') {
            if (isChecked) {
                newChanges.set(tweak.id, true);
            } else {
                newChanges.delete(tweak.id);
            }
        } else { // 'toggle' type
            const originalState = tweak.applied;
            if (originalState === isChecked) {
                newChanges.delete(tweak.id);
            } else {
                newChanges.set(tweak.id, isChecked);
            }
        }
      });

      return newChanges;
    });
  };

  const handleApplyChanges = async () => {
    setIsApplying(true);
    
    const toggleChanges: Record<string, boolean> = {};
    const actionIds: string[] = [];

    pendingChanges.forEach((isChecked, id) => {
        const tweak = tweaks.find(t => t.id === id);
        if (tweak?.type === 'action') {
            actionIds.push(id);
        } else if (tweak?.type === 'toggle') {
            toggleChanges[id] = isChecked;
        }
    });

    try {
        const promises = [];
        if (Object.keys(toggleChanges).length > 0) {
            promises.push(tauriService.applyChanges(toggleChanges));
        }
        if (actionIds.length > 0) {
            promises.push(...actionIds.map(id => tauriService.runTask(id)));
        }
        
        await Promise.all(promises);

        setPendingChanges(new Map());
        await fetchTweaks();
    } catch (error) {
        console.error("Failed to apply changes:", error);
    } finally {
        setIsApplying(false);
    }
  };

  const handleDiscardChanges = () => {
    setPendingChanges(new Map());
  };
  
  const handleShowExplanation = async (tweakName: string) => {
    setModalTitle(`Explanation: ${tweakName}`);
    setIsModalOpen(true);
    setIsExplanationLoading(true);
    setModalContent('');
    
    const explanation = await getTweakExplanation(tweakName);
    setModalContent(explanation);
    setIsExplanationLoading(false);
  };
  
  const isTweakChecked = (tweak: Tweak) => {
     if (tweak.type === 'action') {
        return pendingChanges.has(tweak.id);
     }
     return pendingChanges.get(tweak.id) ?? tweak.applied ?? false;
  };


  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div></div>;
  }

  const filteredTweaks = tweaks.filter(tweak =>
    tweak.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tweak.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories: TweakCategory[] = ['Performance', 'Network', 'Privacy', 'UI', 'System Repair', 'Advanced'];

  return (
    <div className="pb-24">
      <h2 className="text-4xl font-bold mb-2 text-primary tracking-wide">Windows Tweaks</h2>
      <p className="text-text-secondary mb-8">Select optimizations to apply or run system repair tasks.</p>
      
       <div className="mb-8">
        <input
            type="text"
            placeholder="Search tweaks..."
            className="w-full bg-surface border border-muted rounded-md px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="space-y-8">
        {categories.map(category => {
            const categoryTweaks = filteredTweaks.filter(t => t.category === category);
            if (categoryTweaks.length === 0) return null;

            const areAllChecked = categoryTweaks.every(t => isTweakChecked(t));

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
                        {categoryTweaks.map(tweak => (
                            <TweakToggleItem 
                                key={tweak.id} 
                                tweak={tweak} 
                                isChecked={isTweakChecked(tweak)}
                                onToggle={handleToggleTweak}
                                onShowExplanation={handleShowExplanation} 
                            />
                        ))}
                    </div>
                </div>
            )
        })}
        {filteredTweaks.length === 0 && (
            <div className="text-center text-text-secondary p-8 bg-surface rounded-md border border-muted">
                <p className="text-lg">No tweaks found matching your search.</p>
            </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
          {isExplanationLoading ? (
               <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
               </div>
          ) : (
            <ReactMarkdown>{modalContent}</ReactMarkdown>
          )}
      </Modal>

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