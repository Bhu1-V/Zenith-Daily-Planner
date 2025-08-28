import React, { useState, useEffect } from 'react';
import { Gauge } from './Gauge';

interface DayReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  signalProductivity: number;
  absoluteProductivity: number;
}

export const DayReviewModal: React.FC<DayReviewModalProps> = ({
  isOpen,
  onClose,
  onSave,
  signalProductivity,
  absoluteProductivity
}) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNote(''); // Reset note when modal opens
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }
  
  const handleSave = () => {
    onSave(note);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all animate-slide-in-up">
        <div className="p-6">
            <h2 id="review-modal-title" className="text-2xl font-bold text-center text-slate-900 dark:text-white">Day in Review</h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mt-1">Reflect on your progress.</p>

            <div className="flex justify-around my-8">
                <Gauge value={signalProductivity} label="Signal Productivity" />
                <Gauge value={absoluteProductivity} label="Absolute Productivity" />
            </div>

            <div>
                <label htmlFor="daily-note" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    A quick note for tomorrow:
                </label>
                <textarea
                    id="daily-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What went well? What could be better?"
                    rows={3}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-900"
                />
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
            onClick={handleSave}
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
