import React, { useRef, useEffect, useMemo } from 'react';

interface DatePickerProps {
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    goToToday: () => void;
}

const areDatesSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

export const DatePicker: React.FC<DatePickerProps> = ({ currentDate, setCurrentDate, goToToday }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const activeDateRef = useRef<HTMLButtonElement>(null);

    const today = new Date();
    const isTodaySelected = areDatesSameDay(currentDate, today);

    const dates = useMemo(() => {
        const days = [];
        const centerDate = new Date(currentDate);
        for (let i = -15; i <= 15; i++) {
            const date = new Date(centerDate);
            date.setDate(centerDate.getDate() + i);
            days.push(date);
        }
        return days;
    }, [currentDate]);

    useEffect(() => {
        if (activeDateRef.current) {
            activeDateRef.current.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest',
            });
        }
    }, [currentDate]);


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
                className="flex space-x-2 overflow-x-auto pb-3 -mx-4 px-4 hide-scrollbar"
                style={{ scrollSnapType: 'x mandatory' }}
            >
                {dates.map((date, index) => {
                    const isSelected = areDatesSameDay(date, currentDate);
                    const isToday = areDatesSameDay(date, today);
                    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayOfMonth = date.getDate();

                    const buttonClasses = [
                        'flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-indigo-500',
                        isSelected
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700',
                        isToday && !isSelected ? 'ring-2 ring-indigo-500' : ''
                    ].join(' ');

                    return (
                        <button
                            key={index}
                            ref={isSelected ? activeDateRef : null}
                            onClick={() => setCurrentDate(date)}
                            className={buttonClasses}
                            aria-label={date.toDateString()}
                            style={{ scrollSnapAlign: 'center' }}
                        >
                            <span className={`text-xs uppercase ${isSelected ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>{dayOfWeek}</span>
                            <span className="text-xl">{dayOfMonth}</span>
                        </button>
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
