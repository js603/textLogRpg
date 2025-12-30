import React from 'react';
import { BestiaryEntry } from '../types';
import { BookOpen, Skull, X } from 'lucide-react';

interface BestiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bestiary: Record<string, BestiaryEntry>;
}

const BestiaryModal: React.FC<BestiaryModalProps> = ({ isOpen, onClose, bestiary }) => {
  if (!isOpen) return null;

  const entries = (Object.values(bestiary) as BestiaryEntry[]).sort((a, b) => b.killCount - a.killCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-2xl max-h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-700 flex justify-between items-center bg-zinc-800">
          <div className="flex items-center gap-2 text-zinc-100">
            <BookOpen className="text-amber-500 w-6 h-6" />
            <h2 className="text-xl font-bold font-mono">몬스터 도감</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-zinc-950">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4">
              <Skull size={48} className="opacity-20" />
              <p>아직 처치한 몬스터가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {entries.map((entry) => (
                <div key={entry.name} className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex justify-between items-center hover:border-zinc-600 transition-colors">
                  <div>
                    <h3 className="font-bold text-zinc-200">{entry.name}</h3>
                    <p className="text-xs text-zinc-500">최대 목격 레벨: Lv.{entry.maxLevel}</p>
                    <p className="text-[10px] text-zinc-600 mt-1">최초 조우: {entry.firstEncounter}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end text-red-400 font-mono font-bold">
                        <Skull size={14} />
                        <span>{entry.killCount}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500">처치</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-700 bg-zinc-800 text-xs text-zinc-500 text-center">
          총 {entries.length}종의 몬스터가 기록되었습니다.
        </div>
      </div>
    </div>
  );
};

export default BestiaryModal;