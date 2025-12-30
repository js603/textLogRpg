import React from 'react';
import { Item, Rarity } from '../types';
import { RARITY_COLORS } from '../constants';

interface InventoryProps {
  items: Item[];
  onItemClick: (item: Item) => void;
}

const Inventory: React.FC<InventoryProps> = ({ items, onItemClick }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg h-full flex flex-col">
      <h3 className="text-lg font-bold mb-4 text-zinc-100 border-b border-zinc-700 pb-2">인벤토리 ({items.length}/50)</h3>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {items.length === 0 ? (
          <p className="text-zinc-500 text-center py-4">가방이 비었습니다.</p>
        ) : (
          items.map((item) => (
            <div 
                key={item.id} 
                onClick={() => onItemClick(item)}
                className="cursor-pointer group flex justify-between items-center p-2 bg-zinc-800/50 rounded hover:bg-zinc-700 transition-colors border border-transparent hover:border-zinc-500"
            >
              <div className="flex flex-col">
                <span className={`text-sm ${RARITY_COLORS[item.rarity] || 'text-gray-400'}`}>{item.name}</span>
                <span className="text-xs text-zinc-500">{item.type} | Tier {item.tier}</span>
              </div>
              <div className="text-xs text-zinc-600 bg-zinc-900/50 px-2 py-1 rounded">
                  정보
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Inventory;
