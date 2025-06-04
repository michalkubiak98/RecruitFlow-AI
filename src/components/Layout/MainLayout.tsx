import { useState } from 'react';
import { MessageSquare, Table, Users, Settings } from 'lucide-react';
import { CandidatesTable } from '../Candidates/CandidatesTable';
import { ChatInterface } from '../Chat/ChatInterface';
import { CandidatesSidebar } from '../Candidates/CandidatesSidebar';
import { SettingsModal } from '../Settings/SettingsModal';
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
  };

  const handleSettingsReset = () => {
    if (window.confirm('Reset all settings to default? This cannot be undone.')) {
      resetToDefault();
      toast.success('Settings reset to default');
    }
  };

  if (settingsLoading) {
    return (
      <div className="h-screen bg-dark-100 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-dark-100 text-white flex flex-col overflow-hidden">
      {/* Top Header with Tabs */}
      <div className="bg-dark-200 border-b border-dark-300 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{settings.appName}</h1>
                <p className="text-xs text-gray-400">AI-Powered {settings.entityName} Management</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 bg-dark-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  activeTab === 'chat'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-dark-300 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">AI Chat</span>
              </button>
              <button
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  activeTab === 'table'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-dark-300 hover:text-white'
                }`}
              >
                <Table className="w-4 h-4" />
                <span className="font-medium">{settings.entityName} Table</span>
              </button>
            </div>
          </div>

          {/* Status & Settings */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>System Online</span>
            </div>
            
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-400 hover:text-white hover:bg-dark-300 rounded-lg"
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
          <div key={activeTab} className="h-full">
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
            className="w-1/5 bg-dark-200 border-l border-dark-300 overflow-hidden"
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
