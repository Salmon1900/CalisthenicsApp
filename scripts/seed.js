const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  env.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([^#][^=\s]*)\s*=\s*(.*)\s*$/);
    if (m) {
      const key = m[1];
      let val = m[2] || '';
      // remove surrounding quotes
      if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
} else {
  console.warn('.env.local not found; relying on environment variables');
}

async function run() {
  const { createClient } = require('@supabase/supabase-js');
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('Missing Supabase credentials. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(url, key);

  const rows = [
    {
      name: 'Push-up',
      description:
        'A foundational bodyweight pressing exercise performed from a plank, lowering the chest to the ground and pressing back up to strengthen the chest, shoulders, triceps, and core.',
      difficulty: 'beginner',
    },
    {
      name: 'Pull-up',
      description:
        'A vertical pulling exercise performed by hanging from a bar and pulling the chin above it, emphasizing the lats, biceps, and upper back; often progressed with band assists or negatives.',
      difficulty: 'intermediate',
    },
    {
      name: 'Muscle-up',
      description:
        'An advanced compound movement combining an explosive pull-up with a transition into a dip above the bar or rings; requires high pulling power, coordination, and dip strength.',
      difficulty: 'advanced',
    },
  ];

  try {
    console.log('Inserting seed rows into Supabase...');
    const { data, error } = await supabase.from('exercises').insert(rows).select();
    if (error) {
      console.error('Insert error:', error);
      process.exit(2);
    }
    console.log('Inserted rows:', data);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(3);
  }
}

run();
