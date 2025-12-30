import { GoogleGenerativeAI, GenerateContentResult } from "@google/generative-ai";
import { GameContext, Choice, ActionIntent, GameEvent, OpeningScene } from '../types';
import { Job } from '../types';

let genAI: GoogleGenerativeAI | null = null;

// API 키 초기화
if (import.meta.env.VITE_GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
}

// ============================================
// 프로액티브 이벤트 시스템
// ============================================

/**
 * 오프닝 장면 자동 생성
 */
export async function generateOpeningScene(name: string, job: Job): Promise<OpeningScene> {
    if (!genAI) {
        return getDefaultOpening(name, job);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const prompt = `당신은 판타지 RPG 게임의 내레이터입니다.
    
플레이어 정보:
- 이름: ${name}
- 직업: ${job}

다음 조건으로 오프닝 장면을 작성해주세요:
1. 오랜 여행 끝에 '시작의 마을'에 도착하는 장면
2. 몰입감 있고 희망적인 톤
3. 3-4문장으로 간결하게
4. 마지막에 마을 촌장이 플레이어에게 다가와 인사하는 장면 포함

촌장의 첫 대사 조건:
- 촌장이 플레이어에게 말을 거는 이유를 명확히 포함
- "동쪽 숲에서 몬스터가 증가하고 있어 마을이 위험하다"는 문제를 언급
- 플레이어에게 도움을 요청하는 내용
- 2-3문장으로 작성

형식:
===내레이션===
[오프닝 장면 묘사]
===촌장 대사===
[촌장의 인사와 도움 요청]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // 파싱
        const narrativePart = text.match(/===내레이션===([\s\S]*?)===촌장 대사===/);
        const dialoguePart = text.match(/===촌장 대사===([\s\S]*)/);

        const narrative = narrativePart ? narrativePart[1].trim() : text;
        const greeting = dialoguePart
            ? dialoguePart[1].trim().replace(/^["']|["']$/g, '')
            : "어서오시게, ${name}! 자네 같은 ${job}를 기다리고 있었네. 사실 동쪽 숲에서 몬스터들이 이상하게 많아지고 있어서 마을 주민들이 위험에 처해있다네. 자네가 우릴 도와줄 수 있겠나?";

        return {
            narrative,
            firstEvent: {
                id: 'opening_elder',
                type: 'npc_approach',
                narrative: `마을 촌장이 당신에게 다가옵니다.`,
                hasNPC: true,
                npc: {
                    id: 'elder_001',
                    name: '마을 촌장',
                    greeting,
                    intent: '동쪽 숲의 몬스터 문제 해결을 위한 도움 요청'
                },
                choices: [
                    { id: 'choice_1', text: '무슨 일이신가요?', action: 'talk_elder_what', icon: '💬' },
                    { id: 'choice_2', text: '먼저 쉬고 싶습니다', action: 'reject_politely', icon: '⏰' },
                    { id: 'choice_3', text: '이 마을에 대해 알려주세요', action: 'ask_about_town', icon: '❓' }
                ],
                timestamp: Date.now()
            }
        };
    } catch (error) {
        console.error("Opening scene generation error:", error);
        return getDefaultOpening(name, job);
    }
}

function getDefaultOpening(name: string, job: Job): OpeningScene {
    return {
        narrative: `당신은 ${name}, 젊은 ${job}입니다.\n수년간의 방랑 끝에 '시작의 마을'이라는 작은 촌락에 발을 들였습니다.\n석양이 마을 광장을 붉게 물들이고, 대장간에서는 쇳소리가 울려퍼집니다.`,
        firstEvent: {
            id: 'opening_elder',
            type: 'npc_approach',
            narrative: `마을 촌장이 당신에게 다가옵니다.`,
            hasNPC: true,
            npc: {
                id: 'elder_001',
                name: '마을 촌장',
                greeting: `어서오시게, ${name}! 자네 같은 ${job}를 기다리고 있었네. 사실 동쪽 숲에서 몬스터들이 이상하게 많아지고 있어서 마을 주민들이 위험에 처해있다네. 자네가 우릴 도와줄 수 있겠나?`,
                intent: '동쪽 숲의 몬스터 문제 해결을 위한 도움 요청'
            },
            choices: [
                { id: 'choice_1', text: '무슨 일이신가요?', action: 'talk_elder_what', icon: '💬' },
                { id: 'choice_2', text: '먼저 쉬고 싶습니다', action: 'reject_politely', icon: '⏰' },
                { id: 'choice_3', text: '이 마을에 대해 알려주세요', action: 'ask_about_town', icon: '❓' }
            ],
            timestamp: Date.now()
        }
    };
}

/**
 * 상황별 선택지 자동 생성
 */
export async function generateChoices(context: GameContext): Promise<Choice[]> {
    if (!genAI) {
        return getDefaultChoices();
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const prompt = `현재 게임 상황에 맞는 플레이어 행동 선택지를 3-4개 제안해주세요.

플레이어: ${context.playerName} (${context.playerJob})
위치: ${context.currentLocation}
주변 NPC: ${context.nearbyNPCs.join(', ') || '없음'}
최근 상황: ${context.recentEvents[context.recentEvents.length - 1] || '방금 도착함'}

각 선택지는 다음 형식으로:
[아이콘] 선택지 텍스트

예시:
💬 상인과 대화한다
🚶 북쪽으로 이동한다
🔍 주변을 조사한다

4개의 선택지만 제안해주세요.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // 파싱
        const lines = text.split('\n').filter(line => line.trim());
        const choices: Choice[] = [];

        lines.forEach((line, idx) => {
            const match = line.match(/([^\s]+)\s+(.+)/);
            if (match && idx < 4) {
                const icon = match[1];
                const text = match[2];
                choices.push({
                    id: `choice_${idx + 1}`,
                    text,
                    action: `action_${idx + 1}`,
                    icon
                });
            }
        });

        return choices.length > 0 ? choices : getDefaultChoices();
    } catch (error) {
        console.error("Choice generation error:", error);
        return getDefaultChoices();
    }
}

