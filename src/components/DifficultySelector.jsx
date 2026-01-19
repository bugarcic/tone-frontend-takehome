import { FiSmile, FiTrendingUp, FiZap } from 'react-icons/fi';

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', words: '5-8', icon: FiSmile },
  { id: 'medium', label: 'Medium', words: '8-15', icon: FiTrendingUp },
  { id: 'hard', label: 'Hard', words: '15-25', icon: FiZap },
];

export function DifficultySelector({ value, onChange, disabled }) {
  return (
    <div className="w-full">
      <label className="block text-xs font-medium text-[#888] uppercase tracking-wider mb-1">
        Difficulty
      </label>
      <p className="text-[11px] text-[#555] mb-2">Affects length & complexity</p>
      <div className="flex gap-2">
        {DIFFICULTIES.map((diff) => {
          const Icon = diff.icon;
          return (
            <button
              key={diff.id}
              onClick={() => onChange(diff.id)}
              disabled={disabled}
              className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed text-sm border
                         flex items-center justify-center gap-1.5
                         ${value === diff.id
                           ? 'bg-white text-black border-white'
                           : 'bg-[#0a0a0a] text-[#888] border-[#2a2a2a] hover:border-[#444] hover:text-white'
                         }`}
            >
              <Icon size={14} />
              {diff.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
