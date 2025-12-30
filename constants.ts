import { ItemType, Job, Location, Monster, Rarity } from './types';

export const RARITY_COLORS: Record<string, string> = {
  [Rarity.Common]: 'text-gray-400',
  [Rarity.Uncommon]: 'text-green-400',
  [Rarity.Rare]: 'text-blue-400',
  [Rarity.Epic]: 'text-purple-400',
  [Rarity.Legendary]: 'text-orange-400',
  [Rarity.Mythic]: 'text-red-500 font-bold',
};

// Procedural Generation Data Pools
export const MATERIAL_NAMES = ['나무', '돌', '철광석', '구리', '금', '미스릴', '아다만티움', '용의 뼈', '세계수 가지', '별의 파편'];
export const FISH_NAMES = ['송사리', '붕어', '잉어', '연어', '참치', '상어', '크라켄', '리바이어던'];

// Expanded Item Names
export const WEAPON_TYPES = ['검', '도끼', '창', '단검', '지팡이', '활', '둔기', '양손검', '마법봉', '석궁'];
export const HELM_NAMES = ['가죽 모자', '철 투구', '사슬 두건', '판금 헬멧', '마법사의 모자', '써클릿', '후드', '왕관'];
export const ARMOR_NAMES = ['가죽 갑옷', '사슬 갑옷', '판금 갑옷', '로브', '튜닉', '흉갑', '미늘 갑옷'];
export const GLOVES_NAMES = ['가죽 장갑', '철 건틀릿', '비단 장갑', '손목 보호대', '판금 장갑'];
export const BOOTS_NAMES = ['가죽 부츠', '철 그리브', '비단 신발', '전투화', '샌들'];
export const CLOAK_NAMES = ['낡은 망토', '여행자의 망토', '비단 망토', '털 망토', '그림자 망토', '왕의 망토'];
export const ACCESSORY_NAMES = ['목걸이', '부적', '펜던트', '귀걸이', '브로치', '성물'];
export const RING_NAMES = ['반지', '가락지', '인장', '보석 반지'];

export const PREFIXES = [
  { name: '녹슨', stat: { str: -2 }, rarity: Rarity.Common },
  { name: '평범한', stat: {}, rarity: Rarity.Common },
  { name: '오래된', stat: { vit: 1 }, rarity: Rarity.Common },
  { name: '날카로운', stat: { str: 2, dex: 1, crit: 1 }, rarity: Rarity.Uncommon },
  { name: '단단한', stat: { vit: 3 }, rarity: Rarity.Uncommon },
  { name: '민첩한', stat: { dex: 3, dodge: 1 }, rarity: Rarity.Uncommon },
  { name: '지혜로운', stat: { int: 3 }, rarity: Rarity.Uncommon },
  { name: '치명적인', stat: { crit: 3, dex: 2 }, rarity: Rarity.Uncommon },
  { name: '맹렬한', stat: { str: 5, int: 2 }, rarity: Rarity.Rare },
  { name: '빛나는', stat: { luck: 5, int: 5 }, rarity: Rarity.Rare },
  { name: '수호의', stat: { vit: 8, str: 2, dodge: 2 }, rarity: Rarity.Rare },
  { name: '그림자의', stat: { dex: 5, dodge: 3 }, rarity: Rarity.Rare },
  { name: '파괴자의', stat: { str: 8, crit: 3 }, rarity: Rarity.Rare },
  { name: '고대의', stat: { str: 10, vit: 10 }, rarity: Rarity.Epic },
  { name: '폭풍의', stat: { dex: 12, luck: 5, crit: 5 }, rarity: Rarity.Epic },
  { name: '마력의', stat: { int: 15, mp: 50 }, rarity: Rarity.Epic },
  { name: '용살자의', stat: { str: 20, dex: 10, crit: 8 }, rarity: Rarity.Legendary },
  { name: '절대자의', stat: { str: 15, int: 15, vit: 15 }, rarity: Rarity.Legendary },
  { name: '환영의', stat: { dodge: 10, luck: 15 }, rarity: Rarity.Legendary },
  { name: '신성한', stat: { int: 30, luck: 15 }, rarity: Rarity.Mythic },
  { name: '악마의', stat: { str: 35, vit: -5, crit: 10 }, rarity: Rarity.Mythic },
];

