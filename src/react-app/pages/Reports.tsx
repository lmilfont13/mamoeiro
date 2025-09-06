import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { useContainers } from '@/react-app/hooks/useContainers';
import { ArrowLeft, FileText, BarChart3 } from 'lucide-react';

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function calculateDaysToArrival(expectedDate: string | null): number | null {
  if (!expectedDate) return null;
  const today = new Date();
  const arrival = new Date(expectedDate);
  const diffTime = arrival.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getProgressColor(daysToArrival: number | null): string {
  if (daysToArrival === null) return 'bg-gray-300';
  if (daysToArrival <= 10) return 'bg-red-400'; // Urgente
  if (daysToArrival <= 20) return 'bg-yellow-400'; // Médio
  return 'bg-green-400'; // Normal
}

function getProgressWidth(daysToArrival: number | null): number {
  if (daysToArrival === null) return 0;
  if (daysToArrival <= 0) return 100;
  // Assumindo que o cronograma padrão é de 30 dias
  const totalDays = 30;
  const progress = Math.max(0, Math.min(100, ((totalDays - daysToArrival) / totalDays) * 100));
  return progress;
}

export default function Reports() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const { containers, isLoading } = useContainers();
  const [reportDate] = useState(new Date());

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  if (isPending || !user || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin">
          <FileText className="w-12 h-12 text-blue-600" />
        </div>
      </div>
    );
  }

  // Filtrar containers por status
  const shippedContainers = containers.filter(c => 
    ['departed', 'in_transit'].includes(c.status)
  );
  
  const productionContainers = containers.filter(c => 
    ['pending'].includes(c.status)
  );

  // Estatísticas do resumo executivo
  const stats = {
    shipped: shippedContainers.length,
    production: productionContainers.length,
    total: containers.length
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header para tela - não imprime */}
      <div className="no-print bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-white hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Dashboard</span>
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Conteúdo do relatório */}
      <div className="max-w-4xl mx-auto p-8 bg-white">
        {/* Cabeçalho do relatório */}
        <div className="text-center mb-8 border-b pb-6">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-800">
              RELATÓRIO STATUS CONTAINERS
            </h1>
            <img 
              src="https://mocha-cdn.com/01991f6e-b7d9-729f-98bc-2ae64e573b15/logo.png" 
              alt="Logo" 
              className="w-6 h-6 opacity-50"
            />
          </div>
          <p className="text-gray-600">
            {formatDate(reportDate)}
          </p>
        </div>

        {/* Resumo Executivo */}
        <div className="mb-8 bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">RESUMO EXECUTIVO</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">{stats.shipped}</div>
              <div className="text-sm text-gray-600">Embarcados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-1">{stats.production}</div>
              <div className="text-sm text-gray-600">Em Produção</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>

        {/* Containers Embarcados */}
        {shippedContainers.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-green-600 rounded mr-3 flex items-center justify-center">
                <span className="text-white text-xs font-bold">C</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">CONTAINERS EMBARCADOS</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Container</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Produto</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Chegada</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Núm Container</th>
                  </tr>
                </thead>
                <tbody>
                  {shippedContainers.map((container) => {
                    const containerNumbers = container.container_number.split('-');
                    const containerCount = containerNumbers.length === 2 
                      ? parseInt(containerNumbers[1]) - parseInt(containerNumbers[0]) + 1 
                      : 1;
                    
                    return (
                      <tr key={container.id} className="border-b border-gray-100">
                        <td className="py-3">
                          <div className="font-medium text-gray-800">{container.container_number}</div>
                        </td>
                        <td className="py-3">
                          <div className="text-gray-700">{container.cargo_description || 'Carga diversa'}</div>
                        </td>
                        <td className="py-3 text-center">
                          <div className="text-blue-600 font-medium">
                            {container.expected_arrival_date 
                              ? new Date(container.expected_arrival_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                              : 'N/A'
                            }
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            Embarcado
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <div className="font-medium text-blue-600">{containerCount}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Containers em Produção */}
        {productionContainers.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-orange-600 rounded mr-3 flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">CONTAINERS EM PRODUÇÃO</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Container</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Produto</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Chegada</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Núm Container</th>
                  </tr>
                </thead>
                <tbody>
                  {productionContainers.map((container) => {
                    const containerNumbers = container.container_number.split('-');
                    const containerCount = containerNumbers.length === 2 
                      ? parseInt(containerNumbers[1]) - parseInt(containerNumbers[0]) + 1 
                      : 1;
                    
                    return (
                      <tr key={container.id} className="border-b border-gray-100">
                        <td className="py-3">
                          <div className="font-medium text-gray-800">{container.container_number}</div>
                        </td>
                        <td className="py-3">
                          <div className="text-gray-700">{container.cargo_description || 'Produtos diversos'}</div>
                        </td>
                        <td className="py-3 text-center">
                          <div className="text-blue-600 font-medium">
                            {container.expected_arrival_date 
                              ? new Date(container.expected_arrival_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                              : 'N/A'
                            }
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                            Em Produção
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <div className="font-medium text-blue-600">{containerCount}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Legenda */}
        <div className="mt-8 pt-6 border-t border-gray-300">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Legenda:</h3>
            <div className="flex flex-wrap gap-6 text-xs text-gray-600">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-400 rounded mr-2"></div>
                <span>&le; 10 dias (Urgente)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-400 rounded mr-2"></div>
                <span>&le; 20 dias (Médio)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-400 rounded mr-2"></div>
                <span>&gt; 20 dias (Normal)</span>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            * Relatório gerado em {formatDate(reportDate)} | Dias calculados até chegada
          </div>
        </div>
      </div>
    </div>
  );
}
