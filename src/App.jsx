import { useState, useCallback } from 'react';
import { ThemeInput } from './components/ThemeInput';
import { DifficultySelector } from './components/DifficultySelector';
import { ApiKeyInput } from './components/ApiKeyInput';
import { TwisterDisplay } from './components/TwisterDisplay';
import { LiveTranscript } from './components/LiveTranscript';
import { ControlButtons } from './components/ControlButtons';
import { ErrorMessage } from './components/ErrorMessage';
import { HexagonChart } from './components/HexagonChart';
import { TongueModeToggle } from './components/TongueModeToggle';
import { TongueBackground } from './components/TongueBackground';
import { useOpenAI } from './hooks/useOpenAI';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useScoring } from './hooks/useScoring';
import { FiClock, FiRepeat } from 'react-icons/fi';

function App() {
  // Form state
  const [theme, setTheme] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [apiKey, setApiKey] = useState('');
  
  // Session state
  const [twister, setTwister] = useState(null);
  const [attempts, setAttempts] = useState(0);
  
  // Tongue mode
  const [tongueMode, setTongueMode] = useState(false);

  // Hooks
  const { generateTwister, isGenerating, error: openAIError, clearError: clearOpenAIError } = useOpenAI(apiKey);
  const { 
    isListening, 
    transcript, 
    finalTranscript,
    interimTranscript,
    isSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    duration,
  } = useSpeechRecognition();
  const { results, scores, overallScore, isComplete, stats } = useScoring(twister, transcript, duration);

  // Handlers
  const handleGenerate = useCallback(async () => {
    if (!theme.trim()) return;
    
    const newTwister = await generateTwister(theme.trim(), difficulty);
    if (newTwister) {
      setTwister(newTwister);
      setAttempts(0);
      resetTranscript();
    }
  }, [theme, difficulty, generateTwister, resetTranscript]);

  const handleStartListening = useCallback(() => {
    setAttempts(prev => prev + 1);
    startListening();
  }, [startListening]);

  const handleStopListening = useCallback(() => {
    stopListening();
  }, [stopListening]);

  const handleRetry = useCallback(() => {
    resetTranscript();
  }, [resetTranscript]);

  const handleNewTwister = useCallback(() => {
    setTwister(null);
    setAttempts(0);
    resetTranscript();
  }, [resetTranscript]);

  const handleDismissError = useCallback(() => {
    clearOpenAIError();
  }, [clearOpenAIError]);

  // Combine errors
  const error = openAIError || speechError;
  const canGenerate = theme.trim().length > 0 && apiKey.trim().length > 0 && isSupported;

  return (
    <div className="min-h-screen grid-bg relative">
      {/* Tongue Mode Background */}
      {tongueMode && <TongueBackground />}
      
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header with Tongue Mode Toggle */}
        <header className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full text-sm text-[#888] mb-6">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                AI-POWERED SPEECH COACH
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold text-white leading-tight tracking-tight">
                Master any tongue twister
              </h1>
            </div>
            
            {/* Tongue Mode Toggle */}
            <div className="pt-2">
              <TongueModeToggle 
                enabled={tongueMode} 
                onToggle={() => setTongueMode(prev => !prev)} 
              />
            </div>
          </div>
          
          {/* API Key Input - below heading */}
          {!twister && !isGenerating && (
            <div className="mt-6 max-w-xs">
              <ApiKeyInput 
                value={apiKey} 
                onChange={setApiKey} 
                disabled={isGenerating}
              />
            </div>
          )}
        </header>

        {/* Browser support warning */}
        {!isSupported && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <p className="text-amber-300 text-sm">
              ⚠️ Speech recognition is not supported in your browser. Please use Chrome.
            </p>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onDismiss={handleDismissError} />
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          {/* Left Column - Generation & Practice */}
          <div className="space-y-6">
            {/* Setup section - only show when no twister */}
            {!twister && !isGenerating && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
                  <ThemeInput 
                    value={theme} 
                    onChange={setTheme} 
                    disabled={isGenerating}
                  />
                </div>
                <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
                  <DifficultySelector 
                    value={difficulty} 
                    onChange={setDifficulty} 
                    disabled={isGenerating}
                  />
                </div>
              </div>
            )}

            {/* Twister display - always pass results for consistent styling */}
            <TwisterDisplay 
              twister={twister} 
              isGenerating={isGenerating}
              results={results}
            />

            {/* Live transcript - only show when we have a twister */}
            {twister && (
              <LiveTranscript 
                transcript={finalTranscript}
                interimTranscript={interimTranscript}
                isListening={isListening}
                duration={duration}
              />
            )}

            {/* Control buttons */}
            <ControlButtons
              onGenerate={handleGenerate}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
              onRetry={handleRetry}
              onNewTwister={handleNewTwister}
              isGenerating={isGenerating}
              isListening={isListening}
              hasTwister={!!twister}
              hasTranscript={!!transcript}
              canGenerate={canGenerate}
            />
          </div>

          {/* Right Column - Scoring */}
          <div className="lg:sticky lg:top-12 lg:self-start">
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-medium text-[#888] uppercase tracking-wider">
                  Performance
                </h2>
                {attempts > 0 && (
                  <span className="text-xs text-[#555]">
                    Attempt #{attempts}
                  </span>
                )}
              </div>
              
              {twister ? (
                <HexagonChart 
                  scores={scores} 
                  isListening={isListening}
                  hasFinishedSpeaking={!!transcript && !isListening}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-24 h-24 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-[#444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <p className="text-[#555] text-sm">
                    Generate a tongue twister to see your scores
                  </p>
                </div>
              )}

              {/* Speed indicator when recording */}
              {isListening && (
                <div className="mt-6 pt-6 border-t border-[#2a2a2a]">
                  <div className="flex items-center justify-center gap-3">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-red-400 text-sm font-medium">Recording...</span>
                  </div>
                </div>
              )}

              {/* Stats display after recording */}
              {duration && !isListening && (
                <div className="mt-6 pt-6 border-t border-[#2a2a2a]">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Time Card */}
                    <div className="relative overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 group hover:border-[#3a3a3a] transition-all duration-200">
                      <div 
                        className="absolute inset-0 opacity-10 transition-opacity duration-300 group-hover:opacity-20"
                        style={{ background: 'radial-gradient(circle at center, #4ECDC4 0%, transparent 70%)' }}
                      />
                      <div className="relative">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <FiClock className="text-[#4ECDC4]" size={16} />
                          <span className="text-xl font-bold text-[#4ECDC4] tabular-nums">
                            {duration.toFixed(1)}s
                          </span>
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-center text-[#4ECDC499]">
                          Time
                        </div>
                      </div>
                    </div>
                    
                    {/* Extra Words Card */}
                    <div className="relative overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 group hover:border-[#3a3a3a] transition-all duration-200">
                      <div 
                        className="absolute inset-0 opacity-10 transition-opacity duration-300 group-hover:opacity-20"
                        style={{ background: `radial-gradient(circle at center, ${stats.extraWords > 0 ? '#FF9F43' : '#22c55e'} 0%, transparent 70%)` }}
                      />
                      <div className="relative">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <FiRepeat className={stats.extraWords > 0 ? 'text-[#FF9F43]' : 'text-[#22c55e]'} size={16} />
                          <span className={`text-xl font-bold tabular-nums ${stats.extraWords > 0 ? 'text-[#FF9F43]' : 'text-[#22c55e]'}`}>
                            {stats.extraWords > 0 ? `+${stats.extraWords}` : '0'}
                          </span>
                        </div>
                        <div 
                          className="text-[10px] uppercase tracking-wider text-center"
                          style={{ color: stats.extraWords > 0 ? '#FF9F4399' : '#22c55e99' }}
                        >
                          Extra Words
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {stats.extraWords > 0 && (
                    <p className="text-xs text-[#666] text-center mt-3">
                      Repetitions penalize Fluency & Rhythm
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-[#2a2a2a]">
          <p className="text-sm text-[#555]">
            Tip: Speak clearly and maintain a steady pace for the best scores.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
