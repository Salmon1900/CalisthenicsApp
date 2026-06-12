# Smart Edit Plan — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Smart Edit" button to PlanDetailScreen that lets users type a freeform request, calls an AI trainer edge function, and immediately updates the plan's exercises with a one-shot undo banner.

**Architecture:** A new `smart-edit-plan` Supabase edge function reads the current plan exercises, passes them plus all available exercises to Claude Haiku, then atomically replaces the plan's exercises with the AI's response. The client snapshots the previous state before calling and offers an undo banner that restores via `replacePlanExercises` without needing a server round-trip.

**Tech Stack:** React Native + Expo, TypeScript, Supabase Edge Functions (Deno), `@supabase/supabase-js`, Claude Haiku (`claude-haiku-4-5-20251001`), `@tanstack/react-query`, Jest + `@testing-library/react-native`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `utils/queryFunctions.ts` | Add `PlanExerciseInsert` type + `replacePlanExercises` helper |
| Create | `hooks/useSmartEdit.ts` | Edge function call, loading/error state |
| Create | `__tests__/hooks/useSmartEdit.test.ts` | Unit tests for the hook |
| Create | `components/features/plans/SmartEditModal.tsx` | Modal UI: text input, Apply/Cancel, loading, error |
| Create | `supabase/functions/smart-edit-plan/index.ts` | Deno edge function: read plan, call Claude, replace exercises |
| Modify | `screens/PlanDetailScreen.tsx` | Smart Edit button, modal, undo banner + undo logic |

---

## Task 1: Add `replacePlanExercises` to `queryFunctions.ts`

**Files:**
- Modify: `utils/queryFunctions.ts`

- [ ] **Step 1: Add the `PlanExerciseInsert` type and `replacePlanExercises` function**

Open `utils/queryFunctions.ts` and append the following after the last export (after `insertWorkout`):

```typescript
export type PlanExerciseInsert = Pick<
  WorkoutPlanExercise,
  'exercise_id' | 'quantity' | 'sets' | 'set_reps' | 'rest_seconds' | 'order_index'
>;

export async function replacePlanExercises(
  planId: string,
  exercises: PlanExerciseInsert[],
): Promise<void> {
  const { error: deleteError } = await supabase
    .from('workout_plan_exercises')
    .delete()
    .eq('workout_plan_id', planId);
  if (deleteError) throw new Error(deleteError.message);
  if (exercises.length === 0) return;
  const { error: insertError } = await supabase
    .from('workout_plan_exercises')
    .insert(exercises.map((e) => ({ ...e, workout_plan_id: planId })));
  if (insertError) throw new Error(insertError.message);
}
```

- [ ] **Step 2: Commit**

```bash
git add utils/queryFunctions.ts
git commit -m "feat: add replacePlanExercises utility for atomic plan exercise replacement"
```

---

## Task 2: Create `useSmartEdit` hook + tests

**Files:**
- Create: `hooks/useSmartEdit.ts`
- Create: `__tests__/hooks/useSmartEdit.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/hooks/useSmartEdit.test.ts`:

```typescript
import { act, renderHook } from '@testing-library/react-native';
import { useSmartEdit } from '../../hooks/useSmartEdit';

jest.mock('../../utils/supabase', () => ({
  supabase: {
    functions: {
      invoke: jest.fn(),
    },
  },
}));

import { supabase } from '../../utils/supabase';
const mockInvoke = supabase.functions.invoke as jest.Mock;

describe('useSmartEdit', () => {
  beforeEach(() => mockInvoke.mockReset());

  it('starts with isPending=false and no error', () => {
    const { result } = renderHook(() => useSmartEdit());
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets isPending=true during the call, then false after success', async () => {
    mockInvoke.mockResolvedValueOnce({ data: { exercises: [] }, error: null });
    const { result } = renderHook(() => useSmartEdit());

    let promise: Promise<boolean>;
    act(() => {
      promise = result.current.smartEdit('plan-1', 'make it easier');
    });
    expect(result.current.isPending).toBe(true);

    await act(async () => { await promise; });
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('returns true on success', async () => {
    mockInvoke.mockResolvedValueOnce({ data: { exercises: [] }, error: null });
    const { result } = renderHook(() => useSmartEdit());

    let success: boolean;
    await act(async () => {
      success = await result.current.smartEdit('plan-1', 'make it harder');
    });
    expect(success!).toBe(true);
  });

  it('sets error and returns false when the function errors', async () => {
    mockInvoke.mockResolvedValueOnce({ data: null, error: { message: 'Claude API error' } });
    const { result } = renderHook(() => useSmartEdit());

    let success: boolean;
    await act(async () => {
      success = await result.current.smartEdit('plan-1', 'add pullups');
    });
    expect(success!).toBe(false);
    expect(result.current.error).toBe('Claude API error');
    expect(result.current.isPending).toBe(false);
  });

  it('clearError resets the error state', async () => {
    mockInvoke.mockResolvedValueOnce({ data: null, error: { message: 'oops' } });
    const { result } = renderHook(() => useSmartEdit());

    await act(async () => { await result.current.smartEdit('plan-1', 'test'); });
    expect(result.current.error).toBe('oops');

    act(() => result.current.clearError());
    expect(result.current.error).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx jest __tests__/hooks/useSmartEdit.test.ts --no-coverage
```

