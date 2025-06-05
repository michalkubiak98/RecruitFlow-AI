import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from './components/Layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout />
      
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#2C2C2E',
            color: '#fff',
            border: '1px solid #48484A',
            borderRadius: '4px',
          },
          success: {
            iconTheme: {
              primary: '#00B050',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#DC3545',
              secondary: '#fff',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}
