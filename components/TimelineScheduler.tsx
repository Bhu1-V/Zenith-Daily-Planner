
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlannerSectionData } from '../types';
import { timeToMinutes, minutesToTime, formatTime } from '../utils/time';
import { InfoIcon, GripVerticalIcon } from './icons';

interface TimelineSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sections: PlannerSectionData[]) => void;
  date: Date;
  currentSectionId: string;
  initialSections: PlannerSectionData[];
}

const colorStyles: { [key: string]: { base: string; handle: string; text: string } } = {
    sky:     { base: 'bg-sky-100 border-sky-200 dark:bg-sky-900/60 dark:border-sky-800',      text: 'text-sky-800 dark:text-sky-200', handle: 'bg-sky-400/50 group-hover/handle:bg-sky-400/80 dark:bg-white/20 dark:group-hover/handle:bg-white/40' },
    teal:    { base: 'bg-teal-100 border-teal-200 dark:bg-teal-900/60 dark:border-teal-800',    text: 'text-teal-800 dark:text-teal-200', handle: 'bg-teal-400/50 group-hover/handle:bg-teal-400/80 dark:bg-white/20 dark:group-hover/handle:bg-white/40' },
    rose:    { base: 'bg-rose-100 border-rose-200 dark:bg-rose-900/60 dark:border-rose-800',    text: 'text-rose-800 dark:text-rose-200', handle: 'bg-rose-400/50 group-hover/handle:bg-rose-400/80 dark:bg-white/20 dark:group-hover/handle:bg-white/40' },
    orange:  { base: 'bg-orange-100 border-orange-200 dark:bg-orange-900/60 dark:border-orange-800',text: 'text-orange-800 dark:text-orange-200', handle: 'bg-orange-400/50 group-hover/handle:bg-orange-400/80 dark:bg-white/20 dark:group-hover/handle:bg-white/40' },
    violet:  { base: 'bg-violet-100 border-violet-200 dark:bg-violet-900/60 dark:border-violet-800',text: 'text-violet-800 dark:text-violet-200', handle: 'bg-violet-400/50 group-hover/handle:bg-violet-400/80 dark:bg-white/20 dark:group-hover/handle:bg-white/40' },
    emerald: { base: 'bg-emerald-100 border-emerald-200 dark:bg-emerald-900/60 dark:border-emerald-800',text: 'text-emerald-800 dark:text-emerald-200', handle: 'bg-emerald-400/50 group-hover/handle:bg-emerald-400/80 dark:bg-white/20 dark:group-hover/handle:bg-white/40' },
    slate:   { base: 'bg-slate-100 border-slate-200 dark:bg-slate-700/60 dark:border-slate-600/50',  text: 'text-slate-800 dark:text-slate-200', handle: 'bg-slate-400/50 group-hover/handle:bg-slate-400/80 dark:bg-white/20 dark:group-hover/handle:bg-white/40' }
};

const TIMELINE_START_HOUR = 4; // 4 AM
const TIMELINE_END_HOUR = 24; // Midnight
const TOTAL_MINUTES = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * 60;
const MIN_DURATION = 15; // Minimum duration of a section in minutes
const HOUR_HEIGHT = 80; // pixels per hour
const SNAP_SENSITIVITY_MINUTES = 6;

const CurrentTimeIndicator = ({ isToday }: { isToday: boolean }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        if (!isToday) return;
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, [isToday]);

    if (!isToday) return null;

    const minutesFromTimelineStart = currentTime.getHours() * 60 + currentTime.getMinutes() - (TIMELINE_START_HOUR * 60);
    if (minutesFromTimelineStart < 0 || minutesFromTimelineStart > TOTAL_MINUTES) return null;

    const top = (minutesFromTimelineStart / 60) * HOUR_HEIGHT;

    return (
        <div className="absolute left-0 right-0 pointer-events-none z-30" style={{ top }}>
            <div className="relative h-px bg-red-500">
                <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-red-500 border-2 border-slate-100 dark:border-slate-900"></div>
            </div>
        </div>
    );
};

