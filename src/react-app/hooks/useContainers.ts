import { useState, useEffect } from 'react';
import { Container, CreateContainer, UpdateContainer } from '@/shared/types';

export function useContainers() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContainers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/containers');
      if (!response.ok) {
        throw new Error('Falha ao carregar containers');
      }
      const data = await response.json();
      setContainers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const createContainer = async (containerData: CreateContainer) => {
    try {
      const response = await fetch('/api/containers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(containerData),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar container');
      }

      await fetchContainers();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar container');
      return false;
    }
  };

  const updateContainer = async (id: number, containerData: UpdateContainer) => {
    try {
      const response = await fetch(`/api/containers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(containerData),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar container');
      }

      await fetchContainers();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar container');
      return false;
    }
  };

  const deleteContainer = async (id: number) => {
    try {
      const response = await fetch(`/api/containers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Falha ao deletar container');
      }

      await fetchContainers();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar container');
      return false;
    }
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  return {
    containers,
    isLoading,
    error,
    fetchContainers,
    createContainer,
    updateContainer,
    deleteContainer,
  };
}
