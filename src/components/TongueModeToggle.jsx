export function TongueModeToggle({ enabled, onToggle }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs uppercase tracking-wider text-[#666]">
        Tongue Mode
      </span>
      <button
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
          enabled 
            ? 'bg-[#FF6B6B]' 
            : 'bg-[#2a2a2a] border border-[#3a3a3a]'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${
            enabled 
              ? 'left-7 bg-white' 
              : 'left-1 bg-[#666]'
          }`}
        />
      </button>
    </div>
  );
}

