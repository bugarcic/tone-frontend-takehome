import { useState } from 'react';
import { FiKey, FiEye, FiEyeOff } from 'react-icons/fi';

// Mask the API key to show only first 7 and last 4 characters
function maskApiKey(key) {
  if (!key || key.length < 15) return key;
  return `${key.slice(0, 7)}...${key.slice(-4)}`;
}

export function ApiKeyInput({ value, onChange, disabled }) {
  const [showKey, setShowKey] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Show masked version when not focused and not showing full key
  const displayValue = isFocused || showKey ? value : '';
  const maskedValue = maskApiKey(value);
  
  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]">
            <FiKey size={14} />
          </div>
          
          {/* Show masked display when not focused */}
          {!isFocused && !showKey && value && (
            <div className="absolute left-9 top-1/2 -translate-y-1/2 text-white text-sm font-mono pointer-events-none">
              {maskedValue}
            </div>
          )}
          
          <input
            id="api-key-input"
            type={showKey ? 'text' : 'password'}
            value={displayValue}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder={value ? '' : 'Enter your OpenAI API key (sk-...)'}
            className={`w-full pl-9 pr-10 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg 
                       text-white placeholder-[#555] text-sm font-mono
                       focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-[#444]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200
                       ${!isFocused && !showKey && value ? 'text-transparent' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors"
          >
            {showKey ? <FiEyeOff size={14} /> : <FiEye size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}

