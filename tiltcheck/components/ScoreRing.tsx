"use client";

import { useEffect, useState, useMemo } from "react";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export default function ScoreRing({
  score,
  size = 120,
  strokeWidth = 8,
  label = "Score",
}: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayScore / 100) * circumference;

  const color = useMemo(() => {
    if (score >= 70) return "#22c55e";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  }, [score]);

  // Animate score counting from 0 to final value
  useEffect(() => {
    if (score === 0) {
      setDisplayScore(0);
      return;
    }
    const duration = 800;
    const steps = 30;
    const increment = score / steps;
    let current = 0;
    const interval = duration / steps;

    const timer = setInterval(() => {
      current += 1;
      if (current >= steps) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(increment * current));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [score]);

  return (
    <div className="relative flex items-center justify-center animate-score-reveal">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1a1a2e"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>
          {displayScore}
        </span>
        <span className="text-[10px] text-[#8b8ba0] uppercase tracking-wider">
          {label}
        </span>
      </div>
    </div>
  );
}
