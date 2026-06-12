# Smart Edit Plan — Design Spec

**Date:** 2026-06-12
**Status:** Approved

---

## Overview

A "Smart Edit" feature for the Plan Detail screen. The user taps an AI-branded button, types a freeform request to a professional calisthenics trainer AI, and the plan's exercises are immediately updated. An undo banner allows reverting the change without leaving the screen.

---

## UI / UX

### Smart Edit Button
- Placed in the `headerActions` row of `PlanDetailScreen`, alongside the existing Edit and Delete buttons.
- Label: "Smart Edit" with a ★ sparkle icon prefix.
- Styled with `theme.colors.accent` (purple) to distinguish it as an AI feature.
- Hidden when `locked={true}`.

### SmartEditModal (`components/features/plans/SmartEditModal.tsx`)
- Follows the same modal structure as `CreatePlanModal` (dark card, backdrop, fade animation).
- Title: "Smart Edit"
- Subtitle: "Tell the AI trainer what to change"
- Multiline `TextInput` with rotating placeholder text cycling through:
  - "Make the plan easier"
  - "I don't have access to a pull-up bar today, adapt the plan"
  - "Add more pulling exercises"
  - "Make the last two exercises harder"
- "Apply" button (accent color) — triggers the edge function call.
- "Cancel" button — closes modal, clears input.
- While loading: Apply button shows a spinner, input is disabled.
- On error: error message shown below the input, Apply re-enabled.

### Undo Banner
- Appears at the top of the plan exercise list after a successful Smart Edit.
- Text: "Plan updated by AI · **Undo**" with a dismiss × button.
- Disappears when any of the following occur:
  - User taps "Undo" (restores previous state)
  - User taps × (dismisses without reverting)
  - User navigates away from the screen
  - User taps "Start Workout"

---

## Backend — Edge Function

**Path:** `supabase/functions/smart-edit-plan/index.ts`

### Request
```json
{ "plan_id": "<uuid>", "user_request": "<free text>" }
```

### Processing Steps
1. Read the current plan's exercises from `workout_plan_exercises` joined with `exercises` (id, name, difficulty, type, quantity, sets, rest_seconds).
2. Fetch all available exercises from the `exercises` table to give the AI options to choose from.
3. Build a prompt that:
   - Establishes the AI as a professional calisthenics personal trainer.
   - Provides the current exercise list with sets/reps/rest.
   - States the user's request verbatim.
   - Instructs Claude to return a JSON array of the new exercise configuration (same schema as `generate-plan`: `exercise_id`, `quantity`, `sets`, `order_index`).
4. Call Claude Haiku (`claude-haiku-4-5-20251001`) using `ANTHROPIC_API_KEY`.
5. Parse and validate the JSON response — all `exercise_id`s must exist in the available exercises table.
6. Replace the plan's exercises: delete all existing `workout_plan_exercises` for the plan, insert the new set.
7. Return `{ exercises: [...] }`.

### Response
```json
{ "exercises": [ { "exercise_id": "...", "quantity": 12, "sets": 3, "order_index": 0 }, ... ] }
```

### Error handling
- 400 if `plan_id` or `user_request` missing.
- 502 if Claude returns unparseable JSON or no valid exercise IDs.
- 500 for DB errors.

---

## Client-Side Architecture

### New Files
| File | Purpose |
|------|---------|
| `components/features/plans/SmartEditModal.tsx` | Modal UI component |
| `supabase/functions/smart-edit-plan/index.ts` | Supabase edge function |
| `hooks/useSmartEdit.ts` | Edge function call, loading state, error handling |

### Modified Files
| File | Change |
|------|--------|
| `screens/PlanDetailScreen.tsx` | Smart Edit button, SmartEditModal, undo banner state + logic |
| `utils/queryFunctions.ts` | Add `replacePlanExercises(planId, exercises)` helper |

### Data Flow
1. User taps Smart Edit → `showSmartEdit` state → modal opens.
2. User types request → taps Apply.
3. `useSmartEdit` snapshots current `planExercises` into local state.
4. Calls edge function with `{ plan_id, user_request }`.
5. On success: modal closes, `refetch(plan.id)` refreshes list, undo banner shown.
6. On undo: `replacePlanExercises` deletes current exercises and re-inserts the snapshot, then `refetch(plan.id)`. Banner dismissed.
7. On error: modal stays open, error message displayed below input.

### Undo Mechanism (client-side only)
- No server-side undo endpoint needed.
- Snapshot is the `planExercises` array (including `exercise_id`, `quantity`, `sets`, `set_reps`, `rest_seconds`, `order_index`) captured immediately before the edge function call.
- `replacePlanExercises` in `queryFunctions.ts`: deletes all `workout_plan_exercises` for the plan by plan ID, then bulk-inserts the snapshot rows.
- Snapshot is discarded (set to `null`) when the undo banner is dismissed.

---

## Constraints & Non-Goals
- Smart Edit only modifies exercises — not the plan name or description.
- Smart Edit is not available for locked plans.
- No preview step — changes apply immediately.
- Undo is in-memory only; if the app is killed, undo is lost (acceptable).
