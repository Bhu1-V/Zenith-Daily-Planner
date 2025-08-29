import React, { useRef, useEffect, useMemo, FC } from 'react';
import { PlannerData } from '../types';

const areDatesSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

const formatDateToKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

const getProductivityColor = (value: number) => {
    if (value >= 80) return 'text-emerald-500 dark:text-emerald-400';
    if (value >= 50) return 'text-amber-500 dark:text-amber-400';
    if (value > 0) return 'text-rose-500 dark:text-rose-400';
    return 'text-slate-200 dark:text-slate-700'; // Track color for 0
};

interface GaugeButtonProps {
    date: Date;
    isSelected: boolean;
    isToday: boolean;
    signal: number;
    absolute: number;
    isFuture: boolean;
    onClick: () => void;
    'data-index': number;
}

const GaugeButton: FC<GaugeButtonProps> = ({ date, isSelected, isToday, signal, absolute, isFuture, onClick, ...props }) => {
    const size = 80;
    const strokeWidth = 4;
    const center = size / 2;
    // Recalculate radii to give more space for text
    const outerRadius = (size / 2) - (strokeWidth / 2) - 2; // 40 - 2 - 2 = 36
    const innerRadius = outerRadius - strokeWidth - 2; // 36 - 4 - 2 = 30

    const circumference = 2 * Math.PI * outerRadius;
    const innerCircumference = 2 * Math.PI * innerRadius;

    const absoluteOffset = circumference * (1 - absolute / 100);
    const signalOffset = innerCircumference * (1 - signal / 100);

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const dayOfMonth = date.getDate();
    
    const buttonClasses = [
        'flex-shrink-0 w-20 h-20 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-indigo-500',
        isSelected
            ? 'shadow-lg scale-110'
            : 'hover:bg-slate-500/10',
    ].join(' ');

    const dayOfWeekClasses = `text-sm uppercase font-medium ${isSelected ? 'fill-indigo-500 dark:fill-indigo-500' : 'fill-slate-500 dark:fill-slate-400'}`;
    
    let dayOfMonthClasses = 'text-2xl font-semibold ';
    if (isToday && !isSelected) {
        dayOfMonthClasses += 'font-bold fill-indigo-600 dark:fill-indigo-400';
    } else if (isSelected) {
        dayOfMonthClasses += 'fill-indigo-600 dark:fill-indigo-400';
    } else {
        dayOfMonthClasses += 'fill-slate-700 dark:fill-slate-300';
    }

    return (
        <button onClick={onClick} className={buttonClasses} aria-label={date.toDateString()} {...props}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
                {isFuture ? (
                    <circle
                        cx={center} cy={center} r={size/2 - 2}
                        fill="transparent" stroke="currentColor" strokeWidth="2"
                        className="text-slate-200/80 dark:text-slate-700/50"
                    />
                ) : (
                    <g transform={`rotate(-90 ${center} ${center})`}>
                        {/* Background Tracks */}
                        <circle
                            cx={center} cy={center} r={outerRadius}
                            fill="transparent" stroke="currentColor" strokeWidth={strokeWidth}
                            className="text-slate-200 dark:text-slate-700/50"
                        />
                        <circle
                            cx={center} cy={center} r={innerRadius}
                            fill="transparent" stroke="currentColor" strokeWidth={strokeWidth}
                            className="text-slate-200 dark:text-slate-700/50"
                        />
                        {/* Value Arcs */}
                        <circle
                            cx={center} cy={center} r={outerRadius}
                            fill="transparent" stroke="currentColor" strokeWidth={strokeWidth}
                            strokeDasharray={circumference} strokeDashoffset={absoluteOffset}
                            strokeLinecap="round"
                            className={`${getProductivityColor(absolute)} transition-all duration-500`}
                            style={{ transitionProperty: 'stroke-dashoffset' }}
                        />
                        <circle
                            cx={center} cy={center} r={innerRadius}
                            fill="transparent" stroke="currentColor" strokeWidth={strokeWidth}
                            strokeDasharray={innerCircumference} strokeDashoffset={signalOffset}
                            strokeLinecap="round"
                            className={`${getProductivityColor(signal)} transition-all duration-500`}
                            style={{ transitionProperty: 'stroke-dashoffset' }}
                        />
                    </g>
                )}
                <text x={center} y={center} textAnchor="middle" dominantBaseline="central" className="select-none">
                     <tspan x={center} dy="-0.7em" className={dayOfWeekClasses}>{dayOfWeek}</tspan>
                     <tspan x={center} dy="1.2em" className={dayOfMonthClasses}>{dayOfMonth}</tspan>
                </text>
                 {isToday && isSelected && (
                    <circle cx={center} cy={center + 22} r={3} className="fill-indigo-600 dark:fill-indigo-400" />
                 )}
            </svg>
        </button>
    );
};

