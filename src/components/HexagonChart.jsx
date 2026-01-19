import { useMemo, useEffect, useState } from 'react';

// Bright Pantone-inspired colors
const COLORS = {
  accuracy: '#FF6B6B',    // Coral Red
  speed: '#4ECDC4',       // Turquoise
  completion: '#FFE66D',  // Yellow
  fluency: '#22C55E',     // Vibrant Green
  consistency: '#A66CFF', // Purple
  rhythm: '#FF9F43',      // Orange
};

const METRICS = [
  { key: 'accuracy', label: 'Accuracy', color: COLORS.accuracy, icon: '🎯' },
  { key: 'speed', label: 'Speed', color: COLORS.speed, icon: '⚡' },
  { key: 'completion', label: 'Completion', color: COLORS.completion, icon: '✓' },
  { key: 'fluency', label: 'Fluency', color: COLORS.fluency, icon: '🌊' },
  { key: 'consistency', label: 'Consistency', color: COLORS.consistency, icon: '💎' },
  { key: 'rhythm', label: 'Rhythm', color: COLORS.rhythm, icon: '🎵' },
];

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function createHexagonPath(cx, cy, radius) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60);
    const point = polarToCartesian(cx, cy, radius, angle);
    points.push(`${point.x},${point.y}`);
  }
  return `M ${points.join(' L ')} Z`;
}

function createDataPath(cx, cy, maxRadius, values) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60);
    const value = values[i] || 0;
    const radius = (value / 100) * maxRadius;
    const point = polarToCartesian(cx, cy, radius, angle);
    points.push(`${point.x},${point.y}`);
  }
  return `M ${points.join(' L ')} Z`;
}

export function HexagonChart({ scores, isListening, hasFinishedSpeaking }) {
  const cx = 200;
  const cy = 150;
  const maxRadius = 90;

  // Animate score visibility after speaking stops
  const [showScore, setShowScore] = useState(false);
  
  useEffect(() => {
    if (hasFinishedSpeaking && !isListening) {
      // Delay the animation slightly for effect
      const timer = setTimeout(() => {
        setShowScore(true);
      }, 300);
      return () => clearTimeout(timer);
    } else if (isListening) {
      setShowScore(false);
    }
  }, [hasFinishedSpeaking, isListening]);

  const values = useMemo(() => {
    return METRICS.map(m => scores[m.key] || 0);
  }, [scores]);

  const overallScore = useMemo(() => {
    const validScores = values.filter(v => v > 0);
    if (validScores.length === 0) return 0;
    return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
  }, [values]);

  const hexagonLevels = [0.25, 0.5, 0.75, 1];

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 400 300" className="w-full max-w-[400px]">
        {/* Background hexagon levels */}
        {hexagonLevels.map((level, i) => (
          <path
            key={i}
            d={createHexagonPath(cx, cy, maxRadius * level)}
            fill="none"
            stroke="#2a2a2a"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {METRICS.map((_, i) => {
          const angle = i * 60;
          const end = polarToCartesian(cx, cy, maxRadius, angle);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              stroke="#2a2a2a"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon with gradient */}
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.accuracy} stopOpacity="0.8" />
            <stop offset="50%" stopColor={COLORS.speed} stopOpacity="0.8" />
            <stop offset="100%" stopColor={COLORS.completion} stopOpacity="0.8" />
          </linearGradient>
        </defs>
        
        <path
          d={createDataPath(cx, cy, maxRadius, values)}
          fill="url(#scoreGradient)"
          fillOpacity="0.3"
          stroke="url(#scoreGradient)"
          strokeWidth="2"
          className="transition-all duration-500"
        />

        {/* Data points */}
        {METRICS.map((metric, i) => {
          const angle = i * 60;
          const value = values[i] || 0;
          const radius = (value / 100) * maxRadius;
          const point = polarToCartesian(cx, cy, radius, angle);
          return (
            <circle
              key={metric.key}
              cx={point.x}
              cy={point.y}
              r="6"
              fill={metric.color}
              stroke="#0a0a0a"
              strokeWidth="2"
              className="transition-all duration-500"
            />
          );
        })}

        {/* Labels */}
        {METRICS.map((metric, i) => {
          const angle = i * 60;
          const labelRadius = maxRadius + 30;
          const point = polarToCartesian(cx, cy, labelRadius, angle);
          
          // Adjust text anchor based on position
          let textAnchor = 'middle';
          if (angle === 60 || angle === 120) textAnchor = 'start';
          if (angle === 240 || angle === 300) textAnchor = 'end';
          
          return (
            <text
              key={metric.key}
              x={point.x}
              y={point.y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              fill={metric.color}
              fontSize="12"
              fontWeight="600"
            >
              {metric.label}
            </text>
          );
        })}

        {/* Center score - only show after speaking finishes */}
        <g 
          className={`transition-all duration-700 ease-out ${
            showScore 
              ? 'opacity-100' 
              : 'opacity-0'
          }`}
          style={{
            transform: showScore ? 'scale(1)' : 'scale(0.5)',
            transformOrigin: `${cx}px ${cy}px`,
            transition: 'opacity 0.7s ease-out, transform 0.7s ease-out'
          }}
        >
          <text
            x={cx}
            y={cy - 10}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="36"
            fontWeight="bold"
          >
            {overallScore}
          </text>
          <text
            x={cx}
            y={cy + 18}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#888"
            fontSize="12"
          >
            OVERALL
          </text>
        </g>
      </svg>

      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-2 w-full mt-6">
        {METRICS.map((metric) => {
          const score = scores[metric.key] || 0;
          const isLow = score < 50;
          const isMedium = score >= 50 && score < 80;
          
          return (
            <div
              key={metric.key}
              className="relative overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 group hover:border-[#3a3a3a] transition-all duration-200"
            >
              {/* Background glow based on score */}
              <div 
                className="absolute inset-0 opacity-10 transition-opacity duration-300 group-hover:opacity-20"
                style={{ 
                  background: `radial-gradient(circle at center, ${metric.color} 0%, transparent 70%)` 
                }}
              />
              
              {/* Content */}
              <div className="relative">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-sm">{metric.icon}</span>
                  <span
                    className="text-xl font-bold tabular-nums"
                    style={{ color: metric.color }}
                  >
                    {score}
                  </span>
                </div>
                <div 
                  className="text-[10px] uppercase tracking-wider text-center"
                  style={{ color: `${metric.color}99` }}
                >
                  {metric.label}
                </div>
                
                {/* Mini progress bar */}
                <div className="mt-2 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${score}%`,
                      backgroundColor: metric.color 
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
