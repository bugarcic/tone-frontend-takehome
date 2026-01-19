import { FiZap, FiMic, FiMicOff, FiRefreshCw, FiShuffle } from 'react-icons/fi';

export function ControlButtons({
  onGenerate,
  onStartListening,
  onStopListening,
  onRetry,
  onNewTwister,
  isGenerating,
  isListening,
  hasTwister,
  hasTranscript,
  canGenerate,
}) {
  const baseButtonClass = "px-6 py-4 font-medium rounded-xl transition-all duration-200 text-sm";
  const primaryClass = `${baseButtonClass} bg-white text-black hover:bg-gray-100 disabled:bg-[#333] disabled:text-[#666] disabled:cursor-not-allowed`;
  const secondaryClass = `${baseButtonClass} bg-[#1a1a1a] text-white border border-[#2a2a2a] hover:border-[#444] hover:bg-[#222]`;
  const dangerClass = `${baseButtonClass} bg-red-600 text-white hover:bg-red-500 listening-pulse`;

  // State 1: No twister yet - show Generate button
  if (!hasTwister) {
    return (
      <div className="flex gap-3">
        <button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className={`flex-1 ${primaryClass}`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <FiZap size={16} />
              Generate Tongue Twister
            </span>
          )}
        </button>
      </div>
    );
  }

  // State 2: Has twister - show speech controls
  return (
    <div className="flex gap-3">
      {!isListening ? (
        <>
          <button onClick={onStartListening} className={`flex-1 ${primaryClass}`}>
            <span className="flex items-center justify-center gap-2">
              <FiMic size={16} />
              Start Speaking
            </span>
          </button>
          {hasTranscript && (
            <button onClick={onRetry} className={secondaryClass}>
              <span className="flex items-center justify-center gap-2">
                <FiRefreshCw size={14} />
                Retry
              </span>
            </button>
          )}
          <button onClick={onNewTwister} className={secondaryClass}>
            <span className="flex items-center justify-center gap-2">
              <FiShuffle size={14} />
              New Twister
            </span>
          </button>
        </>
      ) : (
        <button onClick={onStopListening} className={`flex-1 ${dangerClass}`}>
          <span className="flex items-center justify-center gap-2">
            <FiMicOff size={16} />
            Stop Recording
          </span>
        </button>
      )}
    </div>
  );
}
