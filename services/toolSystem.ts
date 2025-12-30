import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from "@google/generative-ai";

// ============================================
// 도구 스키마 정의
// ============================================

/**
 * 전투 액션: 타겟 공격
 */
export const attackTool: FunctionDeclaration = {
    name: "attack",
    description: "타겟 몬스터를 공격합니다. 플레이어의 스탯과 장비를 기반으로 데미지를 계산합니다.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            target: {
                type: SchemaType.STRING,
                description: "공격할 몬스터의 이름 (예: '슬라임', '고블린')"
            },
            skillName: {
                type: SchemaType.STRING,
                description: "사용할 스킬 이름 (선택적, 없으면 일반 공격)"
            }
        },
        required: ["target"]
    }
};

/**
 * 방어 액션: 방어 태세
 */
export const defendTool: FunctionDeclaration = {
    name: "defend",
    description: "방어 태세를 취하여 받는 데미지를 50% 감소시킵니다.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {},
        required: []
    }
};

/**
 * 이동 액션: 위치 이동
 */
export const moveTool: FunctionDeclaration = {
    name: "move",
    description: "다른 위치로 이동합니다. 마을, 던전, 숲 등으로 이동할 수 있습니다.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            destination: {
                type: SchemaType.STRING,
                description: "이동할 위치 (예: '시작의 마을', '동쪽 숲', '어둠의 던전')"
            }
        },
        required: ["destination"]
    }
};

/**
 * 조사 액션: 주변 탐색
 */
export const investigateTool: FunctionDeclaration = {
    name: "investigate",
    description: "주변을 조사하여 숨겨진 아이템이나 단서를 찾습니다.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            target: {
                type: SchemaType.STRING,
                description: "조사할 대상 (예: '상자', '벽', '책상')"
            }
        },
        required: ["target"]
    }
};

/**
 * 아이템 사용: 인벤토리 아이템 사용
 */
export const useItemTool: FunctionDeclaration = {
    name: "useItem",
    description: "인벤토리의 아이템을 사용합니다. 포션, 장비 등을 사용할 수 있습니다.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            itemName: {
                type: SchemaType.STRING,
                description: "사용할 아이템 이름 (예: '체력 포션', '마나 포션')"
            }
        },
        required: ["itemName"]
    }
};

/**
 * 휴식 액션: HP/MP 회복
 */
export const restTool: FunctionDeclaration = {
    name: "rest",
    description: "안전한 장소에서 휴식하여 HP와 MP를 회복합니다.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {},
        required: []
    }
};

// 모든 도구 목록
export const allTools: FunctionDeclaration[] = [
    attackTool,
    defendTool,
    moveTool,
    investigateTool,
    useItemTool,
    restTool
];

// ============================================
// 도구 실행 결과 타입
// ============================================

export interface ToolResult {
    success: boolean;
    message: string;
    data?: any;
    stateChanges?: {
        hp?: number;
        mp?: number;
        gold?: number;
        exp?: number;
        location?: string;
        items?: string[];
    };
}

// ============================================
// 도구 실행 함수
// ============================================

/**
 * 공격 실행
 */
export function executeAttack(
    target: string,
    skillName?: string,
    playerState?: any
): ToolResult {
    // TODO: 실제 전투 로직 구현
    const damage = Math.floor(Math.random() * 50) + 20;

    return {
        success: true,
        message: `${target}에게 ${damage}의 데미지를 입혔습니다!`,
        data: {
            damage,
            target,
            critical: Math.random() > 0.8
        },
        stateChanges: {
            exp: 10
        }
    };
}

/**
 * 방어 실행
 */
export function executeDefend(): ToolResult {
    return {
        success: true,
        message: "방어 태세를 취했습니다. 다음 공격의 데미지가 50% 감소합니다.",
        data: {
            defenseBonus: 0.5
        }
    };
}

/**
 * 이동 실행
 */
export function executeMove(destination: string): ToolResult {
    const validLocations = ['시작의 마을', '동쪽 숲', '어둠의 던전', '상점', '대장간'];

    if (!validLocations.includes(destination)) {
        return {
            success: false,
            message: `"${destination}"은(는) 유효한 위치가 아닙니다.`
        };
    }

    return {
        success: true,
        message: `${destination}(으)로 이동했습니다.`,
        stateChanges: {
            location: destination
        }
    };
}

/**
 * 조사 실행
 */
export function executeInvestigate(target: string): ToolResult {
    const foundSomething = Math.random() > 0.5;

    if (foundSomething) {
        return {
            success: true,
            message: `${target}을(를) 조사하여 아이템을 발견했습니다!`,
            data: {
                foundItem: "체력 포션"
            },
            stateChanges: {
                items: ["체력 포션"]
            }
        };
    }

    return {
        success: true,
        message: `${target}을(를) 조사했지만 아무것도 발견하지 못했습니다.`
    };
}

/**
 * 아이템 사용 실행
 */
export function executeUseItem(itemName: string, playerState?: any): ToolResult {
    if (itemName.includes('포션')) {
        return {
            success: true,
            message: `${itemName}을(를) 사용했습니다. HP가 50 회복되었습니다!`,
            stateChanges: {
                hp: 50
            }
        };
    }

    return {
        success: false,
        message: `${itemName}은(는) 사용할 수 없는 아이템입니다.`
    };
}

/**
 * 휴식 실행
 */
export function executeRest(): ToolResult {
    return {
        success: true,
        message: "휴식을 취하여 HP와 MP가 완전히 회복되었습니다.",
        stateChanges: {
            hp: 9999, // 나중에 maxHp로 변경
            mp: 9999  // 나중에 maxMp로 변경
        }
    };
}

// ============================================
// 도구 라우터
// ============================================

/**
 * 함수 이름에 따라 적절한 실행 함수 호출
 */
export function executeToolCall(
    functionName: string,
    args: Record<string, any>,
    playerState?: any
): ToolResult {
    switch (functionName) {
        case 'attack':
            return executeAttack(args.target, args.skillName, playerState);
        case 'defend':
            return executeDefend();
        case 'move':
            return executeMove(args.destination);
        case 'investigate':
            return executeInvestigate(args.target);
        case 'useItem':
            return executeUseItem(args.itemName, playerState);
        case 'rest':
            return executeRest();
        default:
            return {
                success: false,
                message: `알 수 없는 함수: ${functionName}`
            };
    }
}
