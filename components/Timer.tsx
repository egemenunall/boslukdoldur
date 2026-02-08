'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
  duration: number; // saniye cinsinden
  onComplete: () => void;
  autoStart?: boolean;
}

export default function Timer({ duration, onComplete, autoStart = true }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);

  useEffect(() => {
    setTimeLeft(duration);
    setIsRunning(autoStart);
  }, [duration, autoStart]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const percentage = (timeLeft / duration) * 100;
  
  // Renk hesaplama
  const getColor = () => {
    if (percentage > 50) return 'text-green-500';
    if (percentage > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRingColor = () => {
    if (percentage > 50) return 'stroke-green-500';
    if (percentage > 20) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  // Titreşim efekti son 5 saniyede
  const shouldShake = timeLeft <= 5 && timeLeft > 0;

  return (
    <div className={`flex items-center justify-center ${shouldShake ? 'animate-bounce' : ''}`}>
      <div className="relative w-24 h-24">
        {/* Background Circle */}
        <svg className="transform -rotate-90 w-24 h-24">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          {/* Progress Circle */}
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={251.2}
            strokeDashoffset={251.2 - (251.2 * percentage) / 100}
            className={`${getRingColor()} transition-all duration-1000 ease-linear`}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Timer Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-bold ${getColor()}`}>
            {timeLeft}
          </span>
        </div>
      </div>
    </div>
  );
}
