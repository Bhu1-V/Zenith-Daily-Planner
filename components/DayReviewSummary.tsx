import React from 'react';
import { DayReview } from '../types';
import { TrophyIcon } from './icons';

interface DayReviewSummaryProps {
  review: DayReview;
}

const ProductivityMeter: React.FC<{ label: string; value: number }> = ({ label, value }) => {
    const valueColorClass = value >= 80 ? 'text-emerald-500' : value >= 50 ? 'text-amber-500' : 'text-rose-500';
    return (
        <div>
            <div className="flex justify-between items-baseline">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
                <p className={`text-lg font-bold ${valueColorClass}`}>{value}%</p>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1">
                <div 
                    className={`h-2 rounded-full ${valueColorClass.replace('text-', 'bg-')}`} 
                    style={{ width: `${value}%` }}
                ></div>
            </div>
        </div>
    );
};


export const DayReviewSummary: React.FC<DayReviewSummaryProps> = ({ review }) => {
  return (
    <section className="bg-slate-50 dark:bg-slate-800/50 rounded-lg ring-1 ring-slate-200 dark:ring-slate-700">
      <div className="p-5 sm:p-6">
        <div className="flex items-center">
          <TrophyIcon className="w-6 h-6 mr-3 text-amber-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Day's Summary</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <ProductivityMeter label="Signal Productivity" value={review.signalProductivity} />
            <ProductivityMeter label="Absolute Productivity" value={review.absoluteProductivity} />
        </div>
        {review.note && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Your note:</p>
                <blockquote className="text-slate-700 dark:text-slate-300 italic border-l-4 border-slate-300 dark:border-slate-600 pl-4 py-1">
                    {review.note}
                </blockquote>
            </div>
        )}
      </div>
    </section>
  );
};
