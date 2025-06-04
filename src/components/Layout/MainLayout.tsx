import React, { useState } from 'react';
import { MessageSquare, Table, FileText } from 'lucide-react';
import { clsx } from 'clsx';

interface MainLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  activeView: 'chat' | 'table' | 'specs';
  onViewChange: (view: 'chat' | 'table' | 'specs') => void;
}

export function MainLayout({ children, sidebar, activeView, onViewChange }: MainLayoutProps) {
  return (
    <div className="h-screen flex bg-dark-100">
      {/* Sidebar */}
      <div className="w-80 border-r border-dark-300 flex flex-col">
        {sidebar}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Tab bar */}
        <div className="border-b border-dark-300 bg-dark-200">
          <div className="flex space-x-1 p-2">
            <button
              onClick={() => onViewChange('chat')}
              className={clsx(
                'flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeView === 'chat'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-300'
              )}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </button>
            
            <button
              onClick={() => onViewChange('table')}
              className={clsx(
                'flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeView === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-300'
              )}
            >
              <Table className="w-4 h-4 mr-2" />
              Table
            </button>
            
            <button
              onClick={() => onViewChange('specs')}
              className={clsx(
                'flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeView === 'specs'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-300'
              )}
            >
              <FileText className="w-4 h-4 mr-2" />
              Spec Tracker
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