interface DatePickerProps {
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    goToToday: () => void;
    plannerData: PlannerData;
}

export const DatePicker: React.FC<DatePickerProps> = ({ currentDate, setCurrentDate, goToToday, plannerData }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isProgrammaticScroll = useRef(false);
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0,0,0,0);
        return d;
    }, []);

    const dates = useMemo(() => {
        const days = [];
        for (let i = -365; i <= 365; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push(date);
        }
        return days;
    }, [today]);

    // Effect for programmatic scrolling when a date is clicked
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const index = dates.findIndex(d => areDatesSameDay(d, currentDate));
        
        if (index > -1) {
            const element = container.children[index] as HTMLElement;
            if (element) {
                isProgrammaticScroll.current = true;
                element.scrollIntoView({
                    behavior: 'smooth',
                    inline: 'center',
                    block: 'nearest',
                });
                // Reset the flag after the scroll animation is likely finished
                setTimeout(() => {
                    isProgrammaticScroll.current = false;
                }, 1000);
            }
        }
    }, [currentDate, dates]);
    
    // Effect to handle selecting date by scrolling and releasing
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        let timeoutId: number;
        const handleScroll = () => {
            if (isProgrammaticScroll.current) return;
            
            clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                const containerRect = container.getBoundingClientRect();
                const containerCenter = containerRect.left + containerRect.width / 2;
                
                let closestElement: HTMLElement | null = null;
                let minDistance = Infinity;

                for (const child of Array.from(container.children)) {
                    const childEl = child as HTMLElement;
                    const childRect = childEl.getBoundingClientRect();
                    const childCenter = childRect.left + childRect.width / 2;
                    const distance = Math.abs(containerCenter - childCenter);

                    if (distance < minDistance) {
                        minDistance = distance;
                        closestElement = childEl;
                    }
                }
                
                if (closestElement) {
                    const newIndex = parseInt(closestElement.dataset.index || '0', 10);
                    const newDate = dates[newIndex];
                    if (newDate && !areDatesSameDay(newDate, currentDate)) {
                        setCurrentDate(newDate);
                    }
                }
            }, 150);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);

    }, [currentDate, dates, setCurrentDate]);

    const isTodaySelected = areDatesSameDay(currentDate, today);

    return (
        <div className="mt-6">
            <div className="flex items-center justify-between mb-2 px-2">
                <p className="font-bold text-lg text-slate-700 dark:text-slate-300">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </p>
                {!isTodaySelected && (
                    <button onClick={goToToday} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                        Jump to Today
                    </button>
                )}
            </div>
            <div
                ref={scrollContainerRef}
                className="flex space-x-4 overflow-x-auto py-4 -mx-4 px-4 hide-scrollbar"
            >
                {dates.map((date, index) => {
                    const dateKey = formatDateToKey(date);
                    const review = plannerData[dateKey]?.review;
                    const isFuture = date > today;

                    return (
                        <GaugeButton
                            key={date.toISOString()}
                            data-index={index}
                            date={date}
                            isSelected={areDatesSameDay(date, currentDate)}
                            isToday={areDatesSameDay(date, today)}
                            signal={review?.signalProductivity ?? 0}
                            absolute={review?.absoluteProductivity ?? 0}
                            isFuture={isFuture}
                            onClick={() => setCurrentDate(date)}
                        />
                    );
                })}
            </div>
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};
