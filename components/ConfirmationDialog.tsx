import React from 'react';
import { AlertIcon } from './icons';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm transform transition-all animate-slide-in-up">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/40">
              <AlertIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 id="confirm-dialog-title" className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-end space-x-3 rounded-b-xl">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-slate-800"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};
