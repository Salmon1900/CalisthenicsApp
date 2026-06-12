export const queryKeys = {
  exercises: {
    all: () => ['exercises'] as const,
    byNames: (names: readonly string[]) =>
      ['exercises', 'byNames', [...names].sort().join('|')] as const,
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
  progressMap: {
    byUser: (userId: string) => ['progressMap', userId] as const,
  },
  digitalCoach: {
    exercises: () => ['digitalCoach', 'exercises'] as const,
  },
};
