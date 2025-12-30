import { GoogleGenerativeAI } from "@google/generative-ai";
import { npcMemoryManager } from './npcMemoryService';
import { generateQuestFromNPC, getActiveQuests } from './questGeneratorService';
import { NPCMemory, Choice } from '../types';

let genAI: GoogleGenerativeAI | null = null;

if (import.meta.env.VITE_GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
}

/**
 * NPC와의 대화 생성 (개선 버전)
 */
export async function generateNPCDialogue(
    npcId: string,
    playerInput: string,
    playerName: string
): Promise<{ dialogue: string; choices: Choice[]; hasQuest?: boolean }> {

    const npc = await npcMemoryManager.getNPCState(npcId);
    const recentMemories = await npcMemoryManager.getRelevantMemories(npcId, 2);

    if (!genAI) {
        return getFallbackDialogue(npc);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        // 신뢰도에 따라 퀘스트 제안 여부 결정
        const shouldOfferQuest = npc.state.trust >= 40;

        // 과거 대화 컨텍스트
        const memoryContext = recentMemories.length > 0
            ? `\n과거 대화:\n${recentMemories.map(m => `- ${m.message}`).join('\n')}`
            : '';

        // 극도로 간소화된 프롬프트
        const prompt = `당신은 "${npc.npcName}"입니다.

성격: ${npc.personality.traits[0]}, ${npc.personality.speechPattern}
플레이어: ${playerInput}${memoryContext}

다음 형식으로만 답하세요:

대사: "2문장 응답"
선택지: 💬 계속 대화|✅ 도와주기|👋 나중에`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        console.log('=== NPC Response ===');
        console.log(text);
        console.log('===================');

        // 개선된 파싱
        let dialogue = '';
        const quoteMatch = text.match(/"([^"]+)"/);
        if (quoteMatch) {
            dialogue = `${npc.npcName}: "${quoteMatch[1]}"`;
        } else {
            // 대사: 로 시작하는 부분 찾기
            const dialogueLineMatch = text.match(/대사[:：]\s*(.+)/);
            if (dialogueLineMatch) {
                const extracted = dialogueLineMatch[1].replace(/^[""]|[""]$/g, '').trim();
                dialogue = `${npc.npcName}: "${extracted}"`;
            } else {
                // 첫 줄을 대사로 사용
                const firstLine = text.split('\n')[0].trim();
                dialogue = `${npc.npcName}: "${firstLine}"`;
            }
        }

        // 선택지 파싱
        const choices: Choice[] = [];
        const choiceLineMatch = text.match(/선택지[:：]\s*(.+)/);

        if (choiceLineMatch) {
            const choiceText = choiceLineMatch[1];
            const parts = choiceText.split('|').map(p => p.trim());

            parts.forEach((part, idx) => {
                if (idx < 3) {
                    const iconMatch = part.match(/([^\s]+)\s+(.+)/);
                    if (iconMatch) {
                        choices.push({
                            id: `c${idx + 1}`,
                            text: iconMatch[2],
                            action: `action_${idx + 1}`,
                            icon: iconMatch[1]
                        });
                    } else {
                        choices.push({
                            id: `c${idx + 1}`,
                            text: part,
                            action: `action_${idx + 1}`,
                            icon: '💬'
                        });
                    }
                }
            });
        }

        if (choices.length === 0) {
            choices.push(...getDefaultChoices());
        }

        // 퀘스트 제안 추가
        if (shouldOfferQuest && choices.length < 4) {
            choices.push({
                id: 'quest_offer',
                text: '퀘스트를 받습니다',
                action: 'accept_quest_offer',
                icon: '📜'
            });
        }

        // 대화 기록 즉시 저장 (await 사용)
        await npcMemoryManager.saveInteraction(npcId, 'player', playerInput);
        await npcMemoryManager.saveInteraction(npcId, 'npc', dialogue);

        // 호감도 업데이트
        if (playerInput.includes('도와') || playerInput.includes('수락') || playerInput.includes('도움')) {
            await npcMemoryManager.updateRelationship(npcId, 5);
        } else if (playerInput.includes('거절') || playerInput.includes('싫')) {
            await npcMemoryManager.updateRelationship(npcId, -3);
        }

        return {
            dialogue,
            choices,
            hasQuest: shouldOfferQuest
        };
    } catch (error) {
        console.error("NPC dialogue error:", error);
        return getFallbackDialogue(npc);
    }
}

/**
 * NPC가 퀘스트 제안
 */
export async function offerQuestFromNPC(
    npcId: string,
    playerName: string
): Promise<{ narrative: string; questId: string; choices: Choice[] }> {

    const npc = await npcMemoryManager.getNPCState(npcId);

    // 퀘스트 생성
    const quest = await generateQuestFromNPC(
        npcId,
        npc.npcName,
        npc.personality.traits,
        npc.memory.knownFacts,
        npc.state.trust
    );

    const narrative = `${npc.npcName}: "${quest.description}"

📜 **퀘스트: ${quest.title}**
목표: ${quest.objectives.map(obj => `${obj.target} ${obj.requiredCount}개`).join(', ')}
보상: 💰 ${quest.rewards.gold}G, ⭐ ${quest.rewards.exp}EXP`;

    const choices: Choice[] = [
        { id: 'accept', text: '수락합니다', action: `accept_quest_${quest.id}`, icon: '✅' },
        { id: 'details', text: '자세히 알려주세요', action: 'ask_quest_details', icon: '❓' },
        { id: 'decline', text: '나중에 다시 올게요', action: 'decline_quest', icon: '⏰' }
    ];

    return { narrative, questId: quest.id, choices };
}

function getFallbackDialogue(npc: NPCMemory): { dialogue: string; choices: Choice[] } {
    const responses = [
        "흥미로운 말씀이네요...",
        "그렇군요, 알겠습니다.",
        "좋은 생각입니다.",
        "더 말씀해보시죠."
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return {
        dialogue: `${npc.npcName}: "${randomResponse}"`,
        choices: getDefaultChoices()
    };
}

function getDefaultChoices(): Choice[] {
    return [
        { id: 'c1', text: '계속 대화한다', action: 'continue', icon: '💬' },
        { id: 'c2', text: '도움을 제안한다', action: 'help', icon: '✅' },
        { id: 'c3', text: '나중에 다시 온다', action: 'leave', icon: '👋' }
    ];
}
