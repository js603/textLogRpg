import React from 'react';
import { LogEntry } from '../types';

interface ClassicLogProps {
    log: LogEntry;
}

export function ClassicLog({ log }: ClassicLogProps) {
    if (log.type === 'narrative') {
        return (
            <div className="log-classic-narrative">
                <div className="narrative-text-classic">
                    {log.message.split('\n\n').map((paragraph, i) => (
                        <p key={i} className="narrative-paragraph">{paragraph}</p>
                    ))}
                </div>
                <span className="narrative-time-classic">{log.timestamp}</span>
            </div>
        );
    }

    return (
        <div
            className={`log-classic ${log.type === 'system' ? 'log-system' :
                    log.type === 'combat' ? 'log-combat' :
                        log.type === 'gain' ? 'log-gain' :
                            'log-info'
                }`}
        >
            <span className="log-time">{log.timestamp}</span>
            <span className="log-message whitespace-pre-wrap">{log.message}</span>
        </div>
    );
}
