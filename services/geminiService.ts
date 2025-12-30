import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

if (process.env.API_KEY) {
  aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const generateFlavorText = async (context: string): Promise<string> => {
  if (!aiClient) return "";

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `판타지 텍스트 RPG 게임의 내레이터가 되어, 다음 상황에 대한 짧고 임팩트 있는(한 문장) 묘사를 한국어로 작성해줘: ${context}`,
    });
    return response.text.trim();
  } catch (e) {
    console.error("Gemini Error:", e);
    return "";
  }
};

export const generateBossIntro = async (bossName: string, dungeonName: string): Promise<string> => {
  if (!aiClient) return `${bossName}가 나타났다!`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `던전 '${dungeonName}'의 보스 몬스터 '${bossName}'가 플레이어 앞에 나타났다. 위압적이고 공포스러운 등장 대사를 한 줄 작성해줘.`,
    });
    return response.text.trim();
  } catch (e) {
      return `${bossName}가 무시무시한 기세로 나타났다!`;
  }
}
