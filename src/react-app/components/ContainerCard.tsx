import { Container } from '@/shared/types';
import { Ship, MapPin, Calendar, Clock, Package, Edit2, Trash2 } from 'lucide-react';

interface ContainerCardProps {
  container: Container;
  onEdit: (container: Container) => void;
  onDelete: (id: number) => void;
}

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  departed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  in_transit: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  arrived: 'bg-green-500/20 text-green-300 border-green-500/30',
  delayed: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const statusLabels = {
  pending: 'Pendente',
  departed: 'Partiu',
  in_transit: 'Em Trânsito',
  arrived: 'Chegou',
  delayed: 'Atrasado',
};

function calculateDaysToArrival(expectedDate: string | null): number | null {
  if (!expectedDate) return null;
  const today = new Date();
  const arrival = new Date(expectedDate);
  const diffTime = arrival.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getShipPosition(daysToArrival: number | null): number {
  if (daysToArrival === null) return 0;
  if (daysToArrival <= 0) return 100;
  if (daysToArrival >= 30) return 0;
  return Math.max(0, Math.min(100, ((30 - daysToArrival) / 30) * 100));
}

export default function ContainerCard({ container, onEdit, onDelete }: ContainerCardProps) {
  const daysToArrival = calculateDaysToArrival(container.expected_arrival_date);
  const shipPosition = getShipPosition(daysToArrival);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{container.container_number}</h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[container.status]}`}>
              {statusLabels[container.status]}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(container)}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(container.id)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-2 text-slate-300">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{container.departure_port} → {container.arrival_port}</span>
        </div>
        
        {container.shipping_line && (
          <div className="flex items-center space-x-2 text-slate-300">
            <Ship className="w-4 h-4" />
            <span className="text-sm">{container.shipping_line}</span>
          </div>
        )}

        {container.expected_arrival_date && (
          <div className="flex items-center space-x-2 text-slate-300">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              Previsão: {new Date(container.expected_arrival_date).toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}

        {daysToArrival !== null && (
          <div className="flex items-center space-x-2 text-slate-300">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              {daysToArrival > 0 
                ? `${daysToArrival} dias para chegada`
                : daysToArrival === 0 
                ? 'Chega hoje!' 
                : 'Já deveria ter chegado'
              }
            </span>
          </div>
        )}
      </div>

      {/* Ship Progress Animation */}
      {(container.status === 'in_transit' || container.status === 'departed') && daysToArrival !== null && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="truncate max-w-20">{container.departure_port.split(',')[0]}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="truncate max-w-20">{container.arrival_port.split(',')[0]}</span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
          
          {/* Ocean Scene */}
          <div className="relative h-20 bg-gradient-to-b from-sky-300/20 via-blue-400/30 to-blue-600/40 rounded-xl overflow-visible border border-blue-400/20">
            {/* Background waves */}
            <div className="absolute inset-0">
              <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-blue-500/30 to-transparent">
                <svg className="absolute bottom-0 w-full h-6" viewBox="0 0 400 24" preserveAspectRatio="none">
                  <path
                    d="M0,12 Q100,0 200,12 T400,12 V24 H0 Z"
                    fill="rgba(59, 130, 246, 0.3)"
                    className="animate-pulse"
                  />
                </svg>
              </div>
              <div className="absolute bottom-0 w-full h-6 bg-gradient-to-t from-cyan-500/20 to-transparent">
                <svg className="absolute bottom-0 w-full h-4" viewBox="0 0 400 16" preserveAspectRatio="none">
                  <path
                    d="M0,8 Q50,16 100,8 T200,8 T300,8 T400,8 V16 H0 Z"
                    fill="rgba(6, 182, 212, 0.2)"
                    className="animate-bounce"
                    style={{ animationDuration: '3s' }}
                  />
                </svg>
              </div>
            </div>

            {/* Departure Port */}
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
              <div className="w-6 h-8 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-sm relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-amber-300"></div>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-red-500 rounded-full"></div>
              </div>
            </div>

            {/* Arrival Port */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <div className="w-6 h-8 bg-gradient-to-t from-green-600 to-green-400 rounded-t-sm relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-green-300"></div>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-red-500 rounded-full"></div>
              </div>
            </div>

            {/* Ship */}
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-2000 ease-out z-10"
              style={{ left: `calc(12% + ${shipPosition * 0.76}%)` }}
            >
              <div className="relative">
                {/* Ship wake trails */}
                <div className="absolute -left-6 top-1/2 w-6 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-y-1/2 rotate-6"></div>
                <div className="absolute -left-5 top-1/2 w-4 h-0.5 bg-gradient-to-r from-transparent via-white/15 to-transparent transform -translate-y-1/2 -rotate-6 mt-1"></div>
                <div className="absolute -left-4 top-1/2 w-3 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-y-1/2 rotate-3 mt-0.5"></div>
                
                {/* Realistic Ship Silhouette */}
                <div className="relative">
                  <svg width="32" height="20" viewBox="0 0 32 20" className="text-slate-700">
                    {/* Ship Hull */}
                    <path 
                      d="M2 12 L2 16 Q2 17 3 17 L26 17 Q28 17 28 15 L28 12 L30 11 L30 10 L28 10 L28 8 L2 8 Z" 
                      fill="currentColor"
                    />
                    
                    {/* Bow (front point) */}
                    <path 
                      d="M28 8 L30 10 L30 11 L28 12 L28 8" 
                      fill="currentColor"
                    />
                    
                    {/* Superstructure (cabin/bridge) */}
                    <rect x="20" y="4" width="6" height="4" fill="currentColor" />
                    
                    {/* Container blocks (simplified) */}
                    <rect x="6" y="5" width="3" height="3" fill="currentColor" />
                    <rect x="10" y="4" width="3" height="4" fill="currentColor" />
                    <rect x="14" y="5" width="3" height="3" fill="currentColor" />
                    
                    {/* Mast */}
                    <line x1="23" y1="0" x2="23" y2="4" stroke="currentColor" strokeWidth="1" />
                    
                    {/* Small flag */}
                    <rect x="23" y="0" width="2" height="1" fill="currentColor" />
                  </svg>
                  
                  {/* Ship reflection in water */}
                  <div className="absolute top-5 left-0 w-8 h-1.5 bg-slate-700/20 rounded-b-lg opacity-60 blur-sm"></div>
                </div>

                {/* Progress indicator */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-cyan-300 font-bold whitespace-nowrap bg-slate-900/90 px-2 py-1 rounded-md border border-cyan-400/30 shadow-lg">
                  {Math.round(shipPosition)}%
                </div>
              </div>
            </div>

            {/* Progress line */}
            <div className="absolute bottom-2 left-8 right-8 h-0.5 bg-blue-800/50 rounded">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded transition-all duration-2000 ease-out"
                style={{ width: `${shipPosition}%` }}
              ></div>
            </div>

            {/* Clouds */}
            <div className="absolute top-1 left-8 w-3 h-2 bg-white/20 rounded-full opacity-60"></div>
            <div className="absolute top-0.5 left-10 w-2 h-1.5 bg-white/15 rounded-full opacity-40"></div>
            <div className="absolute top-2 right-12 w-4 h-2 bg-white/25 rounded-full opacity-50"></div>
          </div>
          
          <div className="flex items-center justify-center mt-2 text-xs text-slate-400">
            <Clock className="w-3 h-3 mr-1" />
            <span>
              {daysToArrival > 0 
                ? `${daysToArrival} dias restantes`
                : daysToArrival === 0 
                ? 'Chegando hoje!' 
                : 'Atrasado'
              }
            </span>
          </div>
        </div>
      )}

      {container.product_images && (
        <div className="border-t border-white/10 pt-4 mb-3">
          <div className="text-sm text-slate-300 mb-2 font-medium">Produtos:</div>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {JSON.parse(container.product_images).map((image: string, index: number) => (
              <img
                key={index}
                src={image}
                alt={`Produto ${index + 1}`}
                className="w-16 h-16 object-cover rounded-lg border border-white/10 flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
                onClick={() => {
                  // Criar modal para visualização ampliada
                  const modal = document.createElement('div');
                  modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
                  modal.innerHTML = `
                    <div class="relative">
                      <img src="${image}" class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" />
                      <button class="absolute top-4 right-4 w-8 h-8 bg-white/20 text-white rounded-full flex items-center justify-center text-xl hover:bg-white/30 transition-colors">×</button>
                    </div>
                  `;
                  modal.onclick = (e) => {
                    if (e.target === modal || (e.target as HTMLElement).tagName === 'BUTTON') {
                      document.body.removeChild(modal);
                    }
                  };
                  document.body.appendChild(modal);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {container.cargo_description && (
        <div className="text-sm text-slate-400 border-t border-white/10 pt-3">
          <strong>Carga:</strong> {container.cargo_description}
        </div>
      )}
    </div>
  );
}
