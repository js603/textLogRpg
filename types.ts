export enum Rarity {
  Common = '일반',
  Uncommon = '고급',
  Rare = '희귀',
  Epic = '영웅',
  Legendary = '전설',
  Mythic = '신화',
}

export enum ItemType {
  Weapon = '무기',
  Helm = '투구',
  Armor = '갑옷',
  Gloves = '장갑',
  Boots = '신발',
  Cloak = '망토',
  Accessory = '장신구',
  Ring = '반지',
  Material = '재료',
  Consumable = '소비',
}

export enum Job {
  Warrior = '전사',
  Mage = '마법사',
  Archer = '궁수',
  None = '모험가'
}

export interface StatModifier {
  str?: number;
  dex?: number;
  int?: number;
  vit?: number;
  luck?: number;
  crit?: number; // Critical Chance %
  dodge?: number; // Dodge Chance %
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  tier: number; // 1-100
  baseStats: StatModifier; // Basic stats
  bonusStats?: StatModifier; // Random affix stats
  value: number;
  description: string;
  mastery: number; // Item specific proficiency
  jobReq: Job | null;
}

export interface Skill {
  id: string;
  name: string;
  damageMultiplier: number; // e.g. 1.5 = 150% dmg
  cooldown: number; // in seconds
  currentCooldown: number;
  manaCost: number;
  description: string;
  mastery: number; // Skill proficiency
  tier: number;
  jobReq: Job;
}

export interface Quest {
  id: string;
  title: string;
  targetName: string; // Monster name pattern to match
  targetCount: number;
  currentCount: number;
  rewardGold: number;
  rewardExp: number;
  description: string;
  isCompleted: boolean;
}

export interface Monster {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  damage: number;
  expReward: number;
  dropTable: string[]; // item IDs or tags
  isBoss: boolean;
}

export interface Location {
  id: number;
  name: string;
  type: 'Town' | 'Forest' | 'Mine' | 'Lake' | 'Dungeon' | 'Ruins' | 'Field';
  levelReq: number;
  description: string;
  monsterPool?: Monster[]; // Only for combat zones
  resourcePool?: string[]; // Only for gathering zones
  maxFloors?: number; // Only for dungeons
}

export interface BestiaryEntry {
  name: string;
  killCount: number;
  maxLevel: number;
  firstEncounter: string;
}

export interface PlayerState {
  name: string;
  job: Job;
  level: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  gold: number;
  stats: Required<StatModifier>;
  inventory: Item[];
  equipped: {
    weapon: Item | null;
    helm: Item | null;
    armor: Item | null;
    gloves: Item | null;
    boots: Item | null;
    cloak: Item | null;
    accessory1: Item | null;
    accessory2: Item | null;
    ring1: Item | null;
    ring2: Item | null;
  };
  skills: Skill[];
  activeQuest: Quest | null;
  location: Location;
  currentFloor: number; // For dungeons
  isAutoPlaying: boolean;
  activity: 'Idle' | 'Combat' | 'Mining' | 'Woodcutting' | 'Fishing' | 'Crafting';
  bestiary: Record<string, BestiaryEntry>;
}

export interface LogEntry {
  id: number;
  message: string;
  type: 'info' | 'combat' | 'gain' | 'system' | 'narrative' | 'skill';
  timestamp: string;
}

export const XP_TABLE = (level: number) => Math.floor(100 * Math.pow(1.5, level - 1));

// ============================================
// 프로액티브 UX & NPC 시스템 타입
// ============================================

// 선택지 (플레이어가 선택할 수 있는 행동)
export interface Choice {
  id: string;
  text: string; // 표시될 텍스트 (예: "도와드리겠습니다")
  action: string; // 실제 행동 (예: "accept_quest")
  icon?: string; // 아이콘 (예: "✅")
}

// 게임 이벤트
export interface GameEvent {
  id: string;
  type: 'npc_approach' | 'discovery' | 'combat_start' | 'location_enter' | 'hint';
  narrative: string; // 이벤트 묘사 텍스트
  hasNPC: boolean;
  npc?: {
    id: string;
    name: string;
    greeting: string;
  };
  choices: Choice[];
  timestamp: number;
}

// NPC 성격
export interface NPCPersonality {
  traits: string[]; // 성격 특성 (예: ['호전적', '탐욕적'])
  speechPattern: string; // 말투 (예: "거칠고 직설적")
  motivations: string[]; // 동기 (예: ['돈', '복수'])
  fears: string[]; // 두려움 (예: ['죽음', '빈곤'])
}

// NPC 기억/기록
export interface NPCMemory {
  npcId: string;
  npcName: string;
  personality: NPCPersonality;
  memory: {
    interactions: ConversationLog[]; // 대화 기록
    knownFacts: string[]; // NPC가 아는 정보
    secrets: string[]; // NPC의 비밀
  };
  state: {
    mood: number; // -100 ~ 100
    trust: number; // 플레이어에 대한 신뢰도 0 ~ 100
    currentActivity: string;
    location: string;
  };
  relationships: Record<string, number>; // 다른 NPC/플레이어와의 관계도
}

// 대화 기록
export interface ConversationLog {
  timestamp: number;
  speaker: 'player' | 'npc';
  message: string;
  context?: string; // 대화 당시 상황
}

// 게임 컨텍스트 (LLM에 전달할 상태 정보)
export interface GameContext {
  playerName: string;
  playerJob: Job;
  currentLocation: string;
  nearbyNPCs: string[];
  recentEvents: string[];
  activeQuests: string[];
  playerMood?: string;
}

// 행동 의도 (중재자가 분류한 결과)
export type ActionIntent =
  | 'attack'
  | 'move'
  | 'talk'
  | 'investigate'
  | 'use_skill'
  | 'use_item'
  | 'accept_quest'
  | 'reject_quest'
  | 'trade'
  | 'rest'
  | 'help'
  | 'invalid'; // 치팅 시도 등

// 행동 결과 메타데이터
export interface ActionResult {
  isValid: boolean;
  success: boolean;
  reason?: string; // 실패 이유
  metadata: Record<string, any>; // 데미지, 획득 아이템 등
}

// 오프닝 장면
export interface OpeningScene {
  narrative: string;
  firstEvent: GameEvent;
}

// PlayerState 확장 (기존에 추가)
export interface ExtendedPlayerState extends PlayerState {
  conversationHistory: ConversationLog[];
  currentChoices: Choice[];
  lastInteractionTime: number;
  gameMode: 'exploration' | 'dialogue' | 'combat';
}

// 퀘스트 목표
export interface QuestObjective {
  type: 'kill' | 'collect' | 'explore' | 'talk';
  target: string;
  requiredCount: number;
  currentCount: number;
}

export interface DynamicQuest {
  id: string;
  title: string;
  description: string;
  giver: string;  // NPC ID
  objectives: QuestObjective[];
  rewards: {
    exp: number;
    gold: number;
    items?: string[];
  };
  status: 'active' | 'completed' | 'failed';
  timeLimit?: number;
}

// ============================================
// 게임 설정
// ============================================

export type NarrativeStyle = 'classic' | 'novel';

export interface GameSettings {
  narrativeStyle: NarrativeStyle;
  showTimestamp?: boolean;
  autoScroll?: boolean;
}
