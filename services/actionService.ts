import { GoogleGenerativeAI } from "@google/generative-ai";
import { allTools, executeToolCall, ToolResult } from './toolSystem';

let genAI: GoogleGenerativeAI | null = null;

if (import.meta.env.VITE_GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
}

/**
 * 플레이어 텍스트 입력을 처리하여 액션 실행
 */
export async function processPlayerAction(
    userInput: string,
    playerState: any
): Promise<{
    narrative: string;
    toolResult?: ToolResult;
    choices: any[];
}> {

    if (!genAI) {
        return {
            narrative: "시스템 오류: API가 초기화되지 않았습니다.",
            choices: []
        };
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            tools: [{ functionDeclarations: allTools }]
        });

        // 게임 컨텍스트 구성
        const context = buildGameContext(playerState);

        const prompt = `당신은 판타지 RPG의 게임 마스터입니다.

**현재 상황**:
${context}

**플레이어 입력**: "${userInput}"

플레이어의 요청을 분석하여 적절한 함수를 호출하세요.
- 전투를 원하면 attack 함수 사용
- 이동을 원하면 move 함수 사용
- 주변 조사는 investigate 함수 사용
- 아이템 사용은 useItem 함수 사용
- 휴식은 rest 함수 사용

만약 함수 호출이 필요 없는 일반 대화라면, 자연스럽게 응답하세요.`;

        const chat = model.startChat();
        const result = await chat.sendMessage(prompt);
        const response = result.response;

        // 함수 호출 확인
        const functionCalls = response.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
            // 첫 번째 함수 호출 처리
            const call = functionCalls[0];
            const toolResult = executeToolCall(call.name, call.args || {}, playerState);

            // 함수 실행 결과를 바탕으로 내러티브 생성
            const narrativePrompt = `
플레이어가 "${userInput}"라고 했고,
시스템이 다음 결과를 반환했습니다: "${toolResult.message}"

이 결과를 바탕으로 생생하고 몰입감 있는 2-3문장의 서술을 작성하세요.
${toolResult.data ? `추가 정보: ${JSON.stringify(toolResult.data)}` : ''}

형식: 서술만 작성 (질문 없이)`;

            const narrativeResult = await chat.sendMessage(narrativePrompt);
            const narrative = narrativeResult.response.text();

            // 다음 행동 선택지 생성
            const choices = generateNextChoices(toolResult, playerState);

            return {
                narrative,
                toolResult,
                choices
            };
        }

        // 함수 호출이 없는 경우 (일반 대화)
        const text = response.text();
        return {
            narrative: text,
            choices: getDefaultChoices()
        };

    } catch (error) {
        console.error("Action processing error:", error);
        return {
            narrative: "명령을 처리하는 중 오류가 발생했습니다.",
            choices: getDefaultChoices()
        };
    }
}

/**
 * 게임 컨텍스트 구성
 */
function buildGameContext(playerState: any): string {
    return `
위치: ${playerState.location || '시작의 마을'}
HP: ${playerState.hp || 100}/${playerState.maxHp || 100}
MP: ${playerState.mp || 50}/${playerState.maxMp || 50}
레벨: ${playerState.level || 1}
골드: ${playerState.gold || 0}G

사용 가능한 행동:
- 몬스터 공격
- 다른 위치로 이동
- 주변 조사
- 아이템 사용
- 휴식
`;
}

/**
 * 다음 선택지 생성
 */
function generateNextChoices(toolResult: ToolResult, playerState: any): any[] {
    const baseChoices = [
        { id: 'c1', text: '주변을 둘러본다', action: 'look_around', icon: '🔍' },
        { id: 'c2', text: '계속 진행한다', action: 'continue', icon: '⚔️' }
    ];

    // 전투 후라면 전투 관련 선택지
    if (toolResult.data?.damage) {
        return [
            { id: 'c1', text: '다시 공격한다', action: 'attack_again', icon: '⚔️' },
            { id: 'c2', text: '방어 태세를 취한다', action: 'defend', icon: '🛡️' },
            { id: 'c3', text: '휴식한다', action: 'rest', icon: '💤' }
        ];
    }

    // 이동 후라면
    if (toolResult.stateChanges?.location) {
        return [
            { id: 'c1', text: '주변을 조사한다', action: 'investigate', icon: '🔍' },
            { id: 'c2', text: 'NPC를 찾는다', action: 'find_npc', icon: '💬' },
            { id: 'c3', text: '다른 곳으로 이동한다', action: 'move_again', icon: '🚶' }
        ];
    }

    return baseChoices;
}

/**
 * 기본 선택지
 */
function getDefaultChoices(): any[] {
    return [
        { id: 'c1', text: '주변을 둘러본다', action: 'look_around', icon: '🔍' },
        { id: 'c2', text: '대화한다', action: 'talk', icon: '💬' },
        { id: 'c3', text: '이동한다', action: 'move', icon: '🚶' }
    ];
}

/**
 * "주변을 둘러본다" 액션 처리
 */
export async function lookAround(playerState: any): Promise<string> {
    if (!genAI) return "주변을 둘러봅니다...";

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `플레이어가 ${playerState.location || '시작의 마을'}에 있습니다.
  
이 위치에 대한 짧은 묘사(2-3문장)를 작성하세요:
- 주변 환경
- 눈에 띄는 것들
- 가능한 행동

예시: "마을 광장에는 사람들이 분주하게 오가고 있습니다. 북쪽에는 대장간이, 동쪽에는 상점이 보입니다."`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}
