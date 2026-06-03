import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter';

const App = () => {
  return (
    <>
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#f9fafb' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#f9fafb' } },
        }}
      />
      <AppRouter />
    </>
  );
};

export default App;