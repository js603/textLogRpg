import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

if (import.meta.env.VITE_GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
}

// ============================================
// 타입 정의
// ============================================

export interface WorldEvent {
    id: string;
    title: string;
    description: string;
    type: 'monster_surge' | 'natural_disaster' | 'mystery' | 'festival' | 'conflict';
    severity: 'low' | 'medium' | 'high';
    affectedArea: string;
    timestamp: number;
}

export interface DynamicQuest {
    id: string;
    title: string;
    description: string;
    npcId: string;
    npcName: string;
    objectives: QuestObjective[];
    rewards: QuestReward;
    difficulty: 'easy' | 'normal' | 'hard';
    relatedEvent?: string; // 연관된 세계 이벤트 ID
    isCompleted: boolean;
}

export interface QuestObjective {
    type: 'kill' | 'collect' | 'explore' | 'talk' | 'craft';
    target: string;
    currentCount: number;
    requiredCount: number;
    isCompleted: boolean;
}

export interface QuestReward {
    gold: number;
    exp: number;
    items?: string[];
    relationshipBonus?: number;
}

// ============================================
// 세계 상태 저장소 (간단한 메모리 저장)
// ============================================

let worldEvents: WorldEvent[] = [];
let activeQuests: DynamicQuest[] = [];

/**
 * 세계 이벤트 생성
 */