function getDefaultChoices(): Choice[] {
    return [
        { id: 'choice_1', text: '주변을 둘러본다', action: 'look_around', icon: '🔍' },
        { id: 'choice_2', text: '대화를 시도한다', action: 'talk', icon: '💬' },
        { id: 'choice_3', text: '이동한다', action: 'move', icon: '🚶' }
    ];
}

/**
 * 프로액티브 이벤트 트리거
 */
export async function triggerProactiveEvent(
    eventType: string,
    gameState: any
): Promise<GameEvent> {
    // 이벤트 타입에 따라 다른 처리
    if (eventType === 'town_arrival') {
        return {
            id: `event_${Date.now()}`,
            type: 'location_enter',
            narrative: '마을에 들어서자 따뜻한 빵 굽는 냄새가 코를 자극합니다. 마을 사람들이 분주하게 오가고 있습니다.',
            hasNPC: false,
            choices: [
                { id: 'choice_1', text: '대장간으로 간다', action: 'go_blacksmith', icon: '⚒️' },
                { id: 'choice_2', text: '상점을 둘러본다', action: 'go_shop', icon: '🏪' },
                { id: 'choice_3', text: '마을 사람들과 대화한다', action: 'talk_villagers', icon: '💬' }
            ],
            timestamp: Date.now()
        };
    }

    // 기본 이벤트
    return {
        id: `event_${Date.now()}`,
        type: 'hint',
        narrative: '💡 주변을 살펴보거나 근처 NPC에게 말을 걸어보세요.',
        hasNPC: false,
        choices: getDefaultChoices(),
        timestamp: Date.now()
    };
}

/**
 * Smart Help - 컨텍스트 기반 힌트
 */
export function provideContextualHint(gameState: any): string {
    const hints = [
        "게시판을 확인하거나 마을 사람들과 대화해보세요.",
        "상점에서 장비를 구매하면 더 강해질 수 있습니다.",
        "마을 주변을 탐험하면 새로운 지역을 발견할 수 있습니다."
    ];

    return hints[Math.floor(Math.random() * hints.length)];
}

/**
 * 기존 내러티브 생성 함수 (유지)
 */
export const generateFlavorText = async (context: string): Promise<string> => {
    if (!genAI) return "";

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result = await model.generateContent(
            `판타지 텍스트 RPG 게임의 내레이터가 되어, 다음 상황에 대한 짧고 임팩트 있는(한 문장) 묘사를 한국어로 작성해줘: ${context}`
        );
        return result.response.text().trim();
    } catch (e) {
        console.error("Gemini Error:", e);
        return "";
    }
};

export const generateBossIntro = async (bossName: string, dungeonName: string): Promise<string> => {
    if (!genAI) return `${bossName}가 나타났다!`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result = await model.generateContent(
            `던전 '${dungeonName}'의 보스 몬스터 '${bossName}'가 플레이어 앞에 나타났다. 위압적이고 공포스러운 등장 대사를 한 줄 작성해줘.`
        );
        return result.response.text().trim();
    } catch (e) {
        return `${bossName}가 무시무시한 기세로 나타났다!`;
    }
}
