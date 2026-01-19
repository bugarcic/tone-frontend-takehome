import { useMemo } from 'react';
import { normalizeText } from '../utils/textNormalization';

export function TwisterDisplay({ twister, isGenerating, results }) {
  // Generate pending results if no results provided (before speaking)
  const displayResults = useMemo(() => {
    if (results && results.length > 0) {
      return results;
    }
    
    // If we have a twister but no results yet, create pending results
    if (twister) {
      const words = normalizeText(twister);
      return words.map(word => ({ word, status: 'pending' }));
    }
    
    return [];
  }, [twister, results]);

  if (isGenerating) {
    return (
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-8 md:p-12">
        <div className="space-y-4">
          <div className="h-10 skeleton rounded-lg w-3/4"></div>
          <div className="h-10 skeleton rounded-lg w-full"></div>
          <div className="h-10 skeleton rounded-lg w-1/2"></div>
        </div>
        <p className="text-[#555] text-sm mt-6 animate-pulse">
          ✨ Generating your tongue twister...
        </p>
      </div>
    );
  }

  if (!twister) {
    return (
      <div className="bg-[#141414] border border-[#2a2a2a] border-dashed rounded-2xl p-8 md:p-12">
        <p className="text-[#555] text-center text-lg">
          Enter a theme and click "Generate" to create your tongue twister
        </p>
      </div>
    );
  }

  // Always show color-coded words (pending state before speaking)
  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-8 md:p-12">
      <p className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-relaxed flex flex-wrap gap-x-3 gap-y-2">
        {displayResults.map((result, index) => (
          <span
            key={index}
            className={`word-transition px-2 py-1 rounded-lg ${
              result.status === 'correct'
                ? 'text-emerald-400 bg-emerald-500/10'
                : result.status === 'incorrect'
                ? 'text-red-400 bg-red-500/10'
                : 'text-[#666]'
            }`}
            title={result.status === 'incorrect' && result.spoken ? `You said: "${result.spoken}"` : undefined}
          >
            {result.word}
          </span>
        ))}
      </p>
    </div>
  );
}
