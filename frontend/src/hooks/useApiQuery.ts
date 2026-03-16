import { useQuery } from '@tanstack/react-query';
import { fetchClient } from '@/lib/tanstackQueryClient';

export const useProducts = (category?: string, filters?: {
  subCategory?: string;
  collection?: string;
  diamondWeight?: string;
  orderType?: string;
  duration?: string;
  metalWeightRange?: [number, number];
  page?: number;
  limit?: number;
}, isAuthenticated?: boolean) => {
  const params = new URLSearchParams();
  
  if (category) params.append('category', category);
  if (filters?.subCategory) params.append('subCategory', filters.subCategory);
  if (filters?.collection) params.append('collection', filters.collection);
  if (filters?.diamondWeight) params.append('diamondWeight', filters.diamondWeight);
  if (filters?.orderType) params.append('orderType', filters.orderType);
  if (filters?.duration) params.append('duration', filters.duration);
  if (filters?.metalWeightRange) {
    params.append('minMetalWeight', filters.metalWeightRange[0].toString());
    params.append('maxMetalWeight', filters.metalWeightRange[1].toString());
  }
  params.append('page', (filters?.page || 1).toString());
  params.append('limit', (filters?.limit || 24).toString());
  params.append('auth', (isAuthenticated ? 'true' : 'false'));

  return useQuery({
    queryKey: ['products', category, filters, isAuthenticated],
    queryFn: () => fetchClient('/api/products?' + params.toString()),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  });
};

export const useProduct = (productId?: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => productId ? fetchClient('/api/products/' + productId) : null,
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};