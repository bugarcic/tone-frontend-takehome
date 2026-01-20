import { useState } from 'react';
import { FiLock } from 'react-icons/fi';

export function TongueModeToggle({ enabled, onToggle, isUnlocked }) {
  const [showLockedMessage, setShowLockedMessage] = useState(false);

  const handleClick = () => {
    if (isUnlocked) {
      onToggle();
    } else {
      setShowLockedMessage(true);
      // Auto-hide after 3 seconds
      setTimeout(() => setShowLockedMessage(false), 3000);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-wider text-[#666]">
          Tongue Mode
        </span>
        <button
          onClick={handleClick}
          className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
            !isUnlocked
              ? 'bg-[#2a2a2a] border border-[#3a3a3a] cursor-not-allowed'
              : enabled 
                ? 'bg-[#FF6B6B]' 
                : 'bg-[#2a2a2a] border border-[#3a3a3a]'
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 flex items-center justify-center ${
              !isUnlocked
                ? 'left-1 bg-[#444]'
                : enabled 
                  ? 'left-7 bg-white' 
                  : 'left-1 bg-[#666]'
            }`}
          >
            {!isUnlocked && (
              <FiLock className="w-2.5 h-2.5 text-[#666]" />
            )}
          </div>
        </button>
      </div>

      {/* Locked Message Dialog */}
      {showLockedMessage && (
        <div className="absolute top-full right-0 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-red-950 border border-red-500/50 rounded-lg p-4 shadow-lg shadow-red-500/10 w-80">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                <FiLock className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-red-300 font-medium text-sm">Tongue Mode Locked</p>
                <p className="text-red-400/80 text-xs mt-1">
                  Achieve a perfect 100% overall score on any tongue twister to unlock this mode!
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowLockedMessage(false)}
              className="absolute top-2 right-2 text-red-400/60 hover:text-red-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
