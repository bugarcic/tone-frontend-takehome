export function ThemeInput({ value, onChange, disabled }) {
  return (
    <div className="w-full">
      <label 
        htmlFor="theme-input" 
        className="block text-xs font-medium text-[#888] uppercase tracking-wider mb-1"
      >
        Theme
      </label>
      <p className="text-[11px] text-[#555] mb-2">Pick any topic you like</p>
      <input
        id="theme-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="pirates, space, cooking..."
        className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg 
                   text-white placeholder-[#555] text-sm
                   focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-[#444]
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200"
      />
    </div>
  );
}
