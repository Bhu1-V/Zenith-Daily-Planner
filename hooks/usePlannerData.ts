import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DailyPlan, PlannerData, Task, UniversalTrackers, ItemType, CheckboxTask, TextTask, PlannerSectionData, DayReview } from '../types';
import { getWeekdayTemplate, getWeekendTemplate, getDefaultTrackers, COLOR_PALETTE } from '../constants';

const formatDateToKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Creates a new plan for a given day by cloning an existing plan's structure
 * and resetting all daily progress (checkboxes, trackers, etc.).
 * @param sourcePlan The plan to copy the structure from.
 * @param newDateKey The 'YYYY-MM-DD' key for the new plan.
 * @returns A fresh DailyPlan object for the new day.
 */
const cloneAndResetPlan = (sourcePlan: DailyPlan, newDateKey: string): DailyPlan => {
  const newPlan: DailyPlan = {
    ...JSON.parse(JSON.stringify(sourcePlan)),
    date: newDateKey,
    isConfirmed: false,
    trackers: getDefaultTrackers(), // Resets urges, paydayChecked, and dailyWin
    review: undefined, // Clear the review for the new day
    sections: sourcePlan.sections.map(section => ({
      ...section,
      id: uuidv4(),
      tasks: section.tasks.map(task => {
        const newTask = { ...task, id: uuidv4() };

        // Reset all checkboxes to unchecked
        if ('checked' in newTask) {
          (newTask as any).checked = false;
        }

        // Reset daily-specific text fields to blank, but keep other user-entered text
        if (
          (newTask.type === ItemType.TEXT_LONG && newTask.label.includes("ONE thing that makes today a win")) ||
          (newTask.type === ItemType.TEXT_SHORT && newTask.label.includes("e.g., Relax, Socialize, Learn"))
        ) {
          (newTask as TextTask).value = '';
        }

        return newTask;
      })
    }))
  };
  return newPlan;
};


