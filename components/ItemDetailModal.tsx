import React from 'react';
import { Item, ItemType } from '../types';
import { RARITY_COLORS } from '../constants';
import { X, Shield, Sword, Coins } from 'lucide-react';

interface ItemDetailModalProps {
  item: Item | null;
  onClose: () => void;
  onEquip?: (item: Item) => void;
  onUnequip?: (item: Item) => void;
  onSell?: (item: Item) => void;
  isEquipped: boolean;
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose, onEquip, onUnequip, onSell, isEquipped }) => {
  if (!item) return null;

  // Helper to render stats
  const renderStats = (stats: any, isBonus: boolean = false) => {
      const elements: React.ReactNode[] = [];
      Object.entries(stats).forEach(([k, v]) => {
          const val = v as number;
          if (val !== 0) {
              elements.push(
                  <div key={`${isBonus ? 'b' : 'base'}-${k}`} className={`flex justify-between text-sm ${isBonus ? 'text-green-400' : 'text-zinc-300'}`}>
                      <span className="uppercase font-mono">{k}</span>
                      <span>{val > 0 ? '+' : ''}{val}{k === 'crit' || k === 'dodge' ? '%' : ''}</span>
                  </div>
              );
          }
      });
      return elements;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-600 w-full max-w-sm rounded-xl shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-4 bg-zinc-800 border-b border-zinc-700 flex justify-between items-start">
            <div>
                <h2 className={`text-lg font-bold ${RARITY_COLORS[item.rarity]}`}>{item.name}</h2>
                <p className="text-xs text-zinc-500 font-mono mt-1">
                    [{item.rarity}] {item.type} (Tier {item.tier})
                </p>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
                <X size={20} />
            </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
            {/* Stats Block */}
            <div className="bg-zinc-950/50 p-3 rounded border border-zinc-800 space-y-1">
                {renderStats(item.baseStats)}
                {item.bonusStats && renderStats(item.bonusStats, true)}
                {Object.keys(item.baseStats).length === 0 && (!item.bonusStats || Object.keys(item.bonusStats).length === 0) && (
                    <p className="text-zinc-600 text-xs italic text-center">특별한 능력치가 없습니다.</p>
                )}
            </div>

            {/* Description */}
            <div className="text-sm text-zinc-400 italic bg-zinc-800/30 p-2 rounded">
                "{item.description}"
            </div>
            
             {/* Mastery & Value */}
            <div className="flex justify-between items-center text-xs text-zinc-500 font-mono">
                <span>숙련도: +{item.mastery}</span>
                <span className="flex items-center gap-1 text-yellow-500"><Coins size={12}/> {item.value} G</span>
            </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-zinc-700 bg-zinc-800 flex gap-2">
            {item.type !== ItemType.Material && (
                <>
                    {isEquipped && onUnequip ? (
                         <button 
                            onClick={() => { onUnequip(item); onClose(); }}
                            className="flex-1 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded font-bold transition-colors flex items-center justify-center gap-2"
                        >
                           <Shield size={16}/> 해제
                        </button>
                    ) : onEquip ? (
                        <button 
                            onClick={() => { onEquip(item); onClose(); }}
                            className="flex-1 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded font-bold transition-colors flex items-center justify-center gap-2"
                        >
                           <Sword size={16}/> 장착
                        </button>
                    ) : null}
                </>
            )}
            
            {!isEquipped && onSell && (
                <button 
                    onClick={() => { onSell(item); onClose(); }}
                    className="flex-1 py-2 bg-red-900/80 hover:bg-red-800 text-red-100 rounded font-bold transition-colors flex items-center justify-center gap-2"
                >
                    <Coins size={16}/> 판매
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default ItemDetailModal;
