
import React from 'react';

interface ExecuteBarProps {
    onApply: () => void;
    onDiscard: () => void;
    changeCount: number;
    isApplying: boolean;
}

export const ExecuteBar: React.FC<ExecuteBarProps> = ({ onApply, onDiscard, changeCount, isApplying }) => {
    return (
        <div className="fixed bottom-0 left-64 right-0 bg-surface/90 backdrop-blur-sm border-t border-muted p-4 z-40">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-8">
                <div className="text-text-primary">
                    <span className="font-bold text-primary">{changeCount}</span> change(s) pending...
                </div>
                <div className="flex gap-4">
                    <button onClick={onDiscard} disabled={isApplying} className="px-6 py-2 rounded-md font-semibold text-text-secondary hover:bg-muted disabled:opacity-50">Discard</button>
                    <button onClick={onApply} disabled={isApplying} className="px-6 py-2 rounded-md font-semibold bg-primary text-black hover:bg-primary-hover disabled:opacity-50 w-32">
                        {isApplying ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mx-auto"></div> : 'Execute'}
                    </button>
                </div>
            </div>
        </div>
    );
};