import React from 'react';
import { UniversalTrackers } from '../types';

interface UniversalTrackerProps {
  trackers: UniversalTrackers;
  isConfirmed: boolean;
  isLocked: boolean;
  onUpdateTracker: <K extends keyof UniversalTrackers>(field: K, value: UniversalTrackers[K]) => void;
}

const UrgeCounter: React.FC<{ count: number; setCount: (count: number) => void; disabled: boolean }> = ({ count, setCount, disabled }) => {
    return (
      <div className="flex items-center space-x-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            disabled={disabled}
            onClick={() => setCount(i + 1 === count ? i : i + 1)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              i < count 
              ? 'bg-indigo-600 border-indigo-700 dark:bg-indigo-500 dark:border-indigo-600' 
              : 'bg-slate-200 border-slate-300 hover:bg-indigo-100 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600'
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-200 dark:disabled:hover:bg-slate-700`}
          />
        ))}
        <span className="text-slate-600 dark:text-slate-400 font-medium">{count} / 5</span>
      </div>
    );
};


export const UniversalTracker: React.FC<UniversalTrackerProps> = ({ trackers, isConfirmed, isLocked, onUpdateTracker }) => {
  const readOnlyStyles = "readOnly:bg-slate-50 readOnly:text-slate-500 dark:readOnly:bg-slate-800/50 dark:readOnly:text-slate-400 readOnly:cursor-not-allowed readOnly:border-slate-200 dark:readOnly:border-slate-700";

  return (
    <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
      <div className="p-5 sm:p-6">
        <div className="flex items-center">
          <span className="text-2xl mr-3">✨</span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Universal Systems Tracker</h2>
        </div>
        <div className="mt-4 space-y-6">
          {/* Stop Smoking */}
          <div className="p-2 rounded-md">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">System #5 (Stop Smoking)</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-1">IF I feel an urge, THEN I will drink a glass of water and open my tracking app.</p>
            <div className="mt-3">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Urges successfully managed today:</p>
                <UrgeCounter count={trackers.urges} setCount={(c) => onUpdateTracker('urges', c)} disabled={!isConfirmed || isLocked} />
            </div>
          </div>

          {/* Save/Invest Money */}
          <div className="p-2 rounded-md">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">System #4 (Save/Invest Money)</h3>
            <label className={`flex items-center space-x-3 group mt-2 ${!isConfirmed || isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                checked={trackers.paydayChecked}
                disabled={!isConfirmed || isLocked}
                onChange={(e) => onUpdateTracker('paydayChecked', e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900 dark:checked:bg-indigo-500 dark:focus:ring-indigo-600 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className={`text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors ${!isConfirmed || isLocked ? 'opacity-50' : ''}`}>Is it the day after payday? If yes, check that your automatic transfer/investment went through.</span>
            </label>
          </div>

          {/* Daily Win */}
          <div className="p-2 rounded-md">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Daily Win</h3>
            <div>
                 <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">What is one thing that went well today?</label>
                <textarea
                  value={trackers.dailyWin}
                  readOnly={!isConfirmed || isLocked}
                  onChange={(e) => onUpdateTracker('dailyWin', e.target.value)}
                  placeholder="Celebrate your progress!"
                  rows={2}
                  className={`w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-900 ${readOnlyStyles}`}
                />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};