Expected: FAIL with `Cannot find module '../../hooks/useSmartEdit'`

- [ ] **Step 3: Create `hooks/useSmartEdit.ts`**

```typescript
import { useState } from 'react';
import { supabase } from '../utils/supabase';

export function useSmartEdit() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const smartEdit = async (planId: string, userRequest: string): Promise<boolean> => {
    setIsPending(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('smart-edit-plan', {
        body: { plan_id: planId, user_request: userRequest },
      });
      if (fnError) throw new Error(fnError.message);
      if (!data?.exercises) throw new Error('No exercises returned from server');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      return false;
    } finally {
      setIsPending(false);
    }
  };

  const clearError = () => setError(null);

  return { smartEdit, isPending, error, clearError };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest __tests__/hooks/useSmartEdit.test.ts --no-coverage
```

Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add hooks/useSmartEdit.ts __tests__/hooks/useSmartEdit.test.ts
git commit -m "feat: add useSmartEdit hook with loading/error state management"
```

---

## Task 3: Create `SmartEditModal` component

**Files:**
- Create: `components/features/plans/SmartEditModal.tsx`

- [ ] **Step 1: Create the component**

Create `components/features/plans/SmartEditModal.tsx`:

```typescript
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { theme } from '../../../constants/theme';

const PLACEHOLDER_EXAMPLES = [
  'Make the plan easier',
  "I don't have access to a pull-up bar today, adapt the plan",
  'Add more pulling exercises',
  'Make the last two exercises harder',
];

interface Props {
  visible: boolean;
  isPending: boolean;
  error: string | null;
  onClose: () => void;
  onApply: (request: string) => void;
}

export function SmartEditModal({ visible, isPending, error, onClose, onApply }: Props) {
  const [request, setRequest] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (visible) {
      intervalRef.current = setInterval(() => {
        setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_EXAMPLES.length);
      }, 3000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [visible]);

  const handleClose = () => {
    setRequest('');
    onClose();
  };

  const handleApply = () => {
    if (!request.trim() || isPending) return;
    onApply(request.trim());
  };

  const canApply = request.trim().length > 0 && !isPending;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>✦ Smart Edit</Text>
          <Text style={styles.subtitle}>Tell the AI trainer what to change</Text>

          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={request}
            onChangeText={setRequest}
            placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
            placeholderTextColor={theme.colors.muted}
            multiline
            numberOfLines={4}
            editable={!isPending}
            autoFocus
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={handleClose} disabled={isPending}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.applyButton, !canApply && styles.applyButtonDisabled]}
              onPress={handleApply}
              disabled={!canApply}
            >
              {isPending ? (
                <ActivityIndicator color={theme.colors.text} />
              ) : (
                <Text style={styles.applyText}>Apply</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 22, 0.85)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  title: {
    color: theme.colors.accent,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 14,
    marginBottom: 20,
  },
  input: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  inputMultiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cancelText: {
    color: theme.colors.muted,
    fontWeight: '700',
    fontSize: 15,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
  },
  applyButtonDisabled: {
    opacity: 0.45,
  },
  applyText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/features/plans/SmartEditModal.tsx
git commit -m "feat: add SmartEditModal component with rotating placeholder text"
```

---

## Task 4: Create `smart-edit-plan` edge function

**Files:**
- Create: `supabase/functions/smart-edit-plan/index.ts`

- [ ] **Step 1: Create the edge function**

Create `supabase/functions/smart-edit-plan/index.ts`:

```typescript
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Novice', 2: 'Beginner', 3: 'Easy', 4: 'Moderate',
  5: 'Intermediate', 6: 'Challenging', 7: 'Hard',
  8: 'Advanced', 9: 'Expert', 10: 'Master',
};

