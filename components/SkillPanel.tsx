import React from 'react';
import { Skill } from '../types';
import { Zap } from 'lucide-react';

interface SkillPanelProps {
  skills: Skill[];
}

const SkillPanel: React.FC<SkillPanelProps> = ({ skills }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg h-full flex flex-col">
      <h3 className="text-lg font-bold mb-4 text-zinc-100 border-b border-zinc-700 pb-2 flex items-center gap-2">
        <Zap className="text-yellow-400 w-5 h-5"/> 스킬 ({skills.length})
      </h3>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {skills.length === 0 ? (
          <p className="text-zinc-500 text-center py-4">습득한 스킬이 없습니다.</p>
        ) : (
          skills.map((skill) => (
            <div key={skill.id} className="p-3 bg-zinc-800/50 rounded border border-zinc-700">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-blue-300">{skill.name}</span>
                <span className="text-xs text-zinc-500">Tier {skill.tier}</span>
              </div>
              <p className="text-xs text-zinc-400 mb-2">{skill.description}</p>
              <div className="flex justify-between items-center text-xs">
                <span className="text-yellow-500">숙련도: {skill.mastery}</span>
                <span className={`px-2 py-0.5 rounded ${skill.currentCooldown > 0 ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
                    {skill.currentCooldown > 0 ? `${skill.currentCooldown.toFixed(1)}s 대기` : '준비됨'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SkillPanel;
