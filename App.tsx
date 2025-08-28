import React, { useState } from 'react';
import usePlannerData from './hooks/usePlannerData';
import Planner from './components/Planner';
import { DayReviewModal } from './components/DayReviewModal';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { HelpSection } from './components/HelpSection';
import { DatePicker } from './components/DatePicker';
import { CheckCircleIcon, ResetIcon, CheckIcon } from './components/icons';
import { CheckboxTask, CheckboxWithTextTask } from './types';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [productivityScores, setProductivityScores] = useState({ signal: 0, absolute: 0 });

  const { dailyPlan, updateTask, updateTracker, addTask, removeTask, isLoading, confirmCurrentPlan, addSection, removeSection, updateSection, updateAllSections, updateDayReview, resetDayReview, saveStatus } = usePlannerData(currentDate);

  const goToNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    setCurrentDate(nextDay);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  const handleReviewAndPlanNextDay = () => {
    if (!dailyPlan) return;

    const checkableTasks = dailyPlan.sections
      .flatMap(s => s.tasks)
      .filter(t => 'checked' in t) as (CheckboxTask | CheckboxWithTextTask)[];
    
    const totalTasks = checkableTasks.length;
    const completedTasks = checkableTasks.filter(t => t.checked).length;
    const absolute = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const signalTasks = checkableTasks.filter(t => t.isSignal);
    const totalSignalTasks = signalTasks.length;
    const completedSignalTasks = signalTasks.filter(t => t.checked).length;
    const signal = totalSignalTasks > 0 ? Math.round((completedSignalTasks / totalSignalTasks) * 100) : 0;
    
    setProductivityScores({ signal, absolute });
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = (note: string) => {
    updateDayReview({
      signalProductivity: productivityScores.signal,
      absoluteProductivity: productivityScores.absolute,
      note,
    });
    setIsReviewModalOpen(false);
    goToNextDay();
  };

  const handleResetDay = () => {
    setIsConfirmResetOpen(true);
  };

  const handleConfirmReset = () => {
    resetDayReview();
    setIsConfirmResetOpen(false);
  };

  const isLocked = !!dailyPlan?.review;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
        <p className="text-xl font-medium">Loading Planner...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200">
      <main className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white text-center tracking-tight">Zenith Planner</h1>
          <DatePicker 
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            goToToday={goToToday}
          />
        </header>

        <HelpSection />

        {dailyPlan && (
            <Planner 
                plan={dailyPlan}
                date={currentDate}
                isConfirmed={dailyPlan.isConfirmed}
                isLocked={isLocked}
                onUpdateTask={updateTask} 
                onUpdateTracker={updateTracker}
                onAddTask={addTask}
                onRemoveTask={removeTask}
                onAddSection={addSection}
                onRemoveSection={removeSection}
                onUpdateSection={updateSection}
                onUpdateAllSections={updateAllSections}
            />
        )}

        <div className="mt-10 mb-6">
            {dailyPlan && isLocked ? (
                <button
                    onClick={handleResetDay}
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-slate-900 transition-transform transform hover:scale-105"
                >
                    <ResetIcon className="w-6 h-6 mr-3" />
                    Reset Day
                </button>
            ) : dailyPlan && !dailyPlan.isConfirmed ? (
                 <button
                    onClick={confirmCurrentPlan}
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 transition-transform transform hover:scale-105"
                    >
                    <CheckCircleIcon className="w-6 h-6 mr-3" />
                    Confirm & Start Day
                </button>
            ) : dailyPlan && dailyPlan.isConfirmed ? (
                <button
                    onClick={handleReviewAndPlanNextDay}
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-900"
                    >
                    Review & Plan Next Day
                </button>
            ) : null}
        </div>
      </main>
      <footer className="text-center p-4 text-slate-500 dark:text-slate-400 text-sm relative">
        <p>Progress over perfection. You've got this.</p>
         <div className="absolute bottom-4 right-4 h-5">
            {saveStatus === 'saving' && (
                <p className="text-xs text-slate-400 dark:text-slate-500 animate-pulse">Saving...</p>
            )}
            {saveStatus === 'saved' && (
                <p className="flex items-center text-xs text-emerald-600 dark:text-emerald-500">
                    <CheckIcon className="w-4 h-4 mr-1"/> Saved
                </p>
            )}
        </div>
      </footer>
      
      {dailyPlan && (
        <DayReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            onSave={handleSaveReview}
            signalProductivity={productivityScores.signal}
            absoluteProductivity={productivityScores.absolute}
        />
      )}

      <ConfirmationDialog
        isOpen={isConfirmResetOpen}
        onClose={() => setIsConfirmResetOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset This Day?"
        message="Are you sure you want to reset this day's plan? All review data will be lost and the tasks will become editable again."
        confirmButtonText="Yes, Reset Day"
       />
    </div>
  );
};

export default App;