import { useAuth } from '@getmocha/users-service/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Ship, Container, BarChart3, Clock } from 'lucide-react';

export default function Home() {
  const { user, isPending, redirectToLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && user) {
      navigate('/dashboard');
    }
  }, [user, isPending, navigate]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin">
          <Ship className="w-12 h-12 text-blue-400" />
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      
      {/* Header */}
      <header className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Ship className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white">ContainerFlow</h1>
              <img 
                src="https://mocha-cdn.com/01991f6e-b7d9-729f-98bc-2ae64e573b15/company-logo-transparent.png" 
                alt="Logo" 
                className="w-6 h-6 opacity-60 hover:opacity-80 transition-opacity"
              />
            </div>
          </div>
          <button
            onClick={redirectToLogin}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Entrar com Google
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Controle Profissional de
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Containers Importados
              </span>
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Sistema completo para monitoramento de containers vindos da China com visualização em tempo real, 
              previsões de chegada e interface profissional para exibição em escritório.
            </p>
            <button
              onClick={redirectToLogin}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-2xl hover:shadow-blue-500/25 hover:scale-105"
            >
              Começar Agora
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Container className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Controle de Containers</h3>
              <p className="text-slate-300">
                Gerencie todos os seus containers com informações detalhadas de origem, destino e status atual.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Previsões Precisas</h3>
              <p className="text-slate-300">
                Acompanhe previsões de saída e chegada com cálculos automáticos de tempo de trânsito.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Visual Profissional</h3>
              <p className="text-slate-300">
                Interface elegante com animações de navios e dashboard otimizado para exibição fulltime.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Animated Ship */}
      <div className="fixed bottom-10 right-10 opacity-20">
        <div className="animate-bounce">
          <Ship className="w-16 h-16 text-blue-400" />
        </div>
      </div>
    </div>
  );
}
