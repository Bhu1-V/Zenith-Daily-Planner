import React from 'react';
import { Task, ItemType } from '../types';
import { TrashIcon, StarIcon } from './icons';

interface TaskItemProps {
  task: Task;
  isConfirmed: boolean;
  isLocked: boolean;
  onUpdate: (field: string, value: any) => void;
  onRemove?: () => void;
  onToggleSignal?: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, isConfirmed, isLocked, onUpdate, onRemove, onToggleSignal }) => {
  const readOnlyStyles = "readOnly:bg-slate-50 readOnly:text-slate-500 dark:readOnly:bg-slate-800/50 dark:readOnly:text-slate-400 readOnly:cursor-not-allowed readOnly:border-slate-200 dark:readOnly:border-slate-700";

  const renderTask = () => {
    switch (task.type) {
      case ItemType.CHECKBOX:
        return (
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={task.checked}
              disabled={!isConfirmed || isLocked}
              onChange={(e) => onUpdate('checked', e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900 dark:checked:bg-indigo-500 dark:focus:ring-indigo-600 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-labelledby={`task-label-${task.id}`}
            />
            <input
                id={`task-label-${task.id}`}
                type="text"
                value={task.label}
                readOnly={isConfirmed}
                onChange={(e) => onUpdate('label', e.target.value)}
                placeholder="New task..."
                className={`flex-grow bg-transparent focus:outline-none focus:ring-0 border-none p-0 text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 sm:text-sm ${isConfirmed ? 'cursor-not-allowed' : ''}`}
            />
          </div>
        );
      case ItemType.TEXT_SHORT:
        return (
            <div>
                 <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{task.label}</label>
                <input
                  type="text"
                  value={task.value}
                  readOnly={!isConfirmed || isLocked}
                  onChange={(e) => onUpdate('value', e.target.value)}
                  placeholder="..."
                  className={`w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-900 ${readOnlyStyles}`}
                />
            </div>
        );
      case ItemType.TEXT_LONG:
        return (
            <div>
                 <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{task.label}</label>
                <textarea
                  value={task.value}
                  readOnly={!isConfirmed || isLocked}
                  onChange={(e) => onUpdate('value', e.target.value)}
                  placeholder="Your thoughts..."
                  rows={2}
                  className={`w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-900 ${readOnlyStyles}`}
                />
            </div>
        );
      case ItemType.CHECKBOX_WITH_TEXT:
        return (
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={task.checked}
              disabled={!isConfirmed || isLocked}
              onChange={(e) => onUpdate('checked', e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 mt-1 dark:bg-slate-900 dark:checked:bg-indigo-500 dark:focus:ring-indigo-600 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex-1">
                 <label className="block text-sm font-medium text-slate-600 dark:text-slate-400">{task.label}</label>
                <input
                  type="text"
                  value={task.value}
                  readOnly={!isConfirmed || isLocked}
                  onChange={(e) => onUpdate('value', e.target.value)}
                  className={`w-full p-1 border-b border-slate-300 dark:border-slate-600 focus:ring-0 focus:border-indigo-500 sm:text-sm bg-transparent ${readOnlyStyles}`}
                />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="group flex items-center justify-between p-2 rounded-md hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
        <div className="flex-grow mr-2">
            {renderTask()}
        </div>
        <div className="flex-shrink-0 flex items-center space-x-1">
            {!isConfirmed && onToggleSignal && (
                 <button
                    onClick={onToggleSignal}
                    aria-label={task.isSignal ? "Remove from signals" : "Add to signals"}
                    className={`p-1.5 rounded-full text-amber-500 opacity-0 group-hover:opacity-100 hover:bg-amber-100 dark:hover:bg-amber-900/30 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-opacity ${task.isSignal ? 'opacity-100' : ''}`}
                 >
                     <StarIcon filled={!!task.isSignal} className="w-5 h-5" />
                 </button>
            )}
            {!isConfirmed && onRemove && (
                <button
                    onClick={onRemove}
                    aria-label="Remove task"
                    className="flex-shrink-0 p-1.5 rounded-full text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-opacity"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    </div>
  );
};