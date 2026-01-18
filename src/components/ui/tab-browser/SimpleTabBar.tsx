'use client';

import React from 'react';
import { useTabContext } from '@/context/TabContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SimpleTabBar: React.FC = () => {
  const { 
    tabs, 
    activeTabId, 
    setActiveTab, 
    closeTab 
  } = useTabContext();
  const router = useRouter();

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center h-10">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          
          return (
            <div
              key={tab.id}
              className={cn(
                "flex items-center min-w-0 max-w-48 px-3 py-2 border-r border-gray-200 cursor-pointer group transition-colors",
                isActive 
                  ? "bg-blue-50 border-b-2 border-b-blue-500 text-blue-700" 
                  : "bg-white hover:bg-gray-50 text-gray-700"
              )}
              onClick={() => {
                setActiveTab(tab.id);
                router.push(tab.path);
              }}
            >
              {/* Title */}
              <span className="truncate text-sm font-medium flex-1">
                {tab.title}
              </span>
              
              {/* Close button */}
              {tab.closable && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-2 opacity-0 group-hover:opacity-100 hover:bg-gray-200 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