export async function generateWorldEvent(): Promise<WorldEvent> {
    if (!genAI) {
        return getDefaultWorldEvent();
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const prompt = `판타지 RPG 세계에서 발생하는 이벤트를 1개 생성하세요.

이벤트 타입: 몬스터 출몰, 자연재해, 미스터리, 축제, 분쟁 중 선택

형식:
제목: [짧은 제목]
타입: [monster_surge/natural_disaster/mystery/festival/conflict]
심각도: [low/medium/high]
지역: [동쪽 숲/서쪽 산맥/북쪽 호수 등]
설명: [2-3문장으로 이벤트 설명]

예시:
제목: 동쪽 숲의 슬라임 대량 출현
타입: monster_surge
심각도: medium
지역: 동쪽 숲
설명: 최근 동쪽 숲에서 슬라임들이 비정상적으로 증가하고 있습니다. 주민들이 약초 채집을 하지 못해 곤란을 겪고 있습니다.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // 파싱
        const titleMatch = text.match(/제목:\s*(.+)/);
        const typeMatch = text.match(/타입:\s*(\w+)/);
        const severityMatch = text.match(/심각도:\s*(\w+)/);
        const areaMatch = text.match(/지역:\s*(.+)/);
        const descMatch = text.match(/설명:\s*(.+)/);

        const event: WorldEvent = {
            id: `event_${Date.now()}`,
            title: titleMatch ? titleMatch[1].trim() : '이상한 사건',
            description: descMatch ? descMatch[1].trim() : '알 수 없는 일이 발생했습니다.',
            type: (typeMatch ? typeMatch[1] : 'mystery') as WorldEvent['type'],
            severity: (severityMatch ? severityMatch[1] : 'medium') as WorldEvent['severity'],
            affectedArea: areaMatch ? areaMatch[1].trim() : '알 수 없는 지역',
            timestamp: Date.now()
        };

        worldEvents.push(event);
        return event;
    } catch (error) {
        console.error("World event generation error:", error);
        return getDefaultWorldEvent();
    }
}

function getDefaultWorldEvent(): WorldEvent {
    const events: WorldEvent[] = [
        {
            id: 'evt_1',
            title: '동쪽 숲의 이상 현상',
            description: '동쪽 숲에서 몬스터들이 증가하고 있습니다.',
            type: 'monster_surge',
            severity: 'medium',
            affectedArea: '동쪽 숲',
            timestamp: Date.now()
        },
        {
            id: 'evt_2',
            title: '마을 축제 준비',
            description: '다음 주 수확 축제를 준비하고 있습니다.',
            type: 'festival',
            severity: 'low',
            affectedArea: '시작의 마을',
            timestamp: Date.now()
        }
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    worldEvents.push(event);
    return event;
}

/**
 * NPC 동기 기반 퀘스트 생성
 */
export async function generateQuestFromNPC(
    npcId: string,
    npcName: string,
    npcPersonality: string[],
    knownFacts: string[],
    trustLevel: number
): Promise<DynamicQuest> {

    if (!genAI) {
        return getDefaultQuest(npcId, npcName);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        // 최근 세계 이벤트 참조
        const recentEvent = worldEvents[worldEvents.length - 1];
        const eventContext = recentEvent
            ? `최근 발생한 사건: ${recentEvent.title} - ${recentEvent.description}`
            : '';

        const prompt = `NPC "${npcName}"가 플레이어에게 퀘스트를 제안합니다.

NPC 성격: ${npcPersonality.join(', ')}
알고 있는 정보: ${knownFacts.join(', ')}
신뢰도: ${trustLevel}/100
${eventContext}

다음 형식으로 퀘스트를 생성하세요:

제목: [퀘스트 제목]
설명: [NPC가 자연스럽게 부탁하는 대사, 2-3문장]
목표1: [kill/collect/explore/talk] [대상] [개수]
목표2: [목표 타입] [대상] [개수]
보상: 골드 [금액], 경험치 [경험치], 관계도 +[숫자]

예시:
제목: 슬라임 퇴치
설명: 동쪽 숲의 슬라임들이 너무 많아져서 약초 채집이 불가능합니다. 슬라임 10마리만 처치해주시겠습니까?
목표1: kill 슬라임 10
보상: 골드 100, 경험치 50, 관계도 +10`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // 파싱
        const titleMatch = text.match(/제목:\s*(.+)/);
        const descMatch = text.match(/설명:\s*(.+)/);
        const objective1Match = text.match(/목표1:\s*(\w+)\s+(.+?)\s+(\d+)/);
        const rewardMatch = text.match(/골드\s+(\d+).*경험치\s+(\d+)/);

        const quest: DynamicQuest = {
            id: `quest_${Date.now()}`,
            title: titleMatch ? titleMatch[1].trim() : '도움 요청',
            description: descMatch ? descMatch[1].trim() : `${npcName}가 도움을 요청합니다.`,
            npcId,
            npcName,
            objectives: objective1Match ? [{
                type: objective1Match[1] as QuestObjective['type'],
                target: objective1Match[2].trim(),
                currentCount: 0,
                requiredCount: parseInt(objective1Match[3]),
                isCompleted: false
            }] : [],
            rewards: {
                gold: rewardMatch ? parseInt(rewardMatch[1]) : 100,
                exp: rewardMatch ? parseInt(rewardMatch[2]) : 50,
                relationshipBonus: 10
            },
            difficulty: 'normal',
            relatedEvent: recentEvent?.id,
            isCompleted: false
        };

        activeQuests.push(quest);
        return quest;
    } catch (error) {
        console.error("Quest generation error:", error);
        return getDefaultQuest(npcId, npcName);
    }
}

function getDefaultQuest(npcId: string, npcName: string): DynamicQuest {
    return {
        id: `quest_${Date.now()}`,
        title: '몬스터 퇴治',
        description: `${npcName}: "근처 몬스터를 처치해주시겠습니까?"`,
        npcId,
        npcName,
        objectives: [{
            type: 'kill',
            target: '슬라임',
            currentCount: 0,
            requiredCount: 5,
            isCompleted: false
        }],
        rewards: {
            gold: 100,
            exp: 50,
            relationshipBonus: 10
        },
        difficulty: 'easy',
        isCompleted: false
    };
}

/**
 * 퀘스트 진행 업데이트
 */
export function updateQuestProgress(
    questId: string,
    objectiveType: QuestObjective['type'],
    target: string,
    count: number = 1
): boolean {
    const quest = activeQuests.find(q => q.id === questId);
    if (!quest || quest.isCompleted) return false;

    const objective = quest.objectives.find(
        obj => obj.type === objectiveType && obj.target === target
    );

    if (objective) {
        objective.currentCount = Math.min(
            objective.currentCount + count,
            objective.requiredCount
        );
        objective.isCompleted = objective.currentCount >= objective.requiredCount;

        // 모든 목표 완료 확인
        quest.isCompleted = quest.objectives.every(obj => obj.isCompleted);
        return true;
    }

    return false;
}

/**
 * 활성 퀘스트 조회
 */
export function getActiveQuests(): DynamicQuest[] {
    return activeQuests.filter(q => !q.isCompleted);
}

/**
 * 완료된 퀘스트 조회
 */
export function getCompletedQuests(): DynamicQuest[] {
    return activeQuests.filter(q => q.isCompleted);
}

/**
 * 최근 세계 이벤트 조회
 */
export function getRecentWorldEvents(count: number = 3): WorldEvent[] {
    return worldEvents.slice(-count);
}

/**
 * 세계 이벤트 초기화 (게임 시작 시)
 */
export async function initializeWorldEvents(): Promise<void> {
    if (worldEvents.length === 0) {
        await generateWorldEvent();
    }
}