export const SUFFIXES = [
  { name: '', stat: {} },
  { name: 'of Bear', displayName: '곰의', stat: { str: 3, vit: 5 } },
  { name: 'of Eagle', displayName: '독수리의', stat: { dex: 5, luck: 2, crit: 1 } },
  { name: 'of Owl', displayName: '올빼미의', stat: { int: 5, mp: 20 } },
  { name: 'of Fox', displayName: '여우의', stat: { int: 3, dex: 3, dodge: 1 } },
  { name: 'of Wolf', displayName: '늑대의', stat: { str: 4, dex: 2, crit: 2 } },
  { name: 'of Tiger', displayName: '호랑이의', stat: { str: 5, dex: 5 } },
  { name: 'of Turtle', displayName: '거북이의', stat: { vit: 10, dodge: -1 } },
  { name: 'of Destruction', displayName: '파괴의', stat: { str: 15, crit: 5 } },
  { name: 'of Life', displayName: '생명의', stat: { vit: 20, hp: 100 } },
  { name: 'of Mana', displayName: '마력의', stat: { int: 10, mp: 50 } },
  { name: 'of Speed', displayName: '신속의', stat: { dex: 8, dodge: 3 } },
  { name: 'of Luck', displayName: '행운의', stat: { luck: 15 } },
];

// Region Loot Bias: Which items are more common in which regions
export const REGION_DROP_BIAS: Record<string, ItemType[]> = {
    'Forest': [ItemType.Boots, ItemType.Gloves, ItemType.Cloak, ItemType.Material], // Leather/Light gear
    'Mine': [ItemType.Weapon, ItemType.Helm, ItemType.Armor, ItemType.Material], // Metal/Heavy gear
    'Lake': [ItemType.Ring, ItemType.Accessory, ItemType.Consumable, ItemType.Material], // Treasures
    'Ruins': [ItemType.Ring, ItemType.Accessory, ItemType.Cloak, ItemType.Weapon], // Ancient/Magic items
    'Field': [ItemType.Boots, ItemType.Gloves, ItemType.Consumable, ItemType.Material],
    'Dungeon': [ItemType.Weapon, ItemType.Armor, ItemType.Helm, ItemType.Ring, ItemType.Accessory], // Everything good
    'Town': []
};

// Locations Setup
export const LOCATIONS: Location[] = [
  { id: 0, name: '시작의 마을', type: 'Town', levelReq: 1, description: '모험가들이 모이는 평화로운 마을입니다.' },
  { id: 1, name: '뒷산 숲', type: 'Forest', levelReq: 1, description: '초보자들이 나무를 베기 좋은 곳입니다.', resourcePool: ['나무', '약초'] },
  { id: 2, name: '오래된 광산', type: 'Mine', levelReq: 1, description: '녹슨 곡괭이 소리가 들립니다.', resourcePool: ['돌', '구리', '철광석'] },
  { id: 3, name: '고요한 호수', type: 'Lake', levelReq: 1, description: '낚시를 즐기며 휴식할 수 있습니다.', resourcePool: ['송사리', '붕어'] },
];

const ZONE_TYPES = ['Forest', 'Mine', 'Ruins', 'Field', 'Lake'];

// Add 50 combat zones
for (let i = 1; i <= 50; i++) {
  const zoneType = ZONE_TYPES[i % ZONE_TYPES.length] as any;
  LOCATIONS.push({
    id: 100 + i,
    name: `위험한 지역 ${i}구역`,
    type: zoneType,
    levelReq: i * 2,
    description: `레벨 ${i * 2} 이상의 몬스터가 출몰하는 ${zoneType === 'Forest' ? '숲' : zoneType === 'Mine' ? '광산' : zoneType === 'Ruins' ? '유적' : zoneType === 'Field' ? '들판' : '호수'}입니다.`,
    monsterPool: [] 
  });
}

// Add 5 Dungeons
const DUNGEON_NAMES = ['어둠의 미궁', '화염의 탑', '얼음의 동굴', '고대의 유적', '악마의 성'];
DUNGEON_NAMES.forEach((name, idx) => {
  LOCATIONS.push({
    id: 1000 + idx,
    name: name,
    type: 'Dungeon',
    levelReq: (idx + 1) * 20,
    description: '100층으로 이루어진 위험한 던전입니다. 끝에는 강력한 보스가 기다립니다.',
    maxFloors: 100
  });
});

