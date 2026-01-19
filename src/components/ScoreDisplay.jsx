export function ScoreDisplay({ score, attempts, isComplete }) {
  if (score === null) {
    return null;
  }

  const getScoreColor = () => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreMessage = () => {
    if (score >= 90) return 'Excellent!';
    if (score >= 70) return 'Good job!';
    if (score >= 50) return 'Keep practicing';
    return 'Try again';
  };

  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <span className={`text-6xl font-bold tabular-nums ${getScoreColor()}`}>
            {score}%
          </span>
          {isComplete && (
            <span className="text-lg text-[#888]">
              {getScoreMessage()}
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-[#555] uppercase tracking-wider mb-1">Attempt</p>
          <p className="text-3xl font-semibold text-white tabular-nums">
            #{attempts}
          </p>
        </div>
      </div>
    </div>
  );
}
