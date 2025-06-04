import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from './components/Layout';
import { CandidateList } from './components/CandidateList';
import { ChatInterface } from './components/Chat';
import { useCandidates, useRefreshData } from './hooks/useQuery';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const [activeView, setActiveView] = useState<'chat' | 'table' | 'specs'>('chat');
  const { data: candidates = [], isLoading } = useCandidates();
  const refreshData = useRefreshData();

  return (
    <>
      <MainLayout
        activeView={activeView}
        onViewChange={setActiveView}
        sidebar={
          <CandidateList 
            candidates={candidates} 
            onUpdate={refreshData}
          />
        }
      >
        {activeView === 'chat' && (
          <ChatInterface onUpdate={refreshData} />
        )}
        
        {activeView === 'table' && (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Candidate Table</h2>
            {/* Table view implementation here */}
            <p className="text-gray-400">Table view coming soon...</p>
          </div>
        )}
        
        {activeView === 'specs' && (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Spec Tracker</h2>
            {/* Spec tracker implementation here */}
            <p className="text-gray-400">Spec tracker coming soon...</p>
          </div>
        )}
      </MainLayout>
      
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#2d2d2d',
            color: '#fff',
          },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
