import { GoogleGenerativeAI } from "@google/generative-ai";
import { ActionIntent, ActionResult, GameContext } from '../types';

let genAI: GoogleGenerativeAI | null = null;

// API 키 초기화
if (import.meta.env.VITE_GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
}

/**
 * 중재자 에이전트 - 플레이어 입력 의도 분류
 */
export async function classifyIntent(
    userInput: string,
    context: GameContext
): Promise<ActionIntent> {
    if (!genAI) {
        return classifyIntentFallback(userInput);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const prompt = `당신은 RPG 게임의 행동 분류기입니다.

플레이어 입력: "${userInput}"

현재 상황:
- 위치: ${context.currentLocation}
- 주변 NPC: ${context.nearbyNPCs.join(', ') || '없음'}

다음 중 하나로 분류하세요:
- attack (공격)
- move (이동)
- talk (대화)
- investigate (조사)
- use_skill (스킬 사용)
- use_item (아이템 사용)
- accept_quest (퀘스트 수락)
- reject_quest (퀘스트 거절)
- trade (거래)
- rest (휴식)
- help (도움말)
- invalid (규칙 위반, 치팅 시도 등)

**중요**: 단어 하나만 응답하세요. 예: attack`;

        const result = await model.generateContent(prompt);
        const intent = result.response.text().trim().toLowerCase();

        // 유효한 의도인지 확인
        const validIntents: ActionIntent[] = [
            'attack', 'move', 'talk', 'investigate', 'use_skill', 'use_item',
            'accept_quest', 'reject_quest', 'trade', 'rest', 'help', 'invalid'
        ];

        if (validIntents.includes(intent as ActionIntent)) {
            return intent as ActionIntent;
        }

        return classifyIntentFallback(userInput);
    } catch (error) {
        console.error("Intent classification error:", error);
        return classifyIntentFallback(userInput);
    }
}

/**
 * Fallback 의도 분류 (LLM 없이)
 */
function classifyIntentFallback(input: string): ActionIntent {
    const lower = input.toLowerCase();

    if (lower.includes('공격') || lower.includes('때리') || lower.includes('베')) return 'attack';
    if (lower.includes('이동') || lower.includes('가') || lower.includes('향해')) return 'move';
    if (lower.includes('대화') || lower.includes('말') || lower.includes('물어')) return 'talk';
    if (lower.includes('조사') || lower.includes('확인') || lower.includes('살펴')) return 'investigate';
    if (lower.includes('스킬') || lower.includes('마법')) return 'use_skill';
    if (lower.includes('아이템') || lower.includes('사용')) return 'use_item';
    if (lower.includes('수락') || lower.includes('받아들') || lower.includes('도와드리')) return 'accept_quest';
    if (lower.includes('거절') || lower.includes('안') || lower.includes('싫')) return 'reject_quest';
    if (lower.includes('거래') || lower.includes('판매') || lower.includes('구매')) return 'trade';
    if (lower.includes('휴식') || lower.includes('쉬')) return 'rest';
    if (lower.includes('도움') || lower.includes('help')) return 'help';

    // 치팅 시도 감지
    if (lower.includes('무적') || lower.includes('무한') || lower.includes('hp를') || lower.includes('골드를')) {
        return 'invalid';
    }

    return 'talk'; // 기본값은 대화
}

/**
 * 행동 유효성 검증
 */
export function validateAction(
    intent: ActionIntent,
    state: any // PlayerState
): ActionResult {
    // 치팅 시도 차단
    if (intent === 'invalid') {
        return {
            isValid: false,
            success: false,
            reason: "그런 마법은 이 세계에 존재하지 않습니다.",
            metadata: {}
        };
    }

    // 기본 유효성 검사
    switch (intent) {
        case 'attack':
            if (state.hp <= 0) {
                return {
                    isValid: false,
                    success: false,
                    reason: "HP가 부족합니다.",
                    metadata: {}
                };
            }
            return {
                isValid: true,
                success: true,
                metadata: { intent: 'attack_confirmed' }
            };

        case 'use_skill':
            if (state.mp < 10) {
                return {
                    isValid: false,
                    success: false,
                    reason: "MP가 부족합니다.",
                    metadata: {}
                };
            }
            return {
                isValid: true,
                success: true,
                metadata: { intent: 'skill_confirmed' }
            };

        case 'rest':
            if (state.hp >= state.maxHp) {
                return {
                    isValid: true,
                    success: true,
                    reason: "이미 체력이 가득 차 있습니다.",
                    metadata: { noEffect: true }
                };
            }
            return {
                isValid: true,
                success: true,
                metadata: { intent: 'rest_confirmed' }
            };

        default:
            return {
                isValid: true,
                success: true,
                metadata: { intent }
            };
    }
}

/**
 * 메타데이터 생성
 */
export function generateMetadata(result: ActionResult): Record<string, any> {
    return {
        ...result.metadata,
        timestamp: Date.now(),
        validated: result.isValid
    };
}