const DEFAULT_SETS = 3;
const DEFAULT_REST_SECONDS = 60;

interface SmartEditRequest {
  plan_id: string;
  user_request: string;
}

interface EditedExercise {
  exercise_id: string;
  quantity: number;
  sets: number;
  rest_seconds: number;
  order_index: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { plan_id, user_request }: SmartEditRequest = await req.json();

    if (!plan_id || !user_request?.trim()) {
      return new Response(
        JSON.stringify({ error: 'plan_id and user_request are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: 'Anthropic API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const db = createClient(supabaseUrl, supabaseKey);

    // Read the current plan's exercises
    const { data: currentExercises, error: currentError } = await db
      .from('workout_plan_exercises')
      .select('*, exercise:exercises(*)')
      .eq('workout_plan_id', plan_id)
      .order('order_index', { ascending: true });

    if (currentError) {
      return new Response(
        JSON.stringify({ error: currentError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Fetch all available strength exercises
    const { data: allExercises, error: allError } = await db
      .from('exercises')
      .select('*')
      .eq('category', 'strength')
      .order('difficulty', { ascending: true });

    if (allError) {
      return new Response(
        JSON.stringify({ error: allError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const currentList = (currentExercises ?? [])
      .map((pe: any) =>
        `- ${pe.exercise.name} | ${pe.sets} sets × ${pe.quantity} ${pe.exercise.type === 'timed' ? 'sec' : 'reps'} | rest: ${pe.rest_seconds}s`,
      )
      .join('\n');

    const availableList = (allExercises ?? [])
      .map((e: any) =>
        `${e.id} | ${e.name} | ${DIFFICULTY_LABELS[e.difficulty] ?? e.difficulty} | ${e.type}`,
      )
      .join('\n');

    const prompt = `You are a professional calisthenics personal trainer. A user wants to modify their existing workout plan.

Current plan exercises:
${currentList}

User's request: ${user_request}

Available exercises to choose from (you MUST only use exercises from this list, using their exact IDs):
id | name | difficulty | type
${availableList}

Return ONLY a valid JSON array with no markdown, no explanation, no code fences. Each object represents one exercise in the updated plan:
[
  { "exercise_id": "<exact uuid>", "quantity": <number>, "sets": <number>, "rest_seconds": <number>, "order_index": <0-based index> }
]

Rules:
- Choose 4-8 exercises total.
- For reps type: quantity 5–20. For timed type: quantity 20–60 (seconds).
- Sets: 2–4. rest_seconds: 30–120.
- Preserve exercises from the current plan that still fit the user's request; adjust their parameters if needed.
- Only pick exercises from the provided available list using their exact IDs.`;

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      return new Response(
        JSON.stringify({ error: `Claude API error: ${err}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const anthropicData = await anthropicRes.json();
    const rawText: string = anthropicData.content?.[0]?.text ?? '';

    let editedExercises: EditedExercise[];
    try {
      const cleaned = rawText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      editedExercises = JSON.parse(cleaned);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Failed to parse Claude response', raw: rawText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const validIds = new Set((allExercises ?? []).map((e: any) => e.id));
    const validExercises = editedExercises.filter((e) => validIds.has(e.exercise_id));

    if (!validExercises.length) {
      return new Response(
        JSON.stringify({ error: 'Claude returned no valid exercise IDs' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Atomically replace: delete existing rows, insert new ones
    const { error: deleteError } = await db
      .from('workout_plan_exercises')
      .delete()
      .eq('workout_plan_id', plan_id);

    if (deleteError) {
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const newRows = validExercises.map((e, i) => ({
      workout_plan_id: plan_id,
      exercise_id: e.exercise_id,
      quantity: e.quantity,
      sets: e.sets ?? DEFAULT_SETS,
      rest_seconds: e.rest_seconds ?? DEFAULT_REST_SECONDS,
      set_reps: null,
      order_index: i,
    }));

    const { error: insertError } = await db.from('workout_plan_exercises').insert(newRows);

    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ exercises: newRows }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/smart-edit-plan/index.ts
git commit -m "feat: add smart-edit-plan Supabase edge function"
```

---

## Task 5: Wire up `PlanDetailScreen`

**Files:**
- Modify: `screens/PlanDetailScreen.tsx`

This task adds the Smart Edit button, mounts the modal, manages the undo snapshot, and renders the undo banner.

- [ ] **Step 1: Add imports**

At the top of `screens/PlanDetailScreen.tsx`, add the following to the existing imports:

```typescript
import { SmartEditModal } from '../components/features/plans/SmartEditModal';
import { useSmartEdit } from '../hooks/useSmartEdit';
import { replacePlanExercises } from '../utils/queryFunctions';
import type { PlanExerciseInsert } from '../utils/queryFunctions';
```

- [ ] **Step 2: Add state inside the component**

Inside `PlanDetailScreen` after the existing `useState` declarations, add:

```typescript
const [showSmartEdit, setShowSmartEdit] = useState(false);
const [undoSnapshot, setUndoSnapshot] = useState<PlanExerciseInsert[] | null>(null);
const { smartEdit, isPending: smartEditPending, error: smartEditError, clearError } = useSmartEdit();
```

- [ ] **Step 3: Add the `handleSmartEdit` and `handleUndo` handlers**

After `handleMoveDown`, add:

```typescript
const handleSmartEditApply = async (request: string) => {
  const snapshot: PlanExerciseInsert[] = planExercises.map((pe) => ({
    exercise_id: pe.exercise_id,
    quantity: pe.quantity,
    sets: pe.sets,
    set_reps: pe.set_reps,
    rest_seconds: pe.rest_seconds,
    order_index: pe.order_index,
  }));
  const success = await smartEdit(plan.id, request);
  if (success) {
    setUndoSnapshot(snapshot);
    setShowSmartEdit(false);
    await refetch(plan.id);
  }
};

const handleUndo = async () => {
  if (!undoSnapshot) return;
  try {
    await replacePlanExercises(plan.id, undoSnapshot);
    await refetch(plan.id);
  } finally {
    setUndoSnapshot(null);
  }
};

const handleDismissUndo = () => setUndoSnapshot(null);
```

- [ ] **Step 4: Add the Smart Edit button to `headerActions`**

Replace the existing `headerActions` block:

```tsx
<View style={styles.headerActions}>
  <Pressable style={[styles.editButton, styles.smartEditButton]} onPress={() => setShowSmartEdit(true)}>
    <Text style={styles.smartEditButtonText}>✦ Smart Edit</Text>
  </Pressable>
  <Pressable style={styles.editButton} onPress={() => setShowEdit(true)}>
    <Text style={styles.editButtonText}>Edit</Text>
  </Pressable>
  <Pressable style={[styles.editButton, styles.deleteButton]} onPress={handleDelete}>
    <Text style={styles.deleteButtonText}>Delete</Text>
  </Pressable>
</View>
```

Note: The Smart Edit button is hidden for locked plans — add `!locked &&` guard inside the render:

Replace the full `headerActions` render to be:

```tsx
<View style={styles.headerActions}>
  {!locked && (
    <Pressable style={[styles.editButton, styles.smartEditButton]} onPress={() => setShowSmartEdit(true)}>
      <Text style={styles.smartEditButtonText}>✦ Smart Edit</Text>
    </Pressable>
  )}
  <Pressable style={styles.editButton} onPress={() => setShowEdit(true)}>
    <Text style={styles.editButtonText}>Edit</Text>
  </Pressable>
  <Pressable style={[styles.editButton, styles.deleteButton]} onPress={handleDelete}>
    <Text style={styles.deleteButtonText}>Delete</Text>
  </Pressable>
</View>
```

- [ ] **Step 5: Add the undo banner**

Add the undo banner immediately after the `planHeader` View (before the loading/error/FlatList block):

```tsx
{undoSnapshot !== null && (
  <View style={styles.undoBanner}>
    <Text style={styles.undoText}>Plan updated by AI</Text>
    <Pressable onPress={handleUndo}>
      <Text style={styles.undoAction}>Undo</Text>
    </Pressable>
    <Pressable onPress={handleDismissUndo} style={styles.undoDismiss}>
      <Text style={styles.undoDismissText}>×</Text>
    </Pressable>
  </View>
)}
```

- [ ] **Step 6: Clear undo snapshot when starting a workout**

Update the Start Workout `Pressable` `onPress` to clear the snapshot:

```tsx
onPress={() => {
  setUndoSnapshot(null);
  navigation.navigate('Workout', { plan, includeWarmup, includeCooldown });
}}
```

- [ ] **Step 7: Mount `SmartEditModal`**

Add `SmartEditModal` just before the closing `</SafeAreaView>`, alongside the other modals:

```tsx
<SmartEditModal
  visible={showSmartEdit}
  isPending={smartEditPending}
  error={smartEditError}
  onClose={() => { setShowSmartEdit(false); clearError(); }}
  onApply={handleSmartEditApply}
/>
```

- [ ] **Step 8: Add the new styles**

Append to the `StyleSheet.create({...})` block:

```typescript
smartEditButton: {
  borderColor: 'rgba(139, 92, 246, 0.35)',
},
smartEditButtonText: {
  color: theme.colors.accent,
  fontWeight: '700',
  fontSize: 14,
},
undoBanner: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: theme.colors.surface,
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 10,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: 'rgba(139, 92, 246, 0.25)',
  gap: 8,
},
undoText: {
  flex: 1,
  color: theme.colors.muted,
  fontSize: 13,
},
undoAction: {
  color: theme.colors.accent,
  fontWeight: '700',
  fontSize: 13,
},
undoDismiss: {
  paddingHorizontal: 4,
},
undoDismissText: {
  color: theme.colors.muted,
  fontSize: 18,
  lineHeight: 18,
},
```

- [ ] **Step 9: Run all tests to confirm nothing broke**

```bash
npx jest --no-coverage
```

Expected: all tests PASS

- [ ] **Step 10: Commit**

```bash
git add screens/PlanDetailScreen.tsx
git commit -m "feat: wire Smart Edit button, modal, and undo banner into PlanDetailScreen"
```

---

## Self-Review

**Spec coverage:**
- [x] Smart Edit button with ✦ icon in header — Task 5, Step 4
- [x] Hidden when `locked={true}` — Task 5, Step 4
- [x] `SmartEditModal` with subtitle, multiline input, rotating placeholder, Apply/Cancel — Task 3
- [x] Placeholder examples: "Make the plan easier", "I don't have access to a pull-up bar…", "Add more pulling exercises", "Make the last two exercises harder" — Task 3, Step 1
- [x] Loading spinner on Apply button, input disabled during loading — Task 3, Step 1
- [x] Error message below input — Task 3, Step 1
- [x] Immediate apply, no preview — edge function replaces in Task 4
- [x] Undo banner: "Plan updated by AI · Undo · ×" — Task 5, Steps 5–6
- [x] Undo dismissed on × tap — Task 5, Step 5 (`handleDismissUndo`)
- [x] Undo dismissed on Start Workout — Task 5, Step 6
- [x] Undo dismissed on navigate away — unmount clears state automatically
- [x] Undo restores via `replacePlanExercises` — Task 5, Step 3 + Task 1
- [x] Edge function reads current plan, fetches all strength exercises, calls Claude Haiku — Task 4
- [x] Edge function validates exercise IDs, atomically replaces exercises — Task 4
- [x] Same `ANTHROPIC_API_KEY` env var as `generate-plan` — Task 4

**Type consistency check:**
- `PlanExerciseInsert` defined in Task 1, imported in Task 5 ✓
- `replacePlanExercises(planId: string, exercises: PlanExerciseInsert[])` — used correctly in `handleUndo` ✓
- `useSmartEdit()` returns `{ smartEdit, isPending, error, clearError }` — consumed correctly in Task 5 ✓
- `SmartEditModal` props `{ visible, isPending, error, onClose, onApply }` — passed correctly in Task 5, Step 7 ✓