const usePlannerData = (date: Date) => {
  const [plannerData, setPlannerData] = useState<PlannerData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');
  const isInitialLoadFinished = useRef(false);

  const dateKey = formatDateToKey(date);
  const dailyPlan = plannerData[dateKey];

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('zenithPlannerData');
      if (storedData) {
        setPlannerData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && !plannerData[dateKey]) {
      const previousDate = new Date(date);
      previousDate.setDate(date.getDate() - 1);
      const previousDateKey = formatDateToKey(previousDate);
      const previousDayPlan = plannerData[previousDateKey];

      let newPlan: DailyPlan;

      if (previousDayPlan) {
        // If there's a plan for the previous day, copy and reset it.
        newPlan = cloneAndResetPlan(previousDayPlan, dateKey);
      } else {
        // Otherwise, create a fresh plan from a template.
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        newPlan = {
          date: dateKey,
          isConfirmed: false,
          sections: isWeekend ? getWeekendTemplate() : getWeekdayTemplate(),
          trackers: getDefaultTrackers(),
        };
      }
      
      setPlannerData(prevData => ({ ...prevData, [dateKey]: newPlan }));
    }
  }, [date, dateKey, plannerData, isLoading]);

  // Debounced auto-save effect
  useEffect(() => {
    if (isLoading) {
      return; // Don't save while loading
    }
    
    // This effect runs after loading is complete and when plannerData changes.
    // We skip the very first run after loading to prevent a redundant save.
    if (!isInitialLoadFinished.current) {
        isInitialLoadFinished.current = true;
        return;
    }

    setSaveStatus('saving');

    const handler = setTimeout(() => {
      try {
        localStorage.setItem('zenithPlannerData', JSON.stringify(plannerData));
        setSaveStatus('saved');
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
        setSaveStatus('idle'); // Could be an 'error' state
      }
    }, 1000); // Debounce for 1 second

    return () => {
      clearTimeout(handler);
    };
  }, [plannerData, isLoading]);

  const updateTask = useCallback(<T extends Task, K extends keyof T>(
    sectionId: string,
    taskId: string,
    field: K,
    value: T[K]
  ) => {
    setPlannerData(prevData => {
      const currentPlan = prevData[dateKey];
      if (!currentPlan) return prevData;

      const newSections = currentPlan.sections.map(section => {
        if (section.id === sectionId) {
          const newTasks = section.tasks.map(task => {
            if (task.id === taskId) {
              return { ...task, [field]: value };
            }
            return task;
          });
          return { ...section, tasks: newTasks };
        }
        return section;
      });

      const newPlan = { ...currentPlan, sections: newSections };
      return { ...prevData, [dateKey]: newPlan };
    });
  }, [dateKey]);

  const updateTracker = useCallback(<K extends keyof UniversalTrackers>(
    field: K,
    value: UniversalTrackers[K]
  ) => {
    setPlannerData(prevData => {
      const newPlan = { ...prevData[dateKey] };
      newPlan.trackers = { ...newPlan.trackers, [field]: value };
      return { ...prevData, [dateKey]: newPlan };
    });
  }, [dateKey]);

    const updateSection = useCallback(<K extends keyof PlannerSectionData>(
    sectionId: string,
    field: K,
    value: PlannerSectionData[K]
  ) => {
    setPlannerData(prevData => {
      const currentPlan = prevData[dateKey];
      if (!currentPlan) return prevData;

      const newSections = currentPlan.sections.map(section => {
        if (section.id === sectionId) {
          return { ...section, [field]: value };
        }
        return section;
      });

      const newPlan = { ...currentPlan, sections: newSections };
      return { ...prevData, [dateKey]: newPlan };
    });
  }, [dateKey]);

  const updateAllSections = useCallback((newSections: PlannerSectionData[]) => {
    setPlannerData(prevData => {
      const currentPlan = prevData[dateKey];
      if (!currentPlan) return prevData;
      const newPlan = { ...currentPlan, sections: newSections };
      return { ...prevData, [dateKey]: newPlan };
    });
  }, [dateKey]);

  const addSection = useCallback(() => {
    setPlannerData(prevData => {
      const currentPlan = prevData[dateKey];
      if (!currentPlan) return prevData;

      const timeboxedSections = currentPlan.sections.filter(s => s.isTimeboxed !== false);
      const nextColor = COLOR_PALETTE[timeboxedSections.length % COLOR_PALETTE.length];

      const newSection: PlannerSectionData = {
        id: uuidv4(),
        title: 'New Section',
        icon: '📝',
        tasks: [],
        isTimeboxed: true,
        color: nextColor,
      };

      const newPlan = {
        ...currentPlan,
        sections: [...currentPlan.sections, newSection],
      };
      return { ...prevData, [dateKey]: newPlan };
    });
  }, [dateKey]);

  const removeSection = useCallback((sectionId: string) => {
    if (!window.confirm('Are you sure you want to delete this section and all its tasks?')) {
      return;
    }
    setPlannerData(prevData => {
      const currentPlan = prevData[dateKey];
      if (!currentPlan) return prevData;

      const newSections = currentPlan.sections.filter(s => s.id !== sectionId);

      const newPlan = { ...currentPlan, sections: newSections };
      return { ...prevData, [dateKey]: newPlan };
    });
  }, [dateKey]);

  const addTask = useCallback((sectionId: string) => {
    setPlannerData(prevData => {
      const currentPlan = prevData[dateKey];
      if (!currentPlan) return prevData;

      const newSections = currentPlan.sections.map(section => {
        if (section.id === sectionId) {
          const newTask: CheckboxTask = {
            id: uuidv4(),
            type: ItemType.CHECKBOX,
            label: '',
            checked: false,
          };
          return {
            ...section,
            tasks: [...section.tasks, newTask],
          };
        }
        return section;
      });

      const newPlan = { ...currentPlan, sections: newSections };
      return { ...prevData, [dateKey]: newPlan };
    });
  }, [dateKey]);

  const removeTask = useCallback((sectionId: string, taskId: string) => {
    setPlannerData(prevData => {
      const currentPlan = prevData[dateKey];
      if (!currentPlan) return prevData;

      const newSections = currentPlan.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            tasks: section.tasks.filter(t => t.id !== taskId),
          };
        }
        return section;
      });

      const newPlan = { ...currentPlan, sections: newSections };
      return { ...prevData, [dateKey]: newPlan };
    });
  }, [dateKey]);
  
  const confirmCurrentPlan = useCallback(() => {
    setPlannerData(prevData => {
      const currentPlan = prevData[dateKey];
      if (!currentPlan) return prevData;

      const newPlan = { ...currentPlan, isConfirmed: true };
      return { ...prevData, [dateKey]: newPlan };
    });
  }, [dateKey]);

  const updateDayReview = useCallback((review: DayReview) => {
      setPlannerData(prevData => {
        const currentPlan = prevData[dateKey];
        if (!currentPlan) return prevData;

        const newPlan = { ...currentPlan, review };
        return { ...prevData, [dateKey]: newPlan };
      });
  }, [dateKey]);

  const resetDayReview = useCallback(() => {
    setPlannerData(prevData => {
      const currentPlan = prevData[dateKey];
      if (!currentPlan) return prevData;

      const newPlan = { ...currentPlan };
      delete newPlan.review; // This removes the key from the object

      return { ...prevData, [dateKey]: newPlan };
    });
  }, [dateKey]);

  return { dailyPlan, updateTask, updateTracker, addTask, removeTask, isLoading, confirmCurrentPlan, addSection, removeSection, updateSection, updateAllSections, updateDayReview, resetDayReview, saveStatus };
};

// Mock uuid for environments where crypto is not available.
(window as any).uuidv4 = uuidv4;

export default usePlannerData;