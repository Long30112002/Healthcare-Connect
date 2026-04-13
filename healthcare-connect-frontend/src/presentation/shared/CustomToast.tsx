import toast, { Toaster } from 'react-hot-toast';

export const CustomToaster = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          borderRadius: '12px',
          padding: '12px 16px',
        },
        success: {
          duration: 3000,
          icon: '✅',
          style: {
            background: '#10B981',
            color: '#fff',
          },
        },
        error: {
          duration: 4000,
          icon: '❌',
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        },
        loading: {
          style: {
            background: '#3B82F6',
            color: '#fff',
          },
        },

      }}
    />
  );
};

export const toastInfo = (message: string) => {
  toast(message, {
    icon: 'ℹ️',
    duration: 3000,
    style: {
      background: '#3B82F6',
      color: '#fff',
    },
  });
};