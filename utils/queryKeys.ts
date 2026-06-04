export const queryKeys = {
  exercises: {
    all: () => ['exercises'] as const,
  },
  plans: {
    all: () => ['plans'] as const,
  },
  planExercises: {
    byPlan: (planId: string) => ['planExercises', planId] as const,
  },
  workouts: {
    all: () => ['workouts'] as const,
  },
};
