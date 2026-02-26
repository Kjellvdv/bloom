import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGarden, updateGarden, waterGarden, getGardenMessages, markMessageRead } from '../lib/api';

export function useGarden() {
  return useQuery({
    queryKey: ['garden'],
    queryFn: getGarden,
  });
}

export function useUpdateGarden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: any) => updateGarden(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garden'] });
    },
  });
}

export function useWaterGarden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: waterGarden,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garden'] });
    },
  });
}

export function useGardenMessages() {
  return useQuery({
    queryKey: ['garden-messages'],
    queryFn: getGardenMessages,
  });
}

export function useMarkMessageRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markMessageRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garden-messages'] });
    },
  });
}
