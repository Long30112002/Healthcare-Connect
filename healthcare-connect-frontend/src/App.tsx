import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRouter } from './application/router/AppRouter';

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
  return <AppRouter />;
}

export default App;