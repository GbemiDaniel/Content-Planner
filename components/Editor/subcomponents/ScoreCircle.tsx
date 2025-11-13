import React from 'react';

interface ScoreCircleProps {
    score: number;
    size?: 'sm' | 'lg';
}

const ScoreCircle: React.FC<ScoreCircleProps> = ({ score, size = 'sm' }) => {
  const isLarge = size === 'lg';
  const radius = isLarge ? 36 : 24;
  const strokeWidth = isLarge ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 10) * circumference;
  const color = score >= 8 ? 'text-green-400' : score >= 5 ? 'text-yellow-400' : 'text-red-400';
  const dimension = isLarge ? 'w-24 h-24' : 'w-16 h-16';
  const svgDimension = isLarge ? 88 : 60;
  const center = svgDimension / 2;

  return (
    <div className={`relative ${dimension}`}>
      <svg className="w-full h-full" viewBox={`0 0 ${svgDimension} ${svgDimension}`}>
        <circle className="text-gray-600/50" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={center} cy={center} />
        <circle
          className={`${color} transition-all duration-1000 ease-in-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center font-bold ${isLarge ? 'text-3xl' : 'text-lg'}`}>{score}</span>
    </div>
  );
};

export default React.memo(ScoreCircle);
