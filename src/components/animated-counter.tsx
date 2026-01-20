'use client';

import { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
}

const AnimatedCounter = ({ value, duration = 2000 }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const startTimestampRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  useEffect(() => {
    const animateCount = (timestamp: number) => {
      if (!startTimestampRef.current) {
        startTimestampRef.current = timestamp;
      }

      const progress = timestamp - startTimestampRef.current;
      const progressFraction = Math.min(progress / duration, 1);
      const easedProgress = easeOutCubic(progressFraction);

      const newCount = Math.floor(easedProgress * value);
      setCount(newCount);

      if (progress < duration) {
        frameRef.current = requestAnimationFrame(animateCount);
      }
    };
    
    startTimestampRef.current = null;
    frameRef.current = requestAnimationFrame(animateCount);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);

  return (
    <div className="text-4xl font-bold">
      {count.toLocaleString('es-ES')}
    </div>
  );
};

export { AnimatedCounter };
