import React from 'react';
import { LogEntry } from '../types';

interface NovelNarrativeProps {
    log: LogEntry;
}

export function NovelNarrative({ log }: NovelNarrativeProps) {
    const paragraphs = log.message.split('\n\n');

    return (
        <div className="novel-page">
            <div className="novel-content">
                {paragraphs.map((paragraph, i) => (
                    <p
                        key={i}
                        className="novel-para"
                        style={{ animationDelay: `${i * 0.2}s` }}
                    >
                        {paragraph}
                    </p>
                ))}
            </div>
            <div className="page-number">
                <span>───</span>
                <span className="page-time">{log.timestamp}</span>
                <span>───</span>
            </div>
        </div>
    );
}
