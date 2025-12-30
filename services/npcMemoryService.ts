import Dexie, { Table } from 'dexie';
import { NPCMemory, ConversationLog, NPCPersonality } from '../types';

// ============================================
// NPC 메모리 데이터베이스
// ============================================

class NPCDatabase extends Dexie {
    npcMemories!: Table<NPCMemory, string>; // npcId를 primary key로 사용

    constructor() {
        super('RPGDatabase');

        this.version(1).stores({
            npcMemories: 'npcId, npcName' // 인덱스 설정
        });
    }
}

const db = new NPCDatabase();

// ============================================
// NPC 메모리 관리 클래스
// ============================================

export class NPCMemoryManager {
    /**
     * NPC 초기화 또는 기존 메모리 가져오기
     */
    async getNPCMemory(npcId: string): Promise<NPCMemory> {
        const existing = await db.npcMemories.get(npcId);

        if (existing) {
            return existing;
        }

        // 새 NPC 생성
        const newNPC = this.createDefaultNPC(npcId);
        await db.npcMemories.add(newNPC);
        return newNPC;
    }

    /**
     * 기본 NPC 생성 (촌장, 대장장이, 상인 등)
     */
    private createDefaultNPC(npcId: string): NPCMemory {
        const npcTemplates: Record<string, NPCMemory> = {
            'elder_001': {
                npcId: 'elder_001',
                npcName: '마을 촌장',
                personality: {
                    traits: ['지혜로운', '친절함', '걱정 많음'],
                    speechPattern: '차분하고 정중한 말투',
                    motivations: ['마을의 평화', '주민 안전'],
                    fears: ['마을 파괴', '주민 피해']
                },
                memory: {
                    interactions: [],
                    knownFacts: ['동쪽 숲에서 이상한 일이 발생', '몬스터가 증가하고 있음'],
                    secrets: ['옛날 모험가였던 과거']
                },
                state: {
                    mood: 50, // 평범한 기분
                    trust: 30, // 초기 신뢰도
                    currentActivity: '마을 광장에서 주민들과 대화 중',
                    location: '시작의 마을'
                },
                relationships: {}
            },
            'blacksmith_001': {
                npcId: 'blacksmith_001',
                npcName: '대장장이',
                personality: {
                    traits: ['호탕한', '솔직함', '장인정신'],
                    speechPattern: '거칠지만 따뜻한 말투',
                    motivations: ['최고의 무기 제작', '아들의 안전'],
                    fears: ['가족의 위험']
                },
                memory: {
                    interactions: [],
                    knownFacts: ['아들이 동쪽 숲에서 부상당함'],
                    secrets: ['전설의 검을 만들 수 있는 비법을 알고 있음']
                },
                state: {
                    mood: -20, // 걱정스러운 상태
                    trust: 20,
                    currentActivity: '대장간에서 망치질 중',
                    location: '시작의 마을'
                },
                relationships: {}
            },
            'merchant_001': {
                npcId: 'merchant_001',
                npcName: '상인',
                personality: {
                    traits: ['탐욕적', '상냥함', '계산적'],
                    speechPattern: '비즈니스 같은 말투, 과장된 표현',
                    motivations: ['돈', '평판'],
                    fears: ['손실', '경쟁자']
                },
                memory: {
                    interactions: [],
                    knownFacts: ['최근 몬스터 때문에 무역로가 위험해짐'],
                    secrets: ['암시장과 거래하고 있음']
                },
                state: {
                    mood: 60, // 장사 잘 되면 기분 좋음
                    trust: 15, // 상인은 초기 신뢰도가 낮음
                    currentActivity: '상점에서 손님을 기다리는 중',
                    location: '시작의 마을'
                },
                relationships: {}
            }
        };

        return npcTemplates[npcId] || {
            npcId,
            npcName: 'Unknown NPC',
            personality: {
                traits: ['평범한'],
                speechPattern: '일반적인 말투',
                motivations: [],
                fears: []
            },
            memory: {
                interactions: [],
                knownFacts: [],
                secrets: []
            },
            state: {
                mood: 50,
                trust: 30,
                currentActivity: '서 있음',
                location: '알 수 없음'
            },
            relationships: {}
        };
    }

    /**
     * 대화 기록 저장
     */
    async saveInteraction(
        npcId: string,
        speaker: 'player' | 'npc',
        message: string,
        context?: string
    ): Promise<void> {
        const npc = await this.getNPCMemory(npcId);

        const newLog: ConversationLog = {
            timestamp: Date.now(),
            speaker,
            message,
            context
        };

        npc.memory.interactions.push(newLog);

        // 최대 100개의 대화만 유지 (메모리 절약)
        if (npc.memory.interactions.length > 100) {
            npc.memory.interactions = npc.memory.interactions.slice(-100);
        }

        await db.npcMemories.put(npc);
    }

    /**
     * 관련 기억 검색 (최근 N개)
     */
    async getRelevantMemories(npcId: string, count: number = 5): Promise<ConversationLog[]> {
        const npc = await this.getNPCMemory(npcId);
        return npc.memory.interactions.slice(-count);
    }

    /**
     * 호감도 업데이트
     */
    async updateRelationship(npcId: string, delta: number): Promise<void> {
        const npc = await this.getNPCMemory(npcId);

        npc.state.trust = Math.max(0, Math.min(100, npc.state.trust + delta));

        // 호감도에 따라 기분도 변화
        if (delta > 0) {
            npc.state.mood = Math.min(100, npc.state.mood + delta / 2);
        } else {
            npc.state.mood = Math.max(-100, npc.state.mood + delta);
        }

        await db.npcMemories.put(npc);
    }

    /**
     * NPC 상태 조회
     */
    async getNPCState(npcId: string): Promise<NPCMemory> {
        return await this.getNPCMemory(npcId);
    }

    /**
     * NPC에게 새로운 사실 추가
     */
    async addKnownFact(npcId: string, fact: string): Promise<void> {
        const npc = await this.getNPCMemory(npcId);

        if (!npc.memory.knownFacts.includes(fact)) {
            npc.memory.knownFacts.push(fact);
            await db.npcMemories.put(npc);
        }
    }

    /**
     * 관계망 업데이트 (NPC 간 소문 전파)
     */
    async updateRelationships(npcId: string, targetId: string, relationshipValue: number): Promise<void> {
        const npc = await this.getNPCMemory(npcId);

        npc.relationships[targetId] = relationshipValue;
        await db.npcMemories.put(npc);
    }

    /**
     * 모든 NPC 목록 가져오기
     */
    async getAllNPCs(): Promise<NPCMemory[]> {
        return await db.npcMemories.toArray();
    }

    /**
     * 데이터베이스 초기화 (테스트용)
     */
    async clearAllData(): Promise<void> {
        await db.npcMemories.clear();
    }
}

// 싱글톤 인스턴스 export
export const npcMemoryManager = new NPCMemoryManager();
