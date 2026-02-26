import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLevels, getLevel, getLevelExercises, startLevel } from '../lib/api';

export function useLevels() {
  return useQuery({
    queryKey: ['levels'],
    queryFn: getLevels,
  });
}

export function useLevel(id: number | undefined) {
  return useQuery({
    queryKey: ['level', id],
    queryFn: () => getLevel(id!),
    enabled: !!id,
  });
}

export function useLevelExercises(id: number | undefined) {
  return useQuery({
    queryKey: ['level-exercises', id],
    queryFn: () => getLevelExercises(id!),
    enabled: !!id,
  });
}

export function useStartLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => startLevel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}
