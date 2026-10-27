import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// An expired session on any request sends the user back to the login screen.
const handleUnauthorized = (err) => {
  if (err?.status === 401) queryClient.setQueryData(['me'], null);
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleUnauthorized }),
  mutationCache: new MutationCache({ onError: handleUnauthorized }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      retry: (count, err) => (err?.status === 0 || err?.status >= 500) && count < 2,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster position="bottom-right" toastOptions={{
              duration: 4000,
              style: {
                fontSize: '14px',
                background: '#0b1020',
                color: '#eef2fc',
                border: '1px solid rgba(0,240,255,0.3)',
                boxShadow: '0 0 24px -8px rgba(0,240,255,0.7)',
              },
              success: { iconTheme: { primary: '#b6ff3b', secondary: '#05070f' } },
              error: { iconTheme: { primary: '#fb7185', secondary: '#05070f' } },
            }} />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
