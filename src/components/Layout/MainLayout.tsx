// src/components/Layout/MainLayout.tsx
import { useState, useEffect } from 'react';
import { MessageSquare, Table, Users, Settings } from 'lucide-react';
import { CandidatesTable } from '../Candidates/CandidatesTable';
import { ChatInterface } from '../Chat/ChatInterface';
import { CandidatesSidebar } from '../Candidates/CandidatesSidebar';
import { SettingsModal } from '../Settings/SettingsModal';
import { AICostTracker } from '../Dashboard/AICostTracker';
import { useCandidates } from '../../hooks/useCandidates';
import { useSettings } from '../../hooks/useSettings';
import toast from 'react-hot-toast';

type Tab = 'chat' | 'table';

export function MainLayout() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { refreshCandidates } = useCandidates();
  const { settings, updateSettings, resetToDefault, isLoading: settingsLoading } = useSettings();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataUpdate = () => {
    console.log('🔄 Triggering data refresh...');
    refreshCandidates();
    setRefreshKey(prev => prev + 1);
  };

  const handleSettingsSave = (newSettings: any) => {
    updateSettings(newSettings);
    toast.success('Settings saved successfully!');
    // Force refresh of chat interface by changing the key
    setRefreshKey(prev => prev + 1);
  };

  const handleSettingsReset = () => {
    if (window.confirm('Reset all settings to default? This cannot be undone.')) {
      resetToDefault();
      toast.success('Settings reset to default');
      setRefreshKey(prev => prev + 1);
    }
  };

  if (settingsLoading) {
    return (
      <div className="h-screen bg-dark-50 text-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-dark-50 text-primary flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="bg-dark-100 border-b border-dark-300 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-heading-3">{settings.appName}</h1>
                <p className="text-caption-subtle">AI-Powered {settings.entityName} Management</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center bg-dark-200 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-primary-500 text-white'
                    : 'text-muted hover:text-primary hover:bg-dark-300'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                AI Chat
              </button>
              <button
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'table'
                    ? 'bg-primary-500 text-white'
                    : 'text-muted hover:text-primary hover:bg-dark-300'
                }`}
              >
                <Table className="w-4 h-4" />
                {settings.entityName} Table
              </button>
            </div>
          </div>

          {/* Status & Settings */}
          <div className="flex items-center gap-6">
            <AICostTracker />
            <div className="flex items-center gap-2 text-caption-subtle">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              System Online
            </div>
            
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-muted hover:text-primary hover:bg-dark-200 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className={`flex-1 ${activeTab === 'chat' ? 'w-4/5' : 'w-full'} overflow-hidden`}>
          <div key={`${activeTab}-${refreshKey}`} className="h-full">
            {activeTab === 'chat' ? (
              <ChatInterface onUpdate={handleDataUpdate} />
            ) : (
              <CandidatesTable />
            )}
          </div>
        </div>

        {/* Right Sidebar - Only visible on Chat tab */}
        {activeTab === 'chat' && (
          <div
            key={refreshKey}
            className="w-1/5 bg-dark-100 border-l border-dark-300 overflow-hidden"
          >
            <CandidatesSidebar />
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={settings}
        onSave={handleSettingsSave}
        onReset={handleSettingsReset}
      />
    </div>
  );
}