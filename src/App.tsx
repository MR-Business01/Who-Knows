import { useState } from 'react';
import { useFullscreen } from './hooks/useFullscreen';
import { useSoundEffects } from './hooks/useSoundEffects';
import { useGameEngine } from './hooks/useGameEngine';
import { Navbar } from './components/Navbar';
import { TimerBar } from './components/TimerBar';
import { LogoCard } from './components/LogoCard';
import { AnswerOptions } from './components/AnswerOptions';
import { StatsModal } from './components/StatsModal';
import { MultiplayerModal } from './components/MultiplayerModal';
import { SettingsModal } from './components/SettingsModal';
import { GameSelector } from './components/GameSelector';
import { AdContainer } from './components/AdContainer';
import { Play, Trophy, Settings, Gauge } from 'lucide-react';

export function App() {
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const { soundEnabled, toggleSound, playCorrect, playWrong, playGameOver } = useSoundEffects();

  const {
    gameState,
    gameMode,
    updateGameMode,
    timeLeft,
    timerSetting,
    difficultySetting,
    updateTimerSetting,
    updateDifficultySetting,
    currentQuestion,
    score,
    correctCount,
    wrongCount,
    feedback,
    selectedOption,
    highScore,
    finalStats,
    startGame,
    resetToHome,
    handleAnswer,
  } = useGameEngine(playCorrect, playWrong, playGameOver);

  const heroIcon = gameMode === 'cars' ? '🏎️' : gameMode === 'flags' ? '🚩' : '🏛️';
  const gameTitle = gameMode === 'cars' ? 'CARS LOGO' : gameMode === 'flags' ? 'WORLD FLAGS' : 'COUNTRY CAPITALS';
  const gameDesc =
    gameMode === 'cars'
      ? 'Test your car brand knowledge'
      : gameMode === 'flags'
      ? 'Identify world countries by their flags'
      : 'Guess the capital city for each country';

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-4 px-2 select-none relative overflow-hidden">
      <div className="absolute top-[-10%] left-[20%] w-[300px] h-[300px] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[300px] h-[300px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md flex-1 flex flex-col justify-between z-10">
        <Navbar
          score={score}
          highScore={highScore}
          gameMode={gameMode}
          timerSetting={timerSetting}
          difficultySetting={difficultySetting}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onOpenMultiplayer={() => setIsMultiplayerOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <AdContainer type="banner" />

        {gameState === 'idle' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 my-auto">
            {/* Category Selector */}
            <GameSelector gameMode={gameMode} onSelectGameMode={updateGameMode} />

            {/* Hero Icon */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 shadow-2xl shadow-blue-500/30 mb-4 animate-pulse-glow relative">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                <span className="text-5xl">{heroIcon}</span>
              </div>
            </div>

            <h1 className="text-3xl font-black text-white tracking-tight mb-1">
              {gameTitle} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">QUIZ</span>
            </h1>

            <p className="text-xs text-slate-300 font-medium max-w-xs mb-5">
              {gameDesc} in <strong className="text-cyan-400 font-bold">{timerSetting} seconds</strong>.
            </p>

            {/* Start Button */}
            <button
              onClick={startGame}
              className="w-full max-w-xs py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-black text-lg tracking-wide shadow-xl shadow-blue-600/40 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mb-4"
            >
              <Play className="w-6 h-6 fill-current text-white" />
              <span>START {timerSetting}s RUSH</span>
            </button>

            {/* Quick Settings Bar on Homepage */}
            <div className="w-full max-w-xs flex gap-2 mb-4">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex-1 py-2.5 px-3 rounded-2xl glass-button text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700/80"
              >
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>SETTINGS ({timerSetting}s, {difficultySetting.toUpperCase()})</span>
              </button>
            </div>

            {/* Highlights Grid */}
            <div className="w-full max-w-xs grid grid-cols-2 gap-2 text-left text-xs">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">MODE</div>
                  <div className="font-bold text-slate-200 capitalize">{difficultySetting}</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">BEST RECORD</div>
                  <div className="font-bold text-slate-200">{highScore} PTS</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between my-auto">
            <TimerBar
              timeLeft={timeLeft}
              maxTime={timerSetting}
              correctCount={correctCount}
              wrongCount={wrongCount}
            />

            <LogoCard
              logo={currentQuestion?.logo || null}
              countryName={currentQuestion?.countryName}
              gameMode={gameMode}
              feedback={feedback}
              onToggleFullscreen={toggleFullscreen}
            />

            <AnswerOptions
              options={currentQuestion?.options || []}
              correctBrand={currentQuestion?.targetAnswer}
              selectedOption={selectedOption}
              feedback={feedback}
              onSelectOption={handleAnswer}
            />
          </div>
        )}

        {/* Centered Clean Footer */}
        <footer className="w-full max-w-md mx-auto mt-4 px-4 text-center text-xs font-medium text-slate-400">
          Created with 🤍
        </footer>
      </div>

      {/* End Round Stats Modal */}
      {gameState === 'ended' && (
        <StatsModal
          stats={finalStats}
          onPlayAgain={startGame}
          onGoHome={resetToHome}
        />
      )}

      {/* Friends Group Multiplayer Room Modal */}
      <MultiplayerModal
        isOpen={isMultiplayerOpen}
        onClose={() => setIsMultiplayerOpen(false)}
        currentTimerSetting={timerSetting}
        currentDifficultySetting={difficultySetting}
        currentGameMode={gameMode}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        timerSetting={timerSetting}
        difficultySetting={difficultySetting}
        onSelectTimer={updateTimerSetting}
        onSelectDifficulty={updateDifficultySetting}
      />
    </div>
  );
}

export default App;
