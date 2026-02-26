import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitExerciseAttempt, skipExercise } from '../lib/api';

export function useSubmitAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      exerciseId,
      data,
    }: {
      exerciseId: number;
      data: {
        userResponse: string;
        audioRecordingUrl?: string;
        attemptDuration?: number;
      };
    }) => submitExerciseAttempt(exerciseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['levels'] });
    },
  });
}

export function useSkipExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exerciseId: number) => skipExercise(exerciseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}
