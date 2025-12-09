import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ModelData, ElementData } from '../types/navisworks.types';

interface UseNavisworksModelOptions {
  projectId: string;
  modelId: string;
  enabled?: boolean;
}

interface UseNavisworksModelReturn {
  modelData: ModelData | null;
  elements: ElementData[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch and manage Navisworks model data
 */
export function useNavisworksModel({
  projectId,
  modelId,
  enabled = true,
}: UseNavisworksModelOptions): UseNavisworksModelReturn {
  const [elements, setElements] = useState<ElementData[]>([]);

  // Fetch model data from API
  const {
    data: modelData,
    isLoading,
    error,
    refetch,
  } = useQuery<ModelData, Error>({
    queryKey: ['navisworks-model', projectId, modelId],
    queryFn: async () => {
      const response = await fetch(
        `/api/projects/${projectId}/navisworks/models/${modelId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch Navisworks model');
      }
      
      const data = await response.json();
      return data.data || data;
    },
    enabled: enabled && !!projectId && !!modelId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Extract elements when model data changes
  useEffect(() => {
    if (modelData?.elements) {
      setElements(modelData.elements);
    }
  }, [modelData]);

  return {
    modelData: modelData || null,
    elements,
    isLoading,
    error: error || null,
    refetch,
  };
}

/**
 * Hook to fetch single element data
 */
export function useNavisworksElement(
  projectId: string,
  modelId: string,
  elementId: string
) {
  return useQuery<ElementData, Error>({
    queryKey: ['navisworks-element', projectId, modelId, elementId],
    queryFn: async () => {
      const response = await fetch(
        `/api/projects/${projectId}/navisworks/models/${modelId}/elements/${elementId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch element');
      }
      
      const data = await response.json();
      return data.data || data;
    },
    enabled: !!projectId && !!modelId && !!elementId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to manage element filtering
 */
export function useElementFilter(elements: ElementData[]) {
  const [filteredElements, setFilteredElements] = useState<ElementData[]>(elements);
  const [filters, setFilters] = useState({
    category: '',
    searchText: '',
    hasGeometry: false,
    visibleOnly: false,
  });

  useEffect(() => {
    let result = [...elements];

    // Filter by category
    if (filters.category) {
      result = result.filter(el => el.category === filters.category);
    }

    // Filter by search text
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      result = result.filter(el => 
        el.name.toLowerCase().includes(searchLower) ||
        el.path.toLowerCase().includes(searchLower)
      );
    }

    // Filter by geometry
    if (filters.hasGeometry) {
      result = result.filter(el => el.geometry != null);
    }

    // Filter by visibility
    if (filters.visibleOnly) {
      result = result.filter(el => 
        !el.metadata?.isHidden && el.metadata?.isVisible !== false
      );
    }

    setFilteredElements(result);
  }, [elements, filters]);

  const updateFilter = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      searchText: '',
      hasGeometry: false,
      visibleOnly: false,
    });
  };

  return {
    filteredElements,
    filters,
    updateFilter,
    resetFilters,
  };
}

/**
 * Hook to get unique categories from elements
 */
export function useElementCategories(elements: ElementData[]) {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const uniqueCategories = new Set<string>();
    elements.forEach(el => {
      if (el.category) {
        uniqueCategories.add(el.category);
      }
    });
    setCategories(Array.from(uniqueCategories).sort());
  }, [elements]);

  return categories;
}
