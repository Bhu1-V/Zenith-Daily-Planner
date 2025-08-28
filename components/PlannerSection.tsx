
import React, { useState } from 'react';
import { PlannerSectionData, Task } from '../types';
import { TaskItem } from './TaskItem';
import { TimelineScheduler } from './TimelineScheduler';
import { PlusIcon, TrashIcon, ClockIcon } from './icons';
import { formatTime, calculateDuration } from '../utils/time';

interface PlannerSectionProps {
  section: PlannerSectionData;
  allSections: PlannerSectionData[];
  date: Date;
  isConfirmed: boolean;
  isLocked: boolean;
  onUpdateTask: <T extends Task, K extends keyof T>(sectionId: string, taskId: string, field: K, value: T[K]) => void;
  onAddTask: (sectionId: string) => void;
  onRemoveTask: (sectionId: string, taskId: string) => void;
  onRemoveSection: () => void;
  onUpdateSection: (field: keyof PlannerSectionData, value: any) => void;
  onUpdateAllSections: (sections: PlannerSectionData[]) => void;
}

export const PlannerSection: React.FC<PlannerSectionProps> = ({ 
    section, allSections, date, isConfirmed, isLocked, onUpdateTask, onAddTask, onRemoveTask, onRemoveSection, onUpdateSection, onUpdateAllSections
}) => {
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);

  const handleSaveTime = (updatedTimeboxedSections: PlannerSectionData[]) => {
    const nonTimeboxedSections = allSections.filter(s => s.isTimeboxed === false);
    // Reconstruct the full list of sections in their original order if possible, or just combine them.
    // This simple combination should be fine as rendering order is based on filtering anyway.
    const newAllSections = [...nonTimeboxedSections, ...updatedTimeboxedSections];
    onUpdateAllSections(newAllSections);
    setIsSchedulerOpen(false);
  };

  const hasTime = section.startTime && section.endTime;
  const timeString = hasTime
    ? `${formatTime(section.startTime)} - ${formatTime(section.endTime)}`
    : 'Set Time';
  const durationString = calculateDuration(section.startTime, section.endTime);

  const isTimeboxed = section.isTimeboxed !== false;
  const color = section.color || 'slate';
  const borderClass = `border-l-4 border-${color}-300 dark:border-${color}-600`;

  return (
    <>
      <section className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 ${isTimeboxed ? borderClass : ''}`}>
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-700 group relative">
          <div className="flex items-start">
              <input 
                value={section.icon}
                readOnly={isConfirmed}
                onChange={(e) => onUpdateSection('icon', e.target.value)}
                maxLength={2}
                className={`w-10 flex-shrink-0 text-center text-2xl mr-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md ${isConfirmed ? 'cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                aria-label="Section icon"
              />
              <div className="flex-grow">
                  <input
                    value={section.title}
                    readOnly={isConfirmed}
                    onChange={(e) => onUpdateSection('title', e.target.value)}
                    placeholder="Section Title"
                    className={`text-xl font-bold text-slate-900 dark:text-white bg-transparent w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md p-1 -m-1 ${isConfirmed ? 'cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    aria-label="Section title"
                  />
                  {!isConfirmed ? (
                      <input
                          value={section.goal || ''}
                          onChange={(e) => onUpdateSection('goal', e.target.value)}
                          placeholder="Describe the goal of this section..."
                          className="text-sm text-slate-500 dark:text-slate-400 placeholder:italic italic mt-1 bg-transparent w-full focus:outline-none focus:ring-0 border-none p-1 -m-1"
                          aria-label="Section goal"
                      />
                  ) : (
                      section.goal && <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-1">{section.goal}</p>
                  )}
                  
                  {isTimeboxed && !isConfirmed ? (
                    <button
                        onClick={() => setIsSchedulerOpen(true)}
                        className="flex items-center space-x-2 mt-3 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1 -m-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label={`Set time for ${section.title}`}
                    >
                        <ClockIcon className="w-4 h-4 flex-shrink-0" />
                        <span className={`font-medium ${!hasTime ? 'italic' : ''}`}>{timeString}</span>
                        {durationString && <span className="text-slate-400 dark:text-slate-500 ml-2">({durationString})</span>}
                    </button>
                    ) : (
                        isTimeboxed && hasTime && (
                            <div className="flex items-center space-x-2 mt-3 text-sm text-slate-500 dark:text-slate-400">
                                <ClockIcon className="w-4 h-4 flex-shrink-0" />
                                <span className="font-medium">{timeString}</span>
                                {durationString && <span className="text-slate-400 dark:text-slate-500 ml-2">({durationString})</span>}
                            </div>
                        )
                    )}
              </div>
          </div>
          {!isConfirmed && (
              <button
                  onClick={onRemoveSection}
                  aria-label="Remove section"
                  className="absolute top-3 right-3 flex-shrink-0 p-1.5 rounded-full text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-opacity"
              >
                  <TrashIcon className="w-5 h-5" />
              </button>
          )}
        </div>
        <div className="p-5 sm:p-6">
          <div className="space-y-4">
            {section.tasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                isConfirmed={isConfirmed}
                isLocked={isLocked}
                onUpdate={(field, value) => onUpdateTask(section.id, task.id, field as any, value)}
                onRemove={() => onRemoveTask(section.id, task.id)}
                onToggleSignal={() => onUpdateTask(section.id, task.id, 'isSignal' as any, !task.isSignal)}
              />
            ))}
            {section.tasks.length === 0 && !isConfirmed && (
              <p className="text-sm text-center text-slate-400 dark:text-slate-500 py-4">This section is empty. Add a task to get started!</p>
            )}
          </div>
          {!isConfirmed && (
            <div className="mt-5 pt-5 border-t border-slate-200/80 dark:border-slate-700/50">
              <button
                onClick={() => onAddTask(section.id)}
                className="inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-semibold text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 transition-colors"
                aria-label={`Add task to ${section.title}`}
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Task
              </button>
            </div>
          )}
        </div>
      </section>
      
      {isTimeboxed && isSchedulerOpen && (
          <TimelineScheduler
              isOpen={isSchedulerOpen}
              onClose={() => setIsSchedulerOpen(false)}
              onSave={handleSaveTime}
              date={date}
              currentSectionId={section.id}
              initialSections={allSections.filter(s => s.isTimeboxed !== false)}
          />
      )}
    </>
  );
};