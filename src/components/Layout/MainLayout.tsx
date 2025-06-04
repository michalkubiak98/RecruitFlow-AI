import { useState } from 'react';
import { MessageSquare, Table, Users } from 'lucide-react';
import { CandidatesTable } from '../Candidates/CandidatesTable';
import { ChatInterface } from '../Chat/ChatInterface';
import { CandidatesSidebar } from '../Candidates/CandidatesSidebar';
import { useCandidates } from '../../hooks/useCandidates';

type Tab = 'chat' | 'table';

export function MainLayout() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const { refreshCandidates } = useCandidates();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataUpdate = () => {
    console.log('🔄 Triggering data refresh...');
    refreshCandidates();
    // Force re-render of sidebar
    setRefreshKey(prev => prev + 1);
  };

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
                <h1 className="text-xl font-bold text-white">Rolodex.ai</h1>
                <p className="text-xs text-gray-400">AI-Powered Candidate Management</p>
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
                <span className="font-medium">Candidates Table</span>
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>System Online</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content (4/5ths or full width) */}
        <div className={`flex-1 ${activeTab === 'chat' ? 'w-4/5' : 'w-full'} overflow-hidden`}>
          <div key={activeTab} className="h-full">
            {activeTab === 'chat' ? (
              <ChatInterface onUpdate={handleDataUpdate} />
            ) : (
              <CandidatesTable />
            )}
          </div>
        </div>

        {/* Right Sidebar (1/5th) - Only visible on Chat tab */}
        {activeTab === 'chat' && (
          <div
            key={refreshKey}
            className="w-1/5 bg-dark-200 border-l border-dark-300 overflow-hidden"
          >
            <CandidatesSidebar />
          </div>
        )}
      </div>
    </div>
  );
}
