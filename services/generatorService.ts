import { Item, ItemType, Rarity, StatModifier, Job, Quest } from '../types';
import { 
    PREFIXES, SUFFIXES, WEAPON_TYPES, HELM_NAMES, ARMOR_NAMES, 
    GLOVES_NAMES, BOOTS_NAMES, CLOAK_NAMES, ACCESSORY_NAMES, RING_NAMES, REGION_DROP_BIAS 
} from '../constants';

export const generateItem = (tier: number, forcedType?: ItemType, locationType: string = 'Field'): Item => {
  // Determine Type based on Location Bias
  let type: ItemType;
  
  if (forcedType) {
      type = forcedType;
  } else {
      const biases = REGION_DROP_BIAS[locationType] || [];
      // 50% chance to follow region bias, 50% chance for completely random
      if (biases.length > 0 && Math.random() < 0.5) {
          type = biases[Math.floor(Math.random() * biases.length)];
      } else {
          // Fallback Random
          const rand = Math.random();
          if (rand < 0.25) type = ItemType.Weapon;
          else if (rand < 0.40) type = ItemType.Armor; // Body Armor
          else if (rand < 0.50) type = ItemType.Helm;
          else if (rand < 0.60) type = ItemType.Gloves;
          else if (rand < 0.70) type = ItemType.Boots;
          else if (rand < 0.80) type = ItemType.Ring;
          else if (rand < 0.90) type = ItemType.Accessory;
          else type = ItemType.Cloak;
      }
  }

  // Name Selection based on Type
  let baseList: string[] = [];
  switch (type) {
      case ItemType.Weapon: baseList = WEAPON_TYPES; break;
      case ItemType.Helm: baseList = HELM_NAMES; break;
      case ItemType.Armor: baseList = ARMOR_NAMES; break;
      case ItemType.Gloves: baseList = GLOVES_NAMES; break;
      case ItemType.Boots: baseList = BOOTS_NAMES; break;
      case ItemType.Cloak: baseList = CLOAK_NAMES; break;
      case ItemType.Accessory: baseList = ACCESSORY_NAMES; break;
      case ItemType.Ring: baseList = RING_NAMES; break;
      case ItemType.Material: return generateMaterial(tier, 'mine'); // Fallback for material in gear gen
      default: baseList = ARMOR_NAMES; break;
  }
  
  const baseName = baseList[Math.floor(Math.random() * baseList.length)];
  
  // Rarity roll
  const roll = Math.random();
  let rarity = Rarity.Common;
  let prefix = PREFIXES[1]; // Normal
  let suffix = SUFFIXES[0]; // None

  if (roll > 0.99) { rarity = Rarity.Mythic; prefix = PREFIXES[Math.floor(Math.random() * 2) + 15]; } 
  else if (roll > 0.98) { rarity = Rarity.Legendary; prefix = PREFIXES[Math.floor(Math.random() * 2) + 13]; }
  else if (roll > 0.90) { rarity = Rarity.Epic; prefix = PREFIXES[Math.floor(Math.random() * 3) + 10]; }
  else if (roll > 0.75) { rarity = Rarity.Rare; prefix = PREFIXES[Math.floor(Math.random() * 3) + 7]; }
  else if (roll > 0.40) { rarity = Rarity.Uncommon; prefix = PREFIXES[Math.floor(Math.random() * 4) + 3]; }
  
  // Ensure variety: If common, still small chance for prefix
  if (rarity === Rarity.Common && Math.random() < 0.2) {
      prefix = PREFIXES[2]; // Old/Rusty etc
  }

  if (Math.random() > 0.6) {
    suffix = SUFFIXES[Math.floor(Math.random() * (SUFFIXES.length - 1)) + 1];
  }

  const name = `${prefix.name} ${baseName} ${suffix.displayName || ''}`.trim();

  // Base Stats Generation Logic
  const baseStats: StatModifier = {};
  
  // Stats scaling with Tier
  const mainStatVal = Math.floor(tier * (type === ItemType.Weapon ? 2.5 : 1.5));
  const subStatVal = Math.floor(tier * 0.8);

  switch (type) {
      case ItemType.Weapon:
          baseStats.str = mainStatVal;
          baseStats.dex = Math.floor(mainStatVal * 0.5);
          break;
      case ItemType.Helm:
          baseStats.vit = subStatVal;
          baseStats.int = Math.floor(tier * 0.5); // Helms often give INT
          break;
      case ItemType.Armor:
          baseStats.vit = mainStatVal;
          baseStats.str = Math.floor(tier * 0.2);
          break;
      case ItemType.Gloves:
          baseStats.dex = subStatVal;
          baseStats.str = Math.floor(tier * 0.5);
          baseStats.crit = 1; // Gloves intrinsic
          break;
      case ItemType.Boots:
          baseStats.dex = subStatVal;
          baseStats.luck = Math.floor(tier * 0.3);
          baseStats.dodge = 1; // Boots intrinsic
          break;
      case ItemType.Cloak:
          baseStats.vit = Math.floor(tier * 0.5);
          baseStats.luck = Math.floor(tier * 0.5);
          baseStats.dodge = 1;
          break;
      case ItemType.Ring:
      case ItemType.Accessory:
          // Random stats for jewelry
          if (Math.random() > 0.5) baseStats.str = subStatVal;
          if (Math.random() > 0.5) baseStats.int = subStatVal;
          if (Math.random() > 0.5) baseStats.dex = subStatVal;
          baseStats.luck = Math.floor(tier * 0.5);
          baseStats.crit = Math.random() > 0.7 ? 1 : 0;
          break;
  }

  // Combine Prefix/Suffix Stats
  const combinedStats: StatModifier = { ...baseStats };
  const addStats = (mod: StatModifier) => {
    if (mod.str) combinedStats.str = (combinedStats.str || 0) + mod.str;
    if (mod.dex) combinedStats.dex = (combinedStats.dex || 0) + mod.dex;
    if (mod.int) combinedStats.int = (combinedStats.int || 0) + mod.int;
    if (mod.vit) combinedStats.vit = (combinedStats.vit || 0) + mod.vit;
    if (mod.luck) combinedStats.luck = (combinedStats.luck || 0) + mod.luck;
    if (mod.crit) combinedStats.crit = (combinedStats.crit || 0) + mod.crit;
    if (mod.dodge) combinedStats.dodge = (combinedStats.dodge || 0) + mod.dodge;
    
    // HP/MP Mapping
    if (mod['hp' as keyof StatModifier]) combinedStats.vit = (combinedStats.vit || 0) + Math.floor((mod['hp' as keyof StatModifier] || 0) / 10);
    if (mod['mp' as keyof StatModifier]) combinedStats.int = (combinedStats.int || 0) + Math.floor((mod['mp' as keyof StatModifier] || 0) / 5);
  };

  addStats(prefix.stat);
  addStats(suffix.stat);

  return {
    id: `item_${Date.now()}_${Math.random()}`,
    name,
    type,
    rarity,
    tier,
    baseStats: combinedStats,
    value: tier * 15 * (Object.keys(Rarity).indexOf(rarity) + 1),
    description: `${rarity} 등급의 ${tier}티어 ${type}입니다.`,
    mastery: 0,
    jobReq: null
  };
};

export const generateMaterial = (tier: number, type: 'mine' | 'wood' | 'fish'): Item => {
    let name = '';
    if (type === 'mine') name = '광석';
    if (type === 'wood') name = '통나무';
    if (type === 'fish') name = '물고기';

    return {
        id: `mat_${Date.now()}_${Math.random()}`,
        name: `${tier}등급 ${name}`,
        type: ItemType.Material,
        rarity: Rarity.Common,
        tier,
        baseStats: {},
        value: tier * 5,
        description: `제작에 사용되는 ${name}입니다.`,
        mastery: 0,
        jobReq: null
    }
}

export const generateQuest = (level: number): Quest => {
    const count = Math.floor(Math.random() * 5) + 3;
    
    return {
        id: `quest_${Date.now()}`,
        title: `의뢰: ${level}레벨 지역 토벌`,
        targetName: "", // Empty means any monster in level range
        targetCount: count,
        currentCount: 0,
        rewardGold: level * 100,
        rewardExp: level * 50,
        description: `주변 지역의 몬스터를 ${count}마리 처치하세요.`,
        isCompleted: false
    }
}
