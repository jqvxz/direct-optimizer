
import React, { useState, useEffect, useRef } from 'react';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
}

const LogLine: React.FC<{ log: LogEntry }> = ({ log }) => {
    const levelColor = {
        INFO: 'text-primary',
        WARN: 'text-yellow-400',
        ERROR: 'text-red-400',
        DEBUG: 'text-subtle',
    };

    return (
        <div className="font-mono text-sm flex">
            <span className="text-text-secondary">{log.timestamp}</span>
            <span className={`font-bold w-20 text-center ${levelColor[log.level]}`}>[{log.level}]</span>
            <span className="flex-1 whitespace-pre-wrap">{log.message}</span>
        </div>
    );
};


export const Backend: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const getTimestamp = () => new Date().toLocaleTimeString('en-US', { hour12: false });
        
        // Initial static logs, no simulation.
        setLogs([
            { timestamp: getTimestamp(), level: 'INFO', message: 'Backend log viewer initialized.' },
            { timestamp: getTimestamp(), level: 'INFO', message: 'Awaiting events from core service...' },
        ]);
    }, []);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h2 className="text-4xl font-bold text-primary tracking-wide">Backend Logs</h2>
                    <p className="text-text-secondary">Live stream of backend service activity.</p>
                </div>
                <button
                    disabled
                    className="px-4 py-2 rounded-md font-semibold text-text-primary bg-muted disabled:opacity-50"
                    title="Log streaming is not implemented yet"
                >
                    Pause Logs
                </button>
            </div>
            
            <div className="bg-surface p-4 rounded-md border border-muted h-[65vh] overflow-y-auto">
                <div className="space-y-2">
                    {logs.map((log, index) => (
                        <LogLine key={index} log={log} />
                    ))}
                    <div ref={logsEndRef} />
                </div>
            </div>
        </div>
    );
};