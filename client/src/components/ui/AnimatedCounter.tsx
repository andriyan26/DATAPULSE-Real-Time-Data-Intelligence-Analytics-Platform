import React, { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number; // milliseconds (default: 1400ms for initial, 450ms for live updates)
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1400,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const prevValueRef = useRef<number>(0);
  const isFirstRender = useRef<boolean>(true);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = isFirstRender.current ? 0 : prevValueRef.current;
    const endVal = value;
    
    // For live incremental updates (+1 or small diffs), use a quick silky 450ms burst
    const animDuration = isFirstRender.current
      ? duration
      : Math.min(duration, 450);

    isFirstRender.current = false;
    prevValueRef.current = value;

    if (startVal === endVal) {
      setDisplayValue(endVal);
      return;
    }

    let frameId: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / animDuration, 1);
      
      // Silky cubic-bezier ease-out curve
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(endVal);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  const formatted = decimals > 0
    ? displayValue.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(displayValue).toLocaleString('id-ID');

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
};

