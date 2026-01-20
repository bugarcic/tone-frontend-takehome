import { useState, useEffect } from 'react';

export function LiveTranscript({ transcript, interimTranscript, isListening, duration }) {
  const hasContent = transcript || interimTranscript;
  const [liveTime, setLiveTime] = useState(0);

  // Live timer while listening
  useEffect(() => {
    let interval;
    if (isListening) {
      setLiveTime(0);
      interval = setInterval(() => {
        setLiveTime(prev => prev + 0.1);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[#888] uppercase tracking-wider">
            Your Speech
          </span>
          {isListening && (
            <span className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 bg-emerald-500 rounded-full listening-pulse"></span>
              Listening
            </span>
          )}
        </div>
        {isListening && (
          <span className="text-sm text-[#4ECDC4] font-mono tabular-nums">
            {liveTime.toFixed(1)}s
          </span>
        )}
      </div>
      <div className={`min-h-[60px] transition-all duration-200`}>
        {hasContent ? (
          <p className="text-xl text-white leading-relaxed">
            {transcript}
            {interimTranscript && (
              <span className="text-[#555] italic"> {interimTranscript}</span>
            )}
          </p>
        ) : (
          <p className="text-[#555] text-sm flex items-center justify-start">
            {isListening ? (
              <span className="italic">Start speaking...</span>
            ) : (
              <>
                Click <span className="inline-flex items-center px-2 py-0.5 mx-1 bg-[#2a2a2a] border border-[#3a3a3a] rounded text-[#888] text-xs font-medium">Start Speaking</span> to begin
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
