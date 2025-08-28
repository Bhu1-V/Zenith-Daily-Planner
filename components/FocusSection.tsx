import React from 'react';
import { PlannerSectionData, Task } from '../types';
import { TaskItem } from './TaskItem';

interface SignalItem {
  task: Task;
  sectionId: string;
  sectionTitle: string;
}

interface FocusSectionProps {
  section: PlannerSectionData;
  isConfirmed: boolean;
  isLocked: boolean;
  onUpdateTask: <T extends Task, K extends keyof T>(sectionId: string, taskId:string, field: K, value: T[K]) => void;
  signalItems: SignalItem[];
}

export const FocusSection: React.FC<FocusSectionProps> = ({ section, isConfirmed, isLocked, onUpdateTask, signalItems }) => {
  return (
    <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
      <div className="p-5 sm:p-6">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{section.icon}</span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{section.title}</h2>
        </div>
        <div className="mt-4 space-y-4">
          {section.tasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              isConfirmed={isConfirmed}
              isLocked={isLocked}
              onUpdate={(field, value) => onUpdateTask(section.id, task.id, field as any, value)}
              // No onRemove prop is passed, making the task non-removable
            />
          ))}
          
          {signalItems.length > 0 && (
            <>
              <hr className="border-slate-200 dark:border-slate-700 my-6" />
              {signalItems.map(({ task, sectionId, sectionTitle }) => (
                <div key={task.id}>
                  <TaskItem 
                    task={task} 
                    isConfirmed={isConfirmed}
                    isLocked={isLocked}
                    onUpdate={(field, value) => onUpdateTask(sectionId, task.id, field as any, value)}
                    onToggleSignal={() => onUpdateTask(sectionId, task.id, 'isSignal' as any, !task.isSignal)}
                  />
                   <p className="text-xs text-slate-400 dark:text-slate-500 text-right mt-1 pr-2 italic">
                    From: {sectionTitle}
                  </p>
                </div>
              ))}
            </>
          )}

        </div>
      </div>
    </section>
  );
};