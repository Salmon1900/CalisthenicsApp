import { useMutation } from '@tanstack/react-query';
import { analyze } from '../utils/digitalCoachClient';
import { DigitalCoachError, type AnalysisResponse } from '../types/digitalCoach';

interface AnalyzeArgs {
  exerciseName: string;
  videoUri: string;
}

interface UseAnalyzeVideoReturn {
  analyzing: boolean;
  result: AnalysisResponse | undefined;
  error: DigitalCoachError | null;
  run: (args: AnalyzeArgs) => void;
}

function toDigitalCoachError(error: unknown): DigitalCoachError | null {
  if (!error) return null;
  if (error instanceof DigitalCoachError) return error;
  return new DigitalCoachError('server', 'Something went wrong. Please try again.');
}

/**
 * Wraps the analyze call with idle/loading/success/error states. `analyzing`
 * guards the UI from double-submitting the long synchronous request.
 */
export function useAnalyzeVideo(): UseAnalyzeVideoReturn {
  const mutation = useMutation({
    mutationFn: ({ exerciseName, videoUri }: AnalyzeArgs) => analyze(exerciseName, videoUri),
  });

  return {
    analyzing: mutation.isPending,
    result: mutation.data,
    error: toDigitalCoachError(mutation.error),
    run: (args) => {
      if (mutation.isPending) return;
      mutation.mutate(args);
    },
  };
}
