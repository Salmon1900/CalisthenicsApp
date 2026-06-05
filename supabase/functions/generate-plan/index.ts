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

interface ExerciseInput {
  id: string;
  name: string;
  difficulty: number;
  type: string;
}

interface GeneratePlanRequest {
  goals: string;
  injuries?: string;
  exercises: ExerciseInput[];
}

interface GeneratedExercise {
  exercise_id: string;
  quantity: number;
  order_index: number;
}

interface GeneratedPlan {
  name: string;
  description: string;
  exercises: GeneratedExercise[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { goals, injuries, exercises }: GeneratePlanRequest = await req.json();

    if (!goals || !exercises?.length) {
      return new Response(
        JSON.stringify({ error: 'goals and exercises are required' }),
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

    const exerciseList = exercises
      .map((e) => `${e.id} | ${e.name} | ${DIFFICULTY_LABELS[e.difficulty] ?? e.difficulty} | ${e.type}`)
      .join('\n');

    const prompt = `You are an expert calisthenics coach. Create a personalized workout plan.

User goals: ${goals}
Injuries/limitations: ${injuries || 'none'}

Available exercises (you MUST only use exercises from this list, using their exact IDs):
id | name | difficulty | type
${exerciseList}

Return ONLY a valid JSON object with no markdown, no explanation, no code fences:
{
  "name": "short descriptive plan name",
  "description": "1-2 sentence description of the plan",
  "exercises": [
    { "exercise_id": "<exact uuid from list>", "quantity": <number>, "order_index": <0-based index> }
  ]
}

Choose 4-8 exercises appropriate for the goals and difficulty level. For reps type use rep counts (5-20), for timed type use seconds (20-60).`;

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

    let plan: GeneratedPlan;
    try {
      // Strip any accidental markdown fences before parsing
      const cleaned = rawText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      plan = JSON.parse(cleaned);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Failed to parse Claude response', raw: rawText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Validate exercise IDs against the provided list
    const validIds = new Set(exercises.map((e) => e.id));
    const validExercises = plan.exercises.filter((e) => validIds.has(e.exercise_id));

    if (!validExercises.length) {
      return new Response(
        JSON.stringify({ error: 'Claude returned no valid exercise IDs' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Save to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const db = createClient(supabaseUrl, supabaseKey);

    const { data: newPlan, error: planError } = await db
      .from('workout_plans')
      .insert({ name: plan.name, description: plan.description })
      .select()
      .single();

    if (planError || !newPlan) {
      return new Response(
        JSON.stringify({ error: planError?.message ?? 'Failed to insert plan' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const planExercises = validExercises.map((e, i) => ({
      workout_plan_id: newPlan.id,
      exercise_id: e.exercise_id,
      order_index: i,
      quantity: e.quantity,
    }));

    const { error: exError } = await db.from('workout_plan_exercises').insert(planExercises);
    if (exError) {
      return new Response(
        JSON.stringify({ error: exError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ plan: newPlan }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
