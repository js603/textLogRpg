import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface GameLogProps {
  logs: LogEntry[];
}

const GameLog: React.FC<GameLogProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex-1 bg-black/50 border border-zinc-700 p-4 rounded-lg overflow-y-auto h-64 font-mono text-sm shadow-inner">
      {logs.map((log) => (
        <div key={log.id} className={`mb-1 ${
          log.type === 'combat' ? 'text-red-400' :
          log.type === 'gain' ? 'text-yellow-400' :
          log.type === 'system' ? 'text-blue-400' :
          log.type === 'narrative' ? 'text-purple-400 italic' :
          'text-gray-300'
        }`}>
          <span className="opacity-50 mr-2 text-xs">[{log.timestamp}]</span>
          {log.message}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};

export default React.memo(GameLog);
