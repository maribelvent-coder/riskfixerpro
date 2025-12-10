import { useState } from 'react';
import { cn } from '@/lib/utils';

export type AssessmentTab = 'interview' | 'risk-profile' | 'reports' | 'photos' | 'settings';

interface TabNavigationProps {
  activeTab: AssessmentTab;
  onTabChange: (tab: AssessmentTab) => void;
  interviewProgress?: number;
  hasRiskData?: boolean;
  reportCount?: number;
  photoCount?: number;
}

const TABS: { id: AssessmentTab; label: string; icon?: string }[] = [
  { id: 'interview', label: 'Interview' },
  { id: 'risk-profile', label: 'Risk Profile' },
  { id: 'reports', label: 'Reports' },
  { id: 'photos', label: 'Photos' },
  { id: 'settings', label: 'Settings' },
];

export function TabNavigation({
  activeTab,
  onTabChange,
  interviewProgress = 0,
  hasRiskData = false,
  reportCount = 0,
  photoCount = 0,
}: TabNavigationProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="flex space-x-8 px-6" aria-label="Assessment tabs">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          
          let badge = null;
          if (tab.id === 'interview' && interviewProgress > 0 && interviewProgress < 100) {
            badge = <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full">{interviewProgress}%</span>;
          } else if (tab.id === 'risk-profile' && !hasRiskData) {
            badge = <span className="ml-2 text-xs bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded-full">No data</span>;
          } else if (tab.id === 'reports' && reportCount > 0) {
            badge = <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded-full">{reportCount}</span>;
          } else if (tab.id === 'photos' && photoCount > 0) {
            badge = <span className="ml-2 text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 px-2 py-0.5 rounded-full">{photoCount}</span>;
          }
          
          return (
            <button
              key={tab.id}
              data-testid={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                isActive
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
              )}
            >
              {tab.label}
              {badge}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
