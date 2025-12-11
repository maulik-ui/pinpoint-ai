import { motion } from "motion/react";

interface ScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  maxScore?: number;
}

export function ScoreCircle({ score, size = 112, strokeWidth = 6, maxScore = 10 }: ScoreCircleProps) {
  const percentage = (score / maxScore) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-muted/30"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-primary"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-foreground"
            style={{ 
              fontWeight: 600,
              fontSize: size >= 80 ? '1.5rem' : size >= 60 ? '1.25rem' : '1rem'
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {score.toFixed(1)}
          </motion.span>
        </div>
      </div>
    </div>
  );
}