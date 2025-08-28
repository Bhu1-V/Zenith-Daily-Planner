import React from 'react';
import { DailyPlan, Task, UniversalTrackers, PlannerSectionData } from '../types';
import { PlannerSection } from './PlannerSection';
import { UniversalTracker } from './UniversalTracker';
import { PlusIcon } from './icons';
import { FocusSection } from './FocusSection';
import { DayReviewSummary } from './DayReviewSummary';

interface PlannerProps {
  plan: DailyPlan;
  date: Date;
  isConfirmed: boolean;
  isLocked: boolean;
  onUpdateTask: <T extends Task, K extends keyof T>(sectionId: string, taskId: string, field: K, value: T[K]) => void;
  onUpdateTracker: <K extends keyof UniversalTrackers>(field: K, value: UniversalTrackers[K]) => void;
  onAddTask: (sectionId: string) => void;
  onRemoveTask: (sectionId: string, taskId: string) => void;
  onAddSection: () => void;
  onRemoveSection: (sectionId: string) => void;
  onUpdateSection: <K extends keyof PlannerSectionData>(sectionId: string, field: K, value: PlannerSectionData[K]) => void;
  onUpdateAllSections: (sections: PlannerSectionData[]) => void;
}

const Planner: React.FC<PlannerProps> = ({ 
    plan, date, isConfirmed, isLocked, onUpdateTask, onUpdateTracker, 
    onAddTask, onRemoveTask, onAddSection, onRemoveSection, onUpdateSection, onUpdateAllSections
}) => {
  const focusSection = plan.sections.find(s => s.isTimeboxed === false);
  const regularSections = plan.sections.filter(s => s.isTimeboxed !== false);
  
  const signalItems = plan.sections
    .flatMap(section => 
      section.tasks
        .filter(task => task.isSignal)
        .map(task => ({
          task,
          sectionId: section.id,
          sectionTitle: section.title,
        }))
    );
  
  return (
    <div className="space-y-8">
      {plan.review && <DayReviewSummary review={plan.review} />}

      {focusSection && (
        <FocusSection 
          section={focusSection}
          isConfirmed={isConfirmed}
          isLocked={isLocked}
          onUpdateTask={onUpdateTask}
          signalItems={signalItems}
        />
      )}

      {regularSections.map(section => (
        <PlannerSection 
          key={section.id} 
          section={section}
          allSections={plan.sections}
          date={date}
          isConfirmed={isConfirmed}
          isLocked={isLocked}
          onUpdateTask={onUpdateTask}
          onAddTask={onAddTask}
          onRemoveTask={onRemoveTask}
          onRemoveSection={() => onRemoveSection(section.id)}
          onUpdateSection={(field, value) => onUpdateSection(section.id, field, value)}
          onUpdateAllSections={onUpdateAllSections}
        />
      ))}

      {!isConfirmed && (
        <div className="mt-6 flex justify-center">
            <button
              onClick={onAddSection}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-200 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 transition-colors"
              aria-label="Add new section"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add New Section
            </button>
        </div>
      )}

      <UniversalTracker 
        trackers={plan.trackers}
        isConfirmed={isConfirmed}
        isLocked={isLocked}
        onUpdateTracker={onUpdateTracker}
      />
    </div>
  );
};

export default Planner;