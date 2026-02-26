import { useQuery } from '@tanstack/react-query';
import { getProgress, getProgressStats } from '../lib/api';

export function useProgress() {
  return useQuery({
    queryKey: ['progress'],
    queryFn: getProgress,
  });
}

export function useProgressStats() {
  return useQuery({
    queryKey: ['progress-stats'],
    queryFn: getProgressStats,
  });
}
