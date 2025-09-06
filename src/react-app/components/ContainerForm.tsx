import { useState, useEffect } from 'react';
import { Container, CreateContainer, UpdateContainer } from '@/shared/types';
import { X, Package } from 'lucide-react';

interface ContainerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateContainer | UpdateContainer) => Promise<boolean>;
  container?: Container | null;
}

const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'departed', label: 'Partiu' },
  { value: 'in_transit', label: 'Em Trânsito' },
  { value: 'arrived', label: 'Chegou' },
  { value: 'delayed', label: 'Atrasado' },
];

const commonPorts = [
  'Shanghai, China',
  'Shenzhen, China',
  'Ningbo, China',
  'Guangzhou, China',
  'Qingdao, China',
  'Tianjin, China',
  'Santos, Brasil',
  'Rio de Janeiro, Brasil',
  'Paranaguá, Brasil',
  'Itajaí, Brasil',
  'Suape, Brasil',
];

const shippingLines = [
  'COSCO SHIPPING',
  'Evergreen Line',
  'OOCL',
  'Yang Ming',
  'Hapag-Lloyd',
  'MSC',
  'Maersk',
  'CMA CGM',
  'ONE',
  'Hyundai Merchant Marine',
];

export default function ContainerForm({ isOpen, onClose, onSubmit, container }: ContainerFormProps) {
  const [formData, setFormData] = useState({
    container_number: '',
    departure_port: '',
    arrival_port: '',
    departure_date: '',
    expected_arrival_date: '',
    status: 'pending' as 'pending' | 'departed' | 'in_transit' | 'arrived' | 'delayed',
    cargo_description: '',
    tracking_number: '',
    shipping_line: '',
    notes: '',
    product_images: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  useEffect(() => {
    if (container) {
      const existingImages = container.product_images ? JSON.parse(container.product_images) : [];
      setUploadedImages(existingImages);
      setFormData({
        container_number: container.container_number,
        departure_port: container.departure_port,
        arrival_port: container.arrival_port,
        departure_date: container.departure_date ? container.departure_date.split('T')[0] : '',
        expected_arrival_date: container.expected_arrival_date ? container.expected_arrival_date.split('T')[0] : '',
        status: container.status,
        cargo_description: container.cargo_description || '',
        tracking_number: container.tracking_number || '',
        shipping_line: container.shipping_line || '',
        notes: container.notes || '',
        product_images: container.product_images || '',
      });
    } else {
      setUploadedImages([]);
      setFormData({
        container_number: '',
        departure_port: '',
        arrival_port: '',
        departure_date: '',
        expected_arrival_date: '',
        status: 'pending',
        cargo_description: '',
        tracking_number: '',
        shipping_line: '',
        notes: '',
        product_images: '',
      });
    }
  }, [container, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setUploadedImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = {
      ...formData,
      departure_date: formData.departure_date || undefined,
      expected_arrival_date: formData.expected_arrival_date || undefined,
      cargo_description: formData.cargo_description || undefined,
      tracking_number: formData.tracking_number || undefined,
      shipping_line: formData.shipping_line || undefined,
      notes: formData.notes || undefined,
      product_images: uploadedImages.length > 0 ? JSON.stringify(uploadedImages) : undefined,
    };

    const success = await onSubmit(submitData);
    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              {container ? 'Editar Container' : 'Novo Container'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Número do Container *
              </label>
              <input
                type="text"
                required
                value={formData.container_number}
                onChange={(e) => setFormData({ ...formData, container_number: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                placeholder="Ex: MSKU1234567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-slate-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Porto de Saída *
              </label>
              <input
                type="text"
                required
                list="departure-ports"
                value={formData.departure_port}
                onChange={(e) => setFormData({ ...formData, departure_port: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                placeholder="Ex: Shanghai, China"
              />
              <datalist id="departure-ports">
                {commonPorts.filter(port => port.includes('China')).map(port => (
                  <option key={port} value={port} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Porto de Chegada *
              </label>
              <input
                type="text"
                required
                list="arrival-ports"
                value={formData.arrival_port}
                onChange={(e) => setFormData({ ...formData, arrival_port: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                placeholder="Ex: Santos, Brasil"
              />
              <datalist id="arrival-ports">
                {commonPorts.filter(port => port.includes('Brasil')).map(port => (
                  <option key={port} value={port} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Data de Saída
              </label>
              <input
                type="date"
                value={formData.departure_date}
                onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Previsão de Chegada
              </label>
              <input
                type="date"
                value={formData.expected_arrival_date}
                onChange={(e) => setFormData({ ...formData, expected_arrival_date: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Empresa Marítima
              </label>
              <input
                type="text"
                list="shipping-lines"
                value={formData.shipping_line}
                onChange={(e) => setFormData({ ...formData, shipping_line: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                placeholder="Ex: COSCO SHIPPING"
              />
              <datalist id="shipping-lines">
                {shippingLines.map(line => (
                  <option key={line} value={line} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Número de Rastreamento
              </label>
              <input
                type="text"
                value={formData.tracking_number}
                onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                placeholder="Código de rastreamento"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Descrição da Carga
            </label>
            <textarea
              value={formData.cargo_description}
              onChange={(e) => setFormData({ ...formData, cargo_description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none"
              placeholder="Descreva o conteúdo do container..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none"
              placeholder="Observações adicionais..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Fotos dos Produtos
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white file:cursor-pointer hover:file:bg-blue-600"
            />
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Produto ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-white/20 text-slate-300 rounded-lg hover:bg-white/5 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Salvando...' : container ? 'Atualizar' : 'Criar Container'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
