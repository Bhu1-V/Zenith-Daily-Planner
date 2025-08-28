import React, { useState } from 'react';
import { ChevronDownIcon, InfoIcon } from './icons';

export const HelpSection: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg ring-1 ring-indigo-200 dark:ring-indigo-500/30">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-indigo-800 dark:text-indigo-300 focus:outline-none"
                aria-expanded={isOpen}
            >
                <div className="flex items-center">
                    <InfoIcon className="w-5 h-5 mr-2" />
                    <span>How to Use This Planner</span>
                </div>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="px-4 pb-4 text-indigo-700 dark:text-indigo-300/90">
                    <ul className="space-y-2 list-disc list-inside">
                        <li>
                            <strong>Fill it out the night before.</strong> This takes 5 minutes and sets your next day up for success.
                        </li>
                        <li>
                            <strong>Focus on starting, not finishing.</strong> Your only job is to start the next action.
                        </li>
                        <li>
                            <strong>It’s a guide, not a rulebook.</strong> If you miss something, just move on to the next block. Progress over perfection!
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};