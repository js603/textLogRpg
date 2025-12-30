import React from 'react';
import { Quest } from '../types';
import { Scroll } from 'lucide-react';

interface QuestPanelProps {
  quest: Quest | null;
  onComplete: () => void;
}

const QuestPanel: React.FC<QuestPanelProps> = ({ quest, onComplete }) => {
  if (!quest) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg">
             <h3 className="text-lg font-bold mb-2 text-zinc-100 flex items-center gap-2">
                <Scroll className="text-amber-600 w-5 h-5"/> 퀘스트
             </h3>
             <p className="text-zinc-500 text-sm">진행 중인 의뢰가 없습니다.<br/>마을의 길드에서 의뢰를 받으세요.</p>
        </div>
      );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-2 text-zinc-100 border-b border-zinc-700 pb-2 flex items-center gap-2">
        <Scroll className="text-amber-400 w-5 h-5"/> 진행 중: {quest.title}
      </h3>
      <p className="text-sm text-zinc-300 mb-2">{quest.description}</p>
      
      <div className="w-full bg-zinc-800 h-4 rounded-full overflow-hidden mb-2 border border-zinc-600">
        <div 
            className="bg-amber-600 h-full transition-all duration-300 flex items-center justify-center text-[10px] font-bold text-white" 
            style={{ width: `${Math.min(100, (quest.currentCount / quest.targetCount) * 100)}%` }}
        >
            {quest.currentCount} / {quest.targetCount}
        </div>
      </div>

      <div className="text-xs text-zinc-400 flex justify-between">
          <span>보상: {quest.rewardGold}G, {quest.rewardExp} XP</span>
          {quest.isCompleted && (
              <button 
                onClick={onComplete}
                className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded animate-pulse"
              >
                  보상 받기
              </button>
          )}
      </div>
    </div>
  );
};

export default QuestPanel;