// Monster Generator Logic
const MONSTER_PREFIXES = ['약한', '굶주린', '일반', '사나운', '광폭한', '피에 굶주린', '지옥의', '심연의', '타락한', '혼돈의', '전설적인', '고대의'];

// Diverse Monster Pools by Location Type
const MONSTER_POOLS: Record<string, string[]> = {
  'Forest': ['슬라임', '늑대', '곰', '멧돼지', '나무정령', '거대 거미', '맨티스', '표범', '포레스트 골렘', '엘프 추방자'],
  'Mine': ['박쥐', '코볼트', '두더지', '고블린 광부', '바위 골렘', '어둠의 정령', '동굴 트롤', '바실리스크', '지렁이 괴물'],
  'Lake': ['멀록', '물정령', '거대 게', '사이렌', '크라켄 촉수', '물뱀', '거북이', '악어', '리자드맨'],
  'Ruins': ['스켈레톤', '좀비', '유령', '가고일', '미믹', '흑마법사', '레이스', '데스나이트', '리치'],
  'Field': ['고블린', '오크', '놀', '산적', '하이에나', '들개', '오우거', '사이클롭스', '그리폰'],
  'Dungeon': ['임프', '서큐버스', '인큐버스', '헬하운드', '데몬', '발록', '드래곤', '다크엘프', '키메라', '히드라']
};

// Fallback pool
const DEFAULT_POOL = ['슬라임', '고블린', '늑대', '오크'];

export const generateMonster = (level: number, type: string = 'Field', isBoss: boolean = false): Monster => {
  const pool = MONSTER_POOLS[type] || MONSTER_POOLS['Dungeon'] || DEFAULT_POOL;
  
  // Pick monster based on level proximity roughly, or random for variety
  const baseName = pool[Math.floor(Math.random() * pool.length)];
  const prefixIndex = Math.min(Math.floor(level / 8), MONSTER_PREFIXES.length - 1);
  const prefix = MONSTER_PREFIXES[prefixIndex % MONSTER_PREFIXES.length];
  
  const name = isBoss ? `[BOSS] ${prefix} ${baseName} 군주` : `${prefix} ${baseName}`;
  const hpMultiplier = isBoss ? 20 : 1;
  const dmgMultiplier = isBoss ? 3 : 1;

  // Level scaling curve
  const scale = (val: number) => val * (1 + level * 0.12); // Slightly increased scaling

  return {
    id: `mon_${Date.now()}_${Math.random()}`,
    name,
    level,
    maxHp: Math.floor(scale(60) * hpMultiplier),
    hp: Math.floor(scale(60) * hpMultiplier),
    damage: Math.floor(scale(8) * dmgMultiplier),
    expReward: Math.floor(level * 18 * (isBoss ? 10 : 1)),
    dropTable: [],
    isBoss
  };
};

// Skill Data Generator (Unchanged)
const SKILL_ADJECTIVES = ['강력한', '빠른', '파괴적인', '화염의', '얼음의', '번개의', '빛의', '어둠의'];
const SKILL_NOUNS = ['일격', '베기', '찌르기', '타격', '화살', '폭발', '치유', '보호'];

export const generateSkill = (job: Job, tier: number) => {
    const adj = SKILL_ADJECTIVES[Math.floor(Math.random() * SKILL_ADJECTIVES.length)];
    const noun = SKILL_NOUNS[Math.floor(Math.random() * SKILL_NOUNS.length)];
    const name = `${adj} ${noun}`;
    
    return {
        id: `skill_${Math.random()}`,
        name: `${name} (Tier ${tier})`,
        damageMultiplier: 1.2 + (tier * 0.2),
        cooldown: Math.max(2, 10 - tier),
        currentCooldown: 0,
        manaCost: 5 + (tier * 2),
        description: `${job} 전용 스킬. ${120 + (tier*20)}%의 피해를 입힙니다.`,
        mastery: 0,
        tier,
        jobReq: job
    };
};
