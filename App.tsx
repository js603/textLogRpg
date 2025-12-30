import React, { useState, useEffect, useCallback } from 'react';
import { Job, Choice, GameEvent, LogEntry, OpeningScene } from './types';
import { generateOpeningScene, triggerProactiveEvent, provideContextualHint } from './services/proactiveEventService';
import { classifyIntent, validateAction } from './services/arbiterService';
import { Castle, Send, Settings } from 'lucide-react';
import { useSettings } from './contexts/SettingsContext';
import { ClassicLog } from './components/ClassicLog';
import { NovelNarrative } from './components/NovelNarrative';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  // ========== 설정 ==========
  const { settings } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ========== 게임 상태 ==========
  const [playerName, setPlayerName] = useState('');
  const [playerJob, setPlayerJob] = useState<Job>(Job.Warrior);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [hasOpeningPlayed, setHasOpeningPlayed] = useState(false);

  // ========== UI 상태 ==========
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentChoices, setCurrentChoices] = useState<Choice[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [activeQuests, setActiveQuests] = useState<any[]>([]); // DynamicQuest[]
  const [currentHint, setCurrentHint] = useState<string>('💡 원하는 행동을 입력하거나 선택지를 클릭하세요');

  // ========== 로그 추가 ==========
  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setLogs(prev => [...prev.slice(-99), newLog]);
  }, []);

  // ========== 게임 시작 ==========
  const handleStartGame = async () => {
    if (!playerName.trim()) return;

    setIsSetupComplete(true);
    setIsLoading(true);

    try {
      // 오프닝 장면 자동 생성
      const opening: OpeningScene = await generateOpeningScene(playerName, playerJob);

      addLog(opening.narrative, 'narrative');

      if (opening.firstEvent.hasNPC && opening.firstEvent.npc) {
        addLog(`${opening.firstEvent.npc.name}: "${opening.firstEvent.npc.greeting}"`, 'narrative');
      }

      setCurrentChoices(opening.firstEvent.choices);
      setHasOpeningPlayed(true);
      setLastInteractionTime(Date.now());
    } catch (error) {
      console.error('Opening generation error:', error);
      addLog('여정이 시작됩니다...', 'system');
    } finally {
      setIsLoading(false);
    }
  };

  // ========== 선택지 클릭 처리 ==========
  const handleChoice = async (choice: Choice) => {
    setIsLoading(true);
    setLastInteractionTime(Date.now());

    try {
      addLog(`> ${choice.text}`, 'info');

      // NPC 대화 시스템 통합
      const { generateNPCDialogue } = await import('./services/npcDialogueService');

      // NPC ID 결정 (action에서 추출하거나 기본값 사용)
      let npcId = 'elder_001'; // 기본값: 촌장

      if (choice.action.includes('blacksmith')) {
        npcId = 'blacksmith_001';
      } else if (choice.action.includes('shop') || choice.action.includes('merchant')) {
        npcId = 'merchant_001';
      }

      // NPC와 대화 생성
      const { dialogue, choices } = await generateNPCDialogue(
        npcId,
        choice.text,
        playerName
      );

      addLog(dialogue, 'narrative');
      setCurrentChoices(choices);

    } catch (error) {
      console.error('Choice handling error:', error);
      // Fallback: 하드코딩된 응답
      if (choice.action === 'talk_elder_what') {
        addLog('마을 촌장: "사실... 최근 동쪽 숲에서 이상한 일이 벌어지고 있습니다. 당신이 도와주실 수 있겠습니까?"', 'narrative');
        setCurrentChoices([
          { id: 'c1', text: '도와드리겠습니다', action: 'accept_help', icon: '✅' },
          { id: 'c2', text: '더 자세히 알려주세요', action: 'ask_details', icon: '❓' },
          { id: 'c3', text: '나중에 다시 오겠습니다', action: 'delay', icon: '⏰' }
        ]);
      } else {
        addLog('(응답을 생성하는 중 오류가 발생했습니다)', 'system');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ========== 텍스트 입력 처리 ==========
  const handleTextSubmit = async () => {
    if (!textInput.trim() || isLoading) return;

    const input = textInput;
    setTextInput('');
    setIsLoading(true);
    setLastInteractionTime(Date.now());

    try {
      addLog(`> ${input}`, 'info');

      // Action Service를 통한 처리
      const { processPlayerAction } = await import('./services/actionService');

      // 간단한 게임 상태 전달
      const playerState = {
        name: playerName,
        job: playerJob,
        location: '시작의 마을',
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        level: 1,
        gold: 0
      };

      const result = await processPlayerAction(input, playerState);

      // 내러티브 출력
      addLog(result.narrative, 'narrative');

      // 도구 실행 결과가 있으면 표시
      if (result.toolResult) {
        if (result.toolResult.success) {
          addLog(`✅ ${result.toolResult.message}`, 'gain');
        } else {
          addLog(`❌ ${result.toolResult.message}`, 'system');
        }
      }

      // 선택지 업데이트
      if (result.choices && result.choices.length > 0) {
        setCurrentChoices(result.choices);
      }

    } catch (error) {
      console.error('Text input error:', error);
      addLog('명령을 처리하는 중 오류가 발생했습니다.', 'system');
    } finally {
      setIsLoading(false);
    }
  };

  // ========== 무응답 감지 타이머 ==========
  useEffect(() => {
    if (!hasOpeningPlayed) return;

    const timer = setInterval(() => {
      const timeSince = Date.now() - lastInteractionTime;

      if (timeSince > 60000) { // 60초 무응답
        const hint = provideContextualHint({});
        setCurrentHint(hint); // 아이콘 제거 (provideContextualHint에서 💡 포함)
        setLastInteractionTime(Date.now()); // 힌트 후 타이머 리셋
      }
    }, 30000); // 30초마다 체크

    return () => clearInterval(timer);
  }, [hasOpeningPlayed, lastInteractionTime]);

  // ========================================
  // UI 렌더링
  // ========================================

  // --- 캐릭터 생성 화면 ---
  if (!isSetupComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-black to-zinc-900 text-white p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Castle className="mx-auto h-16 w-16 text-red-600 mb-4" />
            <h1 className="text-3xl font-bold font-mono tracking-tighter">TEXT RPG: THE SURVIVOR</h1>
            <p className="mt-2 text-zinc-400">당신의 이야기를 시작하세요</p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-6 shadow-2xl">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">이름</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleStartGame()}
                className="w-full bg-zinc-950 border border-zinc-700 rounded p-3 text-white focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="모험가 이름"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">직업 선택</label>
              <div className="grid grid-cols-3 gap-2">
                {[Job.Warrior, Job.Archer, Job.Mage].map(job => (
                  <button
                    key={job}
                    onClick={() => setPlayerJob(job)}
                    className={`p-3 rounded border text-sm font-bold transition-all
                      ${playerJob === job
                        ? 'bg-red-900/50 border-red-500 text-white'
                        : 'bg-zinc-950 border-zinc-700 text-zinc-500 hover:bg-zinc-800'}`}
                  >
                    {job}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartGame}
              disabled={!playerName.trim()}
              className="w-full py-4 bg-red-700 hover:bg-red-600 rounded-lg text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              모험 시작
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 메인 게임 화면 ---
  return (
    <div className="flex flex-col h-screen bg-black text-gray-200">
      {/* 헤더 */}
      <header className="flex-none flex justify-between items-center p-3 border-b border-zinc-800 bg-zinc-900 shadow-md">
        <div className="flex items-center gap-2">
          <Castle className="text-red-500 w-6 h-6" />
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-white font-mono">TEXT RPG: THE SURVIVOR</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            title="설정"
          >
            <Settings className="w-5 h-5" />
          </button>
          <div className="text-sm text-zinc-400">
            <span className="text-white font-bold">{playerName}</span> ({playerJob})
          </div>
        </div>
      </header>

      {/* 프로액티브 힌트 배너 */}
      <div className="flex-none bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-blue-700/50 p-3">
        <div className="flex items-start gap-2 max-w-5xl mx-auto">
          <span className="text-xl flex-shrink-0">💡</span>
          <p className="text-sm text-blue-200 leading-relaxed">
            {currentHint}
          </p>
        </div>
      </div>

      {/* 게임 로그 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-zinc-950">
        {logs.length === 0 && (
          <div className="text-center text-zinc-500 mt-10">
            <p>로딩 중...</p>
          </div>
        )}

        {logs.map((log) => (
          <React.Fragment key={log.id}>
            {settings.narrativeStyle === 'novel' && log.type === 'narrative' ? (
              <NovelNarrative log={log} />
            ) : (
              <ClassicLog log={log} />
            )}
          </React.Fragment>
        ))}

        {isLoading && (
          <div className="text-center text-zinc-400">
            <p className="animate-pulse">...</p>
          </div>
        )}
      </div>

      {/* 선택지 버튼 영역 */}
      {currentChoices.length > 0 && !isLoading && (
        <div className="flex-none p-4 bg-zinc-900 border-t border-zinc-800">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs text-zinc-500 mb-2">💬 선택하세요:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {currentChoices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice)}
                  className="p-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-lg text-left transition-all"
                >
                  <span className="mr-2">{choice.icon}</span>
                  {choice.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 텍스트 입력 영역 */}
      <div className="flex-none p-4 bg-zinc-900 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto flex gap-2">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading && textInput.trim()) {
                  e.preventDefault();
                  handleTextSubmit();
                }
              }}
              disabled={isLoading}
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
              placeholder="또는 직접 입력..."
            />
            <button
              onClick={handleTextSubmit}
              disabled={isLoading || !textInput.trim()}
              className="px-6 bg-blue-700 hover:bg-blue-600 rounded-lg text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            💡 힌트: 위 버튼을 클릭하거나 직접 입력할 수 있습니다
          </p>
        </div>
      </div>

      {/* 설정 모달 */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}