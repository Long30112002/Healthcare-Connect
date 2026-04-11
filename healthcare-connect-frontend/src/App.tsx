import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRouter } from './application/router/AppRouter';
import FloatingChatbot from './presentation/components/shared/FloatingChatbot';

function App() {
  const navigate = useNavigate();
  useEffect(() => {
    const handleUnauthorized = () => {
      navigate('/login', { replace: true });
    };
    window.addEventListener('unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, [navigate]);


  return (
    <>
      <AppRouter />;
      <FloatingChatbot />
    </>
  )
}

export default App;