export const TimelineScheduler: React.FC<TimelineSchedulerProps> = ({ isOpen, onClose, onSave, date, currentSectionId, initialSections }) => {
  const [scheduledSections, setScheduledSections] = useState<PlannerSectionData[]>([]);
  const [unscheduledSections, setUnscheduledSections] = useState<PlannerSectionData[]>([]);
  const [notification, setNotification] = useState<{ id: number; message: string } | null>(null);
  const [snapIndicator, setSnapIndicator] = useState<{ top: number } | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [dropIndicator, setDropIndicator] = useState<number | null>(null);
  const prevIsOpen = useRef(isOpen);

  const isToday = new Date().toDateString() === date.toDateString();

  const dragState = useRef<{
    sectionId: string;
    type: 'move' | 'resizeTop' | 'resizeBottom' | 'new';
    initialY: number;
    initialStart?: number;
    initialEnd?: number;
    ghostElement?: HTMLElement;
  } | null>(null);

  useEffect(() => {
    const scheduled = initialSections.filter(s => s.startTime && s.endTime);
    const unscheduled = initialSections.filter(s => !s.startTime || !s.endTime);
    setScheduledSections(scheduled.sort((a,b) => timeToMinutes(a.startTime!)! - timeToMinutes(b.startTime!)!));
    setUnscheduledSections(unscheduled);
  }, [initialSections]);

  useEffect(() => {
    // Only scroll into view when the scheduler *opens*, not on every update during dragging.
    if (isOpen && !prevIsOpen.current && timelineRef.current) {
        let scrollToPos = 0;
        if (isToday) {
            const now = new Date();
            const minutesFromTimelineStart = now.getHours() * 60 + now.getMinutes() - (TIMELINE_START_HOUR * 60);
            if (minutesFromTimelineStart > 0) {
                scrollToPos = (minutesFromTimelineStart / 60) * HOUR_HEIGHT - HOUR_HEIGHT * 2; // Center it a bit
            }
        } else {
            const currentScheduled = scheduledSections.find(s => s.id === currentSectionId);
            if (currentScheduled?.startTime) {
                const startMinutes = timeToMinutes(currentScheduled.startTime);
                if (startMinutes !== null) {
                    scrollToPos = ((startMinutes - TIMELINE_START_HOUR * 60) / 60) * HOUR_HEIGHT - HOUR_HEIGHT;
                }
            }
        }
        timelineRef.current.scrollTo({ top: Math.max(0, scrollToPos), behavior: 'smooth' });
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, isToday, currentSectionId, scheduledSections]);

  const showNotification = useCallback((message: string) => {
    const newId = Date.now();
    setNotification({ id: newId, message });
    setTimeout(() => {
      setNotification(prev => (prev?.id === newId ? null : prev));
    }, 3000);
  }, []);

  const updateAndResolveConflicts = useCallback((
    updatedSections: PlannerSectionData[],
    activeSectionId: string,
    type: 'move' | 'resizeTop' | 'resizeBottom'
  ) => {
      let newSections = JSON.parse(JSON.stringify(updatedSections));
      const activeSection = newSections.find((s: PlannerSectionData) => s.id === activeSectionId);
      if (!activeSection) return updatedSections;
      
      let newStart = timeToMinutes(activeSection.startTime!)!;
      let newEnd = timeToMinutes(activeSection.endTime!)!;

      const timelineStartMinutes = TIMELINE_START_HOUR * 60;
      const timelineEndMinutes = TIMELINE_END_HOUR * 60;
      const duration = newEnd - newStart;

      if (newStart < timelineStartMinutes) {
          newStart = timelineStartMinutes;
          if (type === 'move') newEnd = newStart + duration;
      }
      if (newEnd > timelineEndMinutes) {
          newEnd = timelineEndMinutes;
          if (type === 'move') newStart = newEnd - duration;
      }
      
      if (newEnd - newStart < MIN_DURATION) {
          if (type === 'resizeTop') newStart = newEnd - MIN_DURATION;
          else newEnd = newStart + MIN_DURATION;
      }
      
      activeSection.startTime = minutesToTime(newStart);
      activeSection.endTime = minutesToTime(newEnd);

      // Run conflict resolution for all adjustment types
      let iterations = 0;
      let wasChangedInLoop;
      do {
        wasChangedInLoop = false;
        iterations++;
        newSections.sort((a: any, b: any) => (timeToMinutes(a.startTime!) ?? Infinity) - (timeToMinutes(b.startTime!) ?? Infinity));

        for (let i = 0; i < newSections.length - 1; i++) {
          const current = newSections[i];
          const next = newSections[i + 1];

          if (!current.startTime || !current.endTime || !next.startTime || !next.endTime) continue;
          
          const currentEnd = timeToMinutes(current.endTime)!;
          const nextStart = timeToMinutes(next.startTime)!;

          if (currentEnd > nextStart) {
            const nextDuration = timeToMinutes(next.endTime)! - nextStart;
            next.startTime = minutesToTime(currentEnd);
            next.endTime = minutesToTime(currentEnd + nextDuration);
            wasChangedInLoop = true;
          }
        }
      } while (wasChangedInLoop && iterations < newSections.length);
      if (wasChangedInLoop) showNotification(`Overlapping times were automatically adjusted.`);

      setScheduledSections(newSections.sort((a: any, b: any) => (timeToMinutes(a.startTime!) ?? Infinity) - (timeToMinutes(b.startTime!) ?? Infinity)));
  }, [showNotification]);

  const handlePointerDown = (e: React.PointerEvent, sectionId: string, type: 'move' | 'resizeTop' | 'resizeBottom') => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const section = scheduledSections.find(s => s.id === sectionId);
    if (!section || !section.startTime || !section.endTime) return;

    dragState.current = {
      sectionId, type, initialY: e.clientY,
      initialStart: timeToMinutes(section.startTime)!,
      initialEnd: timeToMinutes(section.endTime)!,
    };
    document.body.style.cursor = type === 'move' ? 'grabbing' : 'ns-resize';
  };

  const handleUnscheduledDragStart = (e: React.PointerEvent, sectionId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    const rect = target.getBoundingClientRect();

    const ghost = target.cloneNode(true) as HTMLElement;
    ghost.style.position = 'absolute';
    ghost.style.left = `${rect.left}px`;
    ghost.style.top = `${rect.top}px`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.opacity = '0.8';
    ghost.style.pointerEvents = 'none';
    ghost.style.zIndex = '100';
    document.body.appendChild(ghost);
    
    dragState.current = { sectionId, type: 'new', initialY: e.clientY, ghostElement: ghost };
    document.body.style.cursor = 'grabbing';
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current) return;
    e.preventDefault(); e.stopPropagation();

    const { type, initialY } = dragState.current;
    const deltaY = e.clientY - initialY;
    
    if (type === 'new') {
      if(dragState.current.ghostElement) {
        dragState.current.ghostElement.style.transform = `translateY(${deltaY}px)`;
      }
      if (timelineRef.current) {
        const timelineRect = timelineRef.current.getBoundingClientRect();
        if (e.clientY > timelineRect.top && e.clientY < timelineRect.bottom) {
          const relativeY = e.clientY - timelineRect.top + timelineRef.current.scrollTop;
          const minutes = (relativeY / HOUR_HEIGHT) * 60;
          const snappedMinutes = Math.round(minutes / 15) * 15;
          setDropIndicator(((snappedMinutes / 60) * HOUR_HEIGHT));
        } else {
          setDropIndicator(null);
        }
      }
      return;
    }

    const { sectionId, initialStart, initialEnd } = dragState.current;
    const deltaMinutes = (deltaY / HOUR_HEIGHT) * 60;
    
    setScheduledSections(currentSections => {
      const newSections = JSON.parse(JSON.stringify(currentSections));
      const activeSection = newSections.find((s: PlannerSectionData) => s.id === sectionId);
      if (!activeSection) return currentSections;
      
      let newStart = initialStart!;
      let newEnd = initialEnd!;

      if (type === 'move') {
        newStart += deltaMinutes;
        newEnd += deltaMinutes;
      } else if (type === 'resizeTop') {
        newStart += deltaMinutes;
      } else if (type === 'resizeBottom') {
        newEnd += deltaMinutes;
      }
      
      const snapPoints = scheduledSections
        .filter(s => s.id !== sectionId && s.startTime && s.endTime)
        .flatMap(s => [timeToMinutes(s.startTime!)!, timeToMinutes(s.endTime!)!]);
        
      let activeSnap: { top: number } | null = null;
      
      const findSnap = (targetMinute: number) => {
          for (const point of snapPoints) {
              if (Math.abs(targetMinute - point) <= SNAP_SENSITIVITY_MINUTES) {
                  return point;
              }
          }
          return null;
      };

      if (type === 'move' || type === 'resizeTop') {
          const snappedStart = findSnap(newStart);
          if (snappedStart !== null) {
              const duration = newEnd - newStart;
              newStart = snappedStart;
              if (type === 'move') newEnd = newStart + duration;
              activeSnap = { top: ((snappedStart - TIMELINE_START_HOUR * 60) / 60) * HOUR_HEIGHT };
          }
      }
      if (!activeSnap && (type === 'move' || type === 'resizeBottom')) {
          const snappedEnd = findSnap(newEnd);
          if (snappedEnd !== null) {
              const duration = newEnd - newStart;
              newEnd = snappedEnd;
              if (type === 'move') newStart = newEnd - duration;
              activeSnap = { top: ((snappedEnd - TIMELINE_START_HOUR * 60) / 60) * HOUR_HEIGHT };
          }
      }
      setSnapIndicator(activeSnap);

      if (newEnd - newStart < MIN_DURATION) {
        if (type === 'resizeTop') newStart = newEnd - MIN_DURATION;
        else newEnd = newStart + MIN_DURATION;
      }

      activeSection.startTime = minutesToTime(newStart);
      activeSection.endTime = minutesToTime(newEnd);
      return newSections;
    });
    
  }, [scheduledSections]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragState.current) return;

    const roundToNearest = (num: number, interval: number) => Math.round(num / interval) * interval;

    const finalSections = JSON.parse(JSON.stringify(scheduledSections));
    const activeSection = finalSections.find((s: PlannerSectionData) => s.id === dragState.current?.sectionId);
    
    if(activeSection) {
        let start = timeToMinutes(activeSection.startTime!)!;
        let end = timeToMinutes(activeSection.endTime!)!;
        
        let roundedStart = roundToNearest(start, 15);
        let roundedEnd = roundToNearest(end, 15);
        
        if (roundedEnd - roundedStart < MIN_DURATION) {
            roundedEnd = roundedStart + MIN_DURATION;
        }

        activeSection.startTime = minutesToTime(roundedStart);
        activeSection.endTime = minutesToTime(roundedEnd);
    }
    setScheduledSections(finalSections);


    if (dragState.current.type === 'new') {
        if (dragState.current.ghostElement) {
            document.body.removeChild(dragState.current.ghostElement);
        }
        if (dropIndicator !== null && timelineRef.current) {
            const startMinutes = (dropIndicator / HOUR_HEIGHT) * 60 + (TIMELINE_START_HOUR * 60);
            const endMinutes = startMinutes + 60;
            
            const sectionId = dragState.current.sectionId;
            const sectionToSchedule = unscheduledSections.find(s => s.id === sectionId)!;
            
            sectionToSchedule.startTime = minutesToTime(roundToNearest(startMinutes,15));
            sectionToSchedule.endTime = minutesToTime(roundToNearest(endMinutes,15));

            const newScheduled = [...finalSections, sectionToSchedule];
            const newUnscheduled = unscheduledSections.filter(s => s.id !== sectionId);

            setUnscheduledSections(newUnscheduled);
            updateAndResolveConflicts(newScheduled, sectionId, 'move');
        }
        setDropIndicator(null);
    } else {
      updateAndResolveConflicts(finalSections, dragState.current.sectionId, dragState.current.type as any);
      setSnapIndicator(null);
    }

    dragState.current = null;
    document.body.style.cursor = 'default';
  }, [dragState, dropIndicator, scheduledSections, unscheduledSections, updateAndResolveConflicts]);
  
  const handleSave = () => {
    const finalSections = [...scheduledSections, ...unscheduledSections];
    onSave(finalSections);
  };
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-100 dark:bg-slate-900 flex flex-col"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      role="dialog" aria-modal="true" aria-labelledby="scheduler-title"
    >
      <header className="flex-shrink-0 bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-sm">
        <h2 id="scheduler-title" className="text-lg font-bold text-slate-900 dark:text-white">Schedule Your Day</h2>
        <div className="flex gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Save Schedule</button>
        </div>
      </header>
      
      {unscheduledSections.length > 0 && (
          <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Drag to Schedule</h3>
            <div className="flex flex-wrap gap-2">
                {unscheduledSections.map(section => (
                    <div
                        key={section.id}
                        onPointerDown={e => handleUnscheduledDragStart(e, section.id)}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium shadow-sm cursor-grab transition-colors ${section.id === currentSectionId ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                        style={{touchAction: 'none'}}
                    >
                       <GripVerticalIcon className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500" />
                        {section.icon} <span className="ml-1.5">{section.title}</span>
                    </div>
                ))}
            </div>
        </div>
      )}

      {notification && <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 p-3 bg-slate-900 text-white rounded-lg shadow-lg animate-fade-in-out" role="alert"><div className="flex items-center"><InfoIcon className="w-5 h-5 mr-2 text-indigo-400" /><span>{notification.message}</span></div></div>}

      <main className="flex-grow overflow-hidden relative">
        <div ref={timelineRef} className="h-full overflow-y-auto">
          <div className="relative" style={{ height: (TOTAL_MINUTES / 60) * HOUR_HEIGHT }}>
            {Array.from({ length: TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1 }).map((_, i) => {
              const hour = TIMELINE_START_HOUR + i;
              if (hour > TIMELINE_END_HOUR) return null;
              return (
                <React.Fragment key={hour}>
                    <div className="absolute w-full flex items-center" style={{ top: i * HOUR_HEIGHT }}>
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 w-12 text-right pr-2" aria-hidden="true">{formatTime(`${hour.toString().padStart(2, '0')}:00`)}</span>
                        <div className="flex-grow h-px bg-slate-200 dark:bg-slate-700"></div>
                    </div>
                    {hour < TIMELINE_END_HOUR && (
                         <div className="absolute w-full flex items-center" style={{ top: i * HOUR_HEIGHT + (HOUR_HEIGHT / 2) }}>
                            <div className="w-12"></div>
                            <div className="flex-grow border-t border-dashed border-slate-200 dark:border-slate-700/60"></div>
                        </div>
                    )}
                </React.Fragment>
              );
            })}
            
            {dropIndicator !== null && (
                <div className="absolute left-12 right-0 h-[1px] bg-indigo-500 dark:bg-indigo-400 z-30 pointer-events-none transition-all duration-75" style={{top: dropIndicator}}>
                     <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400"></div>
                </div>
            )}
            
            {snapIndicator && (
                 <div className="absolute left-12 right-0 h-px border-t border-dashed border-indigo-500 dark:border-indigo-400 z-30 pointer-events-none" style={{ top: snapIndicator.top }}></div>
            )}

            <CurrentTimeIndicator isToday={isToday} />

            {scheduledSections.map(section => {
              const startMinutes = timeToMinutes(section.startTime!);
              const endMinutes = timeToMinutes(section.endTime!);
              if (startMinutes === null || endMinutes === null) return null;

              const top = ((startMinutes - TIMELINE_START_HOUR * 60) / 60) * HOUR_HEIGHT;
              const height = Math.max(((endMinutes - startMinutes) / 60) * HOUR_HEIGHT, MIN_DURATION/60*HOUR_HEIGHT);
              
              const isCurrent = section.id === currentSectionId;
              const isDragging = dragState.current?.sectionId === section.id;
              const color = section.color || 'slate';
              const styles = colorStyles[color as keyof typeof colorStyles] || colorStyles.slate;

              const blockClasses = isCurrent
                ? 'bg-indigo-500 text-white shadow-lg z-20 border-transparent'
                : `${styles.base} ${styles.text} shadow-md z-10 hover:shadow-lg border`;
              
              const handleClasses = isCurrent
                ? 'bg-white/40 group-hover/handle:bg-white/80'
                : styles.handle;
              
              return (
                <div
                  key={section.id}
                  onPointerDown={(e) => handlePointerDown(e, section.id, 'move')}
                  className={`absolute left-12 right-0 p-2 rounded-lg flex flex-col justify-between overflow-hidden transition-all duration-100 group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 ${blockClasses} ${isDragging ? 'opacity-90 scale-[1.02] shadow-2xl' : ''}`}
                  style={{ top, height, touchAction: 'none' }}
                  tabIndex={0}
                >
                  <div>
                    <p className="font-bold text-sm truncate">{section.icon} {section.title}</p>
                    <p className="text-xs opacity-80">{formatTime(section.startTime)} - {formatTime(section.endTime)}</p>
                  </div>
                    <div onPointerDown={(e) => handlePointerDown(e, section.id, 'resizeTop')} className="absolute -top-1 left-0 w-full h-4 cursor-ns-resize flex justify-center items-start pt-1 group/handle opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"><div className={`w-10 h-1.5 rounded-full transition-colors duration-150 group-focus/handle:ring-2 ring-white ${handleClasses}`}></div></div>
                    <div onPointerDown={(e) => handlePointerDown(e, section.id, 'resizeBottom')} className="absolute -bottom-1 left-0 w-full h-4 cursor-ns-resize flex justify-center items-end pb-1 group/handle opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"><div className={`w-10 h-1.5 rounded-full transition-colors duration-150 group-focus/handle:ring-2 ring-white ${handleClasses}`}></div></div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
