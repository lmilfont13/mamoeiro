import { useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { Ship } from 'lucide-react';

export default function AuthCallback() {
  const { exchangeCodeForSessionToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await exchangeCodeForSessionToken();
        navigate('/dashboard');
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [exchangeCodeForSessionToken, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin mb-6">
          <Ship className="w-16 h-16 text-blue-400 mx-auto" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">Finalizando login...</h2>
        <p className="text-slate-300">Redirecionando para o dashboard</p>
      </div>
    </div>
  );
}
