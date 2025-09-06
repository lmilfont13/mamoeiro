import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { useContainers } from '@/react-app/hooks/useContainers';
import ContainerCard from '@/react-app/components/ContainerCard';
import ContainerForm from '@/react-app/components/ContainerForm';
import { Container, CreateContainer, UpdateContainer } from '@/shared/types';
import { 
  Ship, 
  Plus, 
  LogOut, 
  User, 
  Package, 
  Anchor, 
  AlertTriangle,
  FileText 
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout, isPending } = useAuth();
  const navigate = useNavigate();
  const { containers, isLoading, createContainer, updateContainer, deleteContainer } = useContainers();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContainer, setEditingContainer] = useState<Container | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleCreateContainer = async (data: CreateContainer) => {
    return await createContainer(data);
  };

  const handleUpdateContainer = async (data: UpdateContainer) => {
    if (editingContainer) {
      return await updateContainer(editingContainer.id, data);
    }
    return false;
  };

  const handleEditContainer = (container: Container) => {
    setEditingContainer(container);
    setIsFormOpen(true);
  };

  const handleDeleteContainer = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar este container?')) {
      await deleteContainer(id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingContainer(null);
  };

  const handleFormSubmit = async (data: CreateContainer | UpdateContainer) => {
    const success = editingContainer 
      ? await handleUpdateContainer(data as UpdateContainer)
      : await handleCreateContainer(data as CreateContainer);
    
    if (success) {
      handleFormClose();
    }
    return success;
  };

  // Calculate statistics
  const today = new Date();
  const stats = {
    total: containers.length,
    inTransit: containers.filter(c => c.status === 'departed' || c.status === 'in_transit').length,
    arriving: containers.filter(c => {
      if (!c.expected_arrival_date) return false;
      const daysToArrival = Math.ceil((new Date(c.expected_arrival_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysToArrival >= 0 && daysToArrival <= 7;
    }).length,
    delayed: containers.filter(c => {
      if (!c.expected_arrival_date || c.actual_arrival_date) return false;
      const expectedDate = new Date(c.expected_arrival_date);
      return expectedDate < today;
    }).length,
  };

  if (isPending || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin">
          <Ship className="w-12 h-12 text-blue-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <Ship className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-white">ContainerFlow</h1>
                  <img 
                    src="https://mocha-cdn.com/01991f6e-b7d9-729f-98bc-2ae64e573b15/company-logo-transparent.png" 
                    alt="Logo" 
                    className="w-6 h-6 opacity-60 hover:opacity-80 transition-opacity"
                  />
                </div>
                <p className="text-sm text-slate-400">
                  {currentTime.toLocaleString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-slate-300">
                <User className="w-4 h-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Package className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-sm text-slate-400">Total</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Ship className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{stats.inTransit}</div>
                  <div className="text-sm text-slate-400">Em Trânsito</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Anchor className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{stats.arriving}</div>
                  <div className="text-sm text-slate-400">Chegando (7 dias)</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{stats.delayed}</div>
                  <div className="text-sm text-slate-400">Atrasados</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Meus Containers</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/reports')}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <FileText className="w-5 h-5" />
                <span>Relatório</span>
              </button>
              <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Novo Container</span>
              </button>
            </div>
          </div>

          {/* Containers Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin">
                <Ship className="w-12 h-12 text-blue-400" />
              </div>
            </div>
          ) : containers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum container cadastrado</h3>
              <p className="text-slate-400 mb-6">Comece adicionando seu primeiro container importado</p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
              >
                Adicionar Container
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {containers.map((container) => (
                <ContainerCard
                  key={container.id}
                  container={container}
                  onEdit={handleEditContainer}
                  onDelete={handleDeleteContainer}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Floating Animation - Multiple Ships */}
      <div className="fixed bottom-0 right-0 pointer-events-none">
        <div className="relative w-32 h-32">
          <div className="absolute bottom-4 right-4 animate-bounce">
            <Ship className="w-8 h-8 text-blue-400/30" />
          </div>
          <div className="absolute bottom-8 right-12 animate-pulse" style={{ animationDelay: '1s' }}>
            <Ship className="w-6 h-6 text-cyan-400/20" />
          </div>
          <div className="absolute bottom-12 right-8 animate-bounce" style={{ animationDelay: '2s' }}>
            <Ship className="w-4 h-4 text-purple-400/20" />
          </div>
        </div>
      </div>

      {/* Container Form Modal */}
      <ContainerForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        container={editingContainer}
      />
    </div>
  );
}
