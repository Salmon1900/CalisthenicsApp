import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../utils/queryKeys';
import { getExercises } from '../utils/digitalCoachClient';
import { matchAppExercises, type MatchedExercise } from '../utils/digitalCoachExercises';
import { useExercises } from './useExercises';

interface UseDigitalCoachExercisesReturn {
  matched: MatchedExercise[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * App exercises paired with whether the DigitalCoach service can analyze each one
 * (matched against the live `/exercises` list). Drives the picker.
 */
export function useDigitalCoachExercises(): UseDigitalCoachExercisesReturn {
  const appExercises = useExercises();
  const service = useQuery({
    queryKey: queryKeys.digitalCoach.exercises(),
    queryFn: getExercises,
  });

  const error = appExercises.error ?? service.error ?? null;
  if (error) {
    console.error('Error loading Digital Coach exercises:');
    console.error(error);
    console.error('App exercises error:');
    console.error(appExercises.error);
    console.error('Service exercises error:');
    console.error(service.error);
  }

  return {
    matched: matchAppExercises(appExercises.exercises, service.data ?? []),
    loading: appExercises.loading || service.isPending,
    error,
    refetch: async () => {
      await Promise.all([appExercises.refetch(), service.refetch()]);
    },
  };
}
