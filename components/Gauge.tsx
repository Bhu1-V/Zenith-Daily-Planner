import React, { useEffect, useState, useRef } from 'react';

interface GaugeProps {
  value: number; // 0 to 100
  label: string;
  size?: number;
  strokeWidth?: number;
}

const ANIMATION_DURATION = 1000; // ms

export const Gauge: React.FC<GaugeProps> = ({ value, label, size = 120, strokeWidth = 10 }) => {
  // State for the SVG arc transition. We start at 0 and transition to the target value.
  const [displayValue, setDisplayValue] = useState(0);
  // State for the number counting up animation.
  const [animatedNumber, setAnimatedNumber] = useState(0);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    // Trigger the CSS transition for the SVG arc after the component has mounted.
    // Using a timeout of 0 pushes this to the next event loop tick.
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 0);

    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    // Animate the number counting up
    const startValue = animatedNumber;
    const endValue = value;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / ANIMATION_DURATION, 1);

      // Simple ease-out quadratic easing function
      const easedPercentage = percentage * (2 - percentage);
      const currentValue = startValue + (endValue - startValue) * easedPercentage;
      
      setAnimatedNumber(currentValue);

      if (progress < ANIMATION_DURATION) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        setAnimatedNumber(endValue); // Ensure it ends exactly on the target value
      }
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
    // Re-run animation if the target value changes.
    // We don't want to re-run it based on animatedNumber, so we disable the lint rule here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);


  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  
  // The gauge is a 3/4 circle arc (270 degrees)
  const arcLength = circumference * 0.75;
  
  // Correct calculation for the offset to "reveal" the arc
  const strokeOffset = arcLength * (1 - (displayValue / 100));

  const valueColorClass = value >= 80 ? 'text-emerald-500' : value >= 50 ? 'text-amber-500' : 'text-rose-500';
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-[225deg]">
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={0}
            className="text-slate-200 dark:text-slate-700"
          />
          {/* Value arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            className={`${valueColorClass} transition-all duration-1000 ease-out`}
            style={{ transitionProperty: 'stroke-dashoffset' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold tabular-nums ${valueColorClass}`}>{Math.round(animatedNumber)}%</span>
        </div>
      </div>
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-2">{label}</p>
    </div>
  );
};
