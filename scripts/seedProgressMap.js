const fs = require('fs');
const path = require('path');

// Load .env.local manually (same pattern as seed.js)
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  env.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([^#][^=\s]*)\s*=\s*(.*)\s*$/);
    if (m) {
      let val = m[2] || '';
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[m[1]] = val;
    }
  });
}

// 70 plans: 7 chapters of 10 levels each.
// Boss levels: 10, 20, 30, 40, 50, 60, 70
const PLANS = [
  // ─── Chapter 1: The Foundation (Levels 1–10) ───
  {
    level: 1, is_boss: false, name: 'First Steps',
    description: 'Your very first workout. Three simple movements to get your body moving.',
    exercises: [{ name: 'Push-up', qty: 5 }, { name: 'Squat', qty: 8 }, { name: 'Plank', qty: 15 }],
  },
  {
    level: 2, is_boss: false, name: 'Moving Stronger',
    description: 'Add glute work to your foundation routine.',
    exercises: [{ name: 'Push-up', qty: 7 }, { name: 'Squat', qty: 10 }, { name: 'Plank', qty: 20 }, { name: 'Glute Bridge', qty: 8 }],
  },
  {
    level: 3, is_boss: false, name: 'Building Habits',
    description: 'Introduce the hollow body hold for core awareness.',
    exercises: [{ name: 'Push-up', qty: 8 }, { name: 'Squat', qty: 12 }, { name: 'Plank', qty: 25 }, { name: 'Hollow Body Hold', qty: 15 }],
  },
  {
    level: 4, is_boss: false, name: 'Core Awakening',
    description: 'Build foundational pushing and lower body strength.',
    exercises: [{ name: 'Push-up', qty: 10 }, { name: 'Squat', qty: 14 }, { name: 'Plank', qty: 30 }, { name: 'Glute Bridge', qty: 12 }],
  },
  {
    level: 5, is_boss: false, name: 'Rising Momentum',
    description: 'Add cardio-conditioning with mountain climbers.',
    exercises: [{ name: 'Push-up', qty: 12 }, { name: 'Squat', qty: 15 }, { name: 'Plank', qty: 30 }, { name: 'Hollow Body Hold', qty: 20 }, { name: 'Mountain Climber', qty: 20 }],
  },
  {
    level: 6, is_boss: false, name: 'Daily Grind',
    description: 'Longer holds and more reps — consistency is the goal.',
    exercises: [{ name: 'Push-up', qty: 13 }, { name: 'Squat', qty: 16 }, { name: 'Plank', qty: 35 }, { name: 'Glute Bridge', qty: 12 }, { name: 'Mountain Climber', qty: 25 }],
  },
  {
    level: 7, is_boss: false, name: 'Consistency Wins',
    description: 'Add tricep dips for pressing variety.',
    exercises: [{ name: 'Push-up', qty: 14 }, { name: 'Squat', qty: 18 }, { name: 'Plank', qty: 40 }, { name: 'Hollow Body Hold', qty: 25 }, { name: 'Tricep Dip (Bench)', qty: 8 }],
  },
  {
    level: 8, is_boss: false, name: 'Strength Rising',
    description: 'Increased volume across the board.',
    exercises: [{ name: 'Push-up', qty: 15 }, { name: 'Squat', qty: 20 }, { name: 'Plank', qty: 45 }, { name: 'Glute Bridge', qty: 15 }, { name: 'Mountain Climber', qty: 30 }],
  },
  {
    level: 9, is_boss: false, name: 'Almost There',
    description: 'One step away from the foundation boss. Push through.',
    exercises: [{ name: 'Push-up', qty: 17 }, { name: 'Squat', qty: 22 }, { name: 'Plank', qty: 50 }, { name: 'Hollow Body Hold', qty: 30 }, { name: 'Tricep Dip (Bench)', qty: 12 }],
  },
  {
    level: 10, is_boss: true, name: 'Foundation Mastery',
    description: 'The first boss. Prove you have mastered the beginner foundation.',
    exercises: [{ name: 'Push-up', qty: 20 }, { name: 'Squat', qty: 25 }, { name: 'Plank', qty: 60 }, { name: 'Hollow Body Hold', qty: 30 }, { name: 'Tricep Dip (Bench)', qty: 15 }, { name: 'Mountain Climber', qty: 30 }],
  },

  // ─── Chapter 2: Rising Up (Levels 11–20) ───
  {
    level: 11, is_boss: false, name: 'New Pulls',
    description: 'Introduce horizontal pulling with inverted rows.',
    exercises: [{ name: 'Push-up', qty: 16 }, { name: 'Squat', qty: 20 }, { name: 'Inverted Row', qty: 8 }, { name: 'Plank', qty: 30 }],
  },
  {
    level: 12, is_boss: false, name: 'Back Basics',
    description: 'Build pulling endurance and core control.',
    exercises: [{ name: 'Push-up', qty: 17 }, { name: 'Squat', qty: 20 }, { name: 'Inverted Row', qty: 10 }, { name: 'Plank', qty: 35 }, { name: 'Hollow Body Hold', qty: 20 }],
  },
  {
    level: 13, is_boss: false, name: 'Shoulder Shape',
    description: 'Pike push-ups begin the journey toward pressing overhead.',
    exercises: [{ name: 'Push-up', qty: 18 }, { name: 'Squat', qty: 22 }, { name: 'Inverted Row', qty: 10 }, { name: 'Pike Push-up', qty: 5 }, { name: 'Plank', qty: 40 }],
  },
  {
    level: 14, is_boss: false, name: 'Upper Body Unity',
    description: 'Push and pull in balance.',
    exercises: [{ name: 'Push-up', qty: 18 }, { name: 'Squat', qty: 22 }, { name: 'Inverted Row', qty: 12 }, { name: 'Pike Push-up', qty: 6 }, { name: 'Hollow Body Hold', qty: 25 }],
  },
  {
    level: 15, is_boss: false, name: 'Body Row Champion',
    description: 'Progress the pull to Australian pull-ups.',
    exercises: [{ name: 'Push-up', qty: 20 }, { name: 'Squat', qty: 24 }, { name: 'Australian Pull-up', qty: 8 }, { name: 'Pike Push-up', qty: 7 }, { name: 'Plank', qty: 45 }],
  },
  {
    level: 16, is_boss: false, name: 'Push-Pull Balance',
    description: 'Equal volume on push and pull.',
    exercises: [{ name: 'Push-up', qty: 20 }, { name: 'Squat', qty: 25 }, { name: 'Australian Pull-up', qty: 10 }, { name: 'Pike Push-up', qty: 8 }, { name: 'Hollow Body Hold', qty: 30 }],
  },
  {
    level: 17, is_boss: false, name: 'Shoulder Builder',
    description: 'Add posterior chain work alongside upper body.',
    exercises: [{ name: 'Push-up', qty: 22 }, { name: 'Squat', qty: 25 }, { name: 'Australian Pull-up', qty: 10 }, { name: 'Pike Push-up', qty: 9 }, { name: 'Plank', qty: 50 }, { name: 'Glute Bridge', qty: 15 }],
  },
  {
    level: 18, is_boss: false, name: 'Full Upper Pull',
    description: 'Stronger pulls and hollow body integration.',
    exercises: [{ name: 'Push-up', qty: 22 }, { name: 'Squat', qty: 26 }, { name: 'Australian Pull-up', qty: 12 }, { name: 'Pike Push-up', qty: 10 }, { name: 'Hollow Body Hold', qty: 30 }],
  },
  {
    level: 19, is_boss: false, name: 'Pre-Boss Grind',
    description: 'Final push before the beginner boss.',
    exercises: [{ name: 'Push-up', qty: 24 }, { name: 'Squat', qty: 28 }, { name: 'Australian Pull-up', qty: 13 }, { name: 'Pike Push-up', qty: 11 }, { name: 'Plank', qty: 55 }],
  },
  {
    level: 20, is_boss: true, name: 'Beginner Breakthrough',
    description: 'The beginner boss. Full volume push, pull, and press.',
    exercises: [{ name: 'Push-up', qty: 25 }, { name: 'Squat', qty: 30 }, { name: 'Australian Pull-up', qty: 15 }, { name: 'Pike Push-up', qty: 12 }, { name: 'Plank', qty: 60 }, { name: 'Hollow Body Hold', qty: 30 }],
  },

  // ─── Chapter 3: First Pull-ups (Levels 21–30) ───
  {
    level: 21, is_boss: false, name: 'Bar Grab',
    description: 'Your first real pull-ups — even 3 is a victory.',
    exercises: [{ name: 'Pull-up', qty: 3 }, { name: 'Push-up', qty: 20 }, { name: 'Parallel Bar Dip', qty: 8 }, { name: 'Pike Push-up', qty: 10 }, { name: 'Squat', qty: 25 }],
  },
  {
    level: 22, is_boss: false, name: 'Chin Over Bar',
    description: 'Build dip strength alongside pull-ups.',
    exercises: [{ name: 'Pull-up', qty: 4 }, { name: 'Push-up', qty: 20 }, { name: 'Parallel Bar Dip', qty: 9 }, { name: 'Pike Push-up', qty: 10 }, { name: 'Plank', qty: 40 }],
  },
  {
    level: 23, is_boss: false, name: 'Arms Above',
    description: 'Introduce the L-sit hold.',
    exercises: [{ name: 'Pull-up', qty: 4 }, { name: 'Push-up', qty: 22 }, { name: 'Parallel Bar Dip', qty: 10 }, { name: 'Pike Push-up', qty: 11 }, { name: 'L-Sit', qty: 10 }],
  },
  {
    level: 24, is_boss: false, name: 'Pulling Power',
    description: 'Volume increase on all upper body patterns.',
    exercises: [{ name: 'Pull-up', qty: 5 }, { name: 'Push-up', qty: 22 }, { name: 'Parallel Bar Dip', qty: 10 }, { name: 'Pike Push-up', qty: 12 }, { name: 'Squat', qty: 28 }],
  },
  {
    level: 25, is_boss: false, name: 'Halfway Hero',
    description: 'Midpoint of the journey. Steady progress.',
    exercises: [{ name: 'Pull-up', qty: 5 }, { name: 'Push-up', qty: 24 }, { name: 'Parallel Bar Dip', qty: 12 }, { name: 'Pike Push-up', qty: 12 }, { name: 'L-Sit', qty: 12 }],
  },
  {
    level: 26, is_boss: false, name: 'Rising Stronger',
    description: 'Six pull-ups — real pulling strength.',
    exercises: [{ name: 'Pull-up', qty: 6 }, { name: 'Push-up', qty: 24 }, { name: 'Parallel Bar Dip', qty: 12 }, { name: 'Pike Push-up', qty: 14 }, { name: 'Plank', qty: 50 }],
  },
  {
    level: 27, is_boss: false, name: 'Upper Power',
    description: 'Dips and L-sits working in tandem.',
    exercises: [{ name: 'Pull-up', qty: 6 }, { name: 'Push-up', qty: 25 }, { name: 'Parallel Bar Dip', qty: 13 }, { name: 'Pike Push-up', qty: 14 }, { name: 'L-Sit', qty: 15 }],
  },
  {
    level: 28, is_boss: false, name: 'Strength Compound',
    description: 'Heavy lower body added to upper volume.',
    exercises: [{ name: 'Pull-up', qty: 7 }, { name: 'Push-up', qty: 25 }, { name: 'Parallel Bar Dip', qty: 14 }, { name: 'Pike Push-up', qty: 15 }, { name: 'Squat', qty: 30 }],
  },
  {
    level: 29, is_boss: false, name: 'Almost Intermediate',
    description: 'Final prep for the intermediate entry boss.',
    exercises: [{ name: 'Pull-up', qty: 7 }, { name: 'Push-up', qty: 26 }, { name: 'Parallel Bar Dip', qty: 14 }, { name: 'Pike Push-up', qty: 15 }, { name: 'L-Sit', qty: 18 }],
  },
  {
    level: 30, is_boss: true, name: 'Strength Starter',
    description: 'The intermediate entry boss. Pulling, pressing, holding.',
    exercises: [{ name: 'Pull-up', qty: 8 }, { name: 'Push-up', qty: 30 }, { name: 'Parallel Bar Dip', qty: 15 }, { name: 'Pike Push-up', qty: 15 }, { name: 'L-Sit', qty: 20 }, { name: 'Squat', qty: 30 }],
  },

  // ─── Chapter 4: Power Building (Levels 31–40) ───
  {
    level: 31, is_boss: false, name: 'Volume Surge',
    description: 'Introduce archer push-ups for unilateral pressing.',
    exercises: [{ name: 'Pull-up', qty: 8 }, { name: 'Parallel Bar Dip', qty: 14 }, { name: 'Archer Push-up', qty: 5 }, { name: 'Pike Push-up', qty: 14 }, { name: 'Squat', qty: 30 }],
  },
  {
    level: 32, is_boss: false, name: 'Side Load',
    description: 'Unilateral pressing meets L-sit holds.',
    exercises: [{ name: 'Pull-up', qty: 8 }, { name: 'Parallel Bar Dip', qty: 14 }, { name: 'Archer Push-up', qty: 5 }, { name: 'Pike Push-up', qty: 15 }, { name: 'L-Sit', qty: 20 }],
  },
  {
    level: 33, is_boss: false, name: 'Single Leg Intro',
    description: 'First pistol squat reps — 3 per side counts.',
    exercises: [{ name: 'Pull-up', qty: 9 }, { name: 'Parallel Bar Dip', qty: 15 }, { name: 'Archer Push-up', qty: 6 }, { name: 'Pike Push-up', qty: 15 }, { name: 'Pistol Squat', qty: 3 }],
  },
  {
    level: 34, is_boss: false, name: 'Hip Strength',
    description: 'Single leg squats and L-sit compressing your core.',
    exercises: [{ name: 'Pull-up', qty: 9 }, { name: 'Parallel Bar Dip', qty: 15 }, { name: 'Archer Push-up', qty: 6 }, { name: 'L-Sit', qty: 22 }, { name: 'Pistol Squat', qty: 3 }],
  },
  {
    level: 35, is_boss: false, name: 'Midpoint Power',
    description: 'Balanced intermediate strength session.',
    exercises: [{ name: 'Pull-up', qty: 10 }, { name: 'Parallel Bar Dip', qty: 15 }, { name: 'Archer Push-up', qty: 7 }, { name: 'Pike Push-up', qty: 14 }, { name: 'Pistol Squat', qty: 4 }],
  },
  {
    level: 36, is_boss: false, name: 'Static Hold Power',
    description: 'L-sits grow longer. Pistol squats get more stable.',
    exercises: [{ name: 'Pull-up', qty: 10 }, { name: 'Parallel Bar Dip', qty: 16 }, { name: 'Archer Push-up', qty: 7 }, { name: 'L-Sit', qty: 25 }, { name: 'Pistol Squat', qty: 4 }],
  },
  {
    level: 37, is_boss: false, name: 'Unilateral Rise',
    description: 'Demanding unilateral upper and lower body.',
    exercises: [{ name: 'Pull-up', qty: 11 }, { name: 'Parallel Bar Dip', qty: 16 }, { name: 'Archer Push-up', qty: 8 }, { name: 'Pike Push-up', qty: 14 }, { name: 'Pistol Squat', qty: 5 }],
  },
  {
    level: 38, is_boss: false, name: 'Parallel Strength',
    description: 'Dips and L-sits defining your upper body.',
    exercises: [{ name: 'Pull-up', qty: 11 }, { name: 'Parallel Bar Dip', qty: 17 }, { name: 'Archer Push-up', qty: 8 }, { name: 'L-Sit', qty: 28 }, { name: 'Pistol Squat', qty: 5 }],
  },
  {
    level: 39, is_boss: false, name: 'Near Peak',
    description: 'One step from the intermediate peak boss.',
    exercises: [{ name: 'Pull-up', qty: 12 }, { name: 'Parallel Bar Dip', qty: 17 }, { name: 'Archer Push-up', qty: 9 }, { name: 'Pike Push-up', qty: 15 }, { name: 'Pistol Squat', qty: 5 }],
  },
  {
    level: 40, is_boss: true, name: 'Intermediate Peak',
    description: 'The intermediate boss. True strength and control.',
    exercises: [{ name: 'Pull-up', qty: 12 }, { name: 'Parallel Bar Dip', qty: 18 }, { name: 'Archer Push-up', qty: 10 }, { name: 'L-Sit', qty: 30 }, { name: 'Pistol Squat', qty: 6 }, { name: 'Pike Push-up', qty: 15 }],
  },

  // ─── Chapter 5: Advanced Foundations (Levels 41–50) ───
  {
    level: 41, is_boss: false, name: 'Higher Ground',
    description: 'Maintain intermediate volume before the big jump.',
    exercises: [{ name: 'Pull-up', qty: 12 }, { name: 'Parallel Bar Dip', qty: 18 }, { name: 'Archer Push-up', qty: 8 }, { name: 'L-Sit', qty: 25 }, { name: 'Pistol Squat', qty: 5 }],
  },
  {
    level: 42, is_boss: false, name: 'Dragon Entry',
    description: 'First dragon flags — a taste of elite core strength.',
    exercises: [{ name: 'Pull-up', qty: 13 }, { name: 'Parallel Bar Dip', qty: 18 }, { name: 'Archer Push-up', qty: 9 }, { name: 'Dragon Flag', qty: 3 }, { name: 'Pistol Squat', qty: 5 }],
  },
  {
    level: 43, is_boss: false, name: 'Head Below Shoulders',
    description: 'Begin handstand push-up work.',
    exercises: [{ name: 'Pull-up', qty: 13 }, { name: 'Parallel Bar Dip', qty: 18 }, { name: 'Handstand Push-up', qty: 3 }, { name: 'L-Sit', qty: 28 }, { name: 'Pistol Squat', qty: 6 }],
  },
  {
    level: 44, is_boss: false, name: 'Inverted Strength',
    description: 'Dragon flags and archer push-ups in the same session.',
    exercises: [{ name: 'Pull-up', qty: 13 }, { name: 'Parallel Bar Dip', qty: 19 }, { name: 'Archer Push-up', qty: 10 }, { name: 'Dragon Flag', qty: 4 }, { name: 'Pistol Squat', qty: 6 }],
  },
  {
    level: 45, is_boss: false, name: 'Pressing Overhead',
    description: 'HSPU reps grow. L-sit holds push 30 seconds.',
    exercises: [{ name: 'Pull-up', qty: 14 }, { name: 'Parallel Bar Dip', qty: 19 }, { name: 'Handstand Push-up', qty: 4 }, { name: 'L-Sit', qty: 30 }, { name: 'Pistol Squat', qty: 6 }],
  },
  {
    level: 46, is_boss: false, name: 'Dragon Rider',
    description: 'Dragon flags become consistent.',
    exercises: [{ name: 'Pull-up', qty: 14 }, { name: 'Parallel Bar Dip', qty: 19 }, { name: 'Archer Push-up', qty: 10 }, { name: 'Dragon Flag', qty: 5 }, { name: 'Pistol Squat', qty: 7 }],
  },
  {
    level: 47, is_boss: false, name: 'Vertical Press',
    description: 'Five HSPU reps — shoulder power is real.',
    exercises: [{ name: 'Pull-up', qty: 14 }, { name: 'Parallel Bar Dip', qty: 20 }, { name: 'Handstand Push-up', qty: 5 }, { name: 'L-Sit', qty: 30 }, { name: 'Pistol Squat', qty: 7 }],
  },
  {
    level: 48, is_boss: false, name: 'Flag Strength',
    description: 'Six dragon flags and strong unilateral work.',
    exercises: [{ name: 'Pull-up', qty: 15 }, { name: 'Parallel Bar Dip', qty: 20 }, { name: 'Archer Push-up', qty: 10 }, { name: 'Dragon Flag', qty: 6 }, { name: 'Pistol Squat', qty: 7 }],
  },
  {
    level: 49, is_boss: false, name: 'Pre-Elite',
    description: 'Just one level from the advanced boss.',
    exercises: [{ name: 'Pull-up', qty: 15 }, { name: 'Parallel Bar Dip', qty: 20 }, { name: 'Handstand Push-up', qty: 6 }, { name: 'L-Sit', qty: 35 }, { name: 'Pistol Squat', qty: 8 }],
  },
  {
    level: 50, is_boss: true, name: 'Strength Ascendant',
    description: 'The advanced entry boss. Elite volume and skill.',
    exercises: [{ name: 'Pull-up', qty: 15 }, { name: 'Parallel Bar Dip', qty: 20 }, { name: 'Handstand Push-up', qty: 7 }, { name: 'Dragon Flag', qty: 6 }, { name: 'Pistol Squat', qty: 8 }, { name: 'L-Sit', qty: 35 }],
  },

  // ─── Chapter 6: Advanced Skills (Levels 51–60) ───
  {
    level: 51, is_boss: false, name: 'First Muscle-up',
    description: 'Three muscle-ups. The bar is yours.',
    exercises: [{ name: 'Muscle-up', qty: 3 }, { name: 'Handstand Push-up', qty: 6 }, { name: 'Dragon Flag', qty: 5 }, { name: 'L-Sit', qty: 30 }, { name: 'Pistol Squat', qty: 8 }],
  },
  {
    level: 52, is_boss: false, name: 'Lever Learning',
    description: 'Begin back lever holds.',
    exercises: [{ name: 'Muscle-up', qty: 3 }, { name: 'Handstand Push-up', qty: 7 }, { name: 'Dragon Flag', qty: 5 }, { name: 'Back Lever', qty: 10 }, { name: 'Pistol Squat', qty: 8 }],
  },
  {
    level: 53, is_boss: false, name: 'One Hand Rising',
    description: 'First one-arm push-up reps.',
    exercises: [{ name: 'Muscle-up', qty: 4 }, { name: 'Handstand Push-up', qty: 7 }, { name: 'Dragon Flag', qty: 6 }, { name: 'L-Sit', qty: 35 }, { name: 'One-Arm Push-up', qty: 3 }],
  },
  {
    level: 54, is_boss: false, name: 'Back Lever Hold',
    description: 'Back lever duration grows.',
    exercises: [{ name: 'Muscle-up', qty: 4 }, { name: 'Handstand Push-up', qty: 8 }, { name: 'Dragon Flag', qty: 6 }, { name: 'Back Lever', qty: 12 }, { name: 'Pistol Squat', qty: 9 }],
  },
  {
    level: 55, is_boss: false, name: 'One Arm Strength',
    description: 'Four one-arm push-ups per side.',
    exercises: [{ name: 'Muscle-up', qty: 5 }, { name: 'Handstand Push-up', qty: 8 }, { name: 'Dragon Flag', qty: 7 }, { name: 'L-Sit', qty: 40 }, { name: 'One-Arm Push-up', qty: 4 }],
  },
  {
    level: 56, is_boss: false, name: 'Front Lever Entry',
    description: 'Begin front lever progressions.',
    exercises: [{ name: 'Muscle-up', qty: 5 }, { name: 'Handstand Push-up', qty: 9 }, { name: 'Dragon Flag', qty: 7 }, { name: 'Front Lever', qty: 8 }, { name: 'Pistol Squat', qty: 9 }],
  },
  {
    level: 57, is_boss: false, name: 'Lever Push-up',
    description: 'Back lever and one-arm push-up in the same session.',
    exercises: [{ name: 'Muscle-up', qty: 6 }, { name: 'Handstand Push-up', qty: 9 }, { name: 'Dragon Flag', qty: 8 }, { name: 'Back Lever', qty: 15 }, { name: 'One-Arm Push-up', qty: 4 }],
  },
  {
    level: 58, is_boss: false, name: 'Front Hold',
    description: 'Front lever hold grows to 10 seconds.',
    exercises: [{ name: 'Muscle-up', qty: 6 }, { name: 'Handstand Push-up', qty: 10 }, { name: 'Dragon Flag', qty: 8 }, { name: 'Front Lever', qty: 10 }, { name: 'Pistol Squat', qty: 10 }],
  },
  {
    level: 59, is_boss: false, name: 'Elite Threshold',
    description: 'Seven muscle-ups. You are nearly elite.',
    exercises: [{ name: 'Muscle-up', qty: 7 }, { name: 'Handstand Push-up', qty: 10 }, { name: 'Dragon Flag', qty: 9 }, { name: 'L-Sit', qty: 40 }, { name: 'One-Arm Push-up', qty: 5 }],
  },
  {
    level: 60, is_boss: true, name: 'Elite Foundation',
    description: 'The advanced boss. All elite skills on the table.',
    exercises: [{ name: 'Muscle-up', qty: 8 }, { name: 'Handstand Push-up', qty: 10 }, { name: 'Dragon Flag', qty: 10 }, { name: 'Front Lever', qty: 12 }, { name: 'Back Lever', qty: 15 }, { name: 'One-Arm Push-up', qty: 5 }],
  },

  // ─── Chapter 7: Elite Mastery (Levels 61–70) ───
  {
    level: 61, is_boss: false, name: 'Planche Entry',
    description: 'Begin planche holds.',
    exercises: [{ name: 'Muscle-up', qty: 8 }, { name: 'Handstand Push-up', qty: 10 }, { name: 'Dragon Flag', qty: 8 }, { name: 'Front Lever', qty: 10 }, { name: 'One-Arm Push-up', qty: 5 }],
  },
  {
    level: 62, is_boss: false, name: 'Flag Horizontal',
    description: 'Human flag and planche enter the rotation.',
    exercises: [{ name: 'Muscle-up', qty: 8 }, { name: 'Handstand Push-up', qty: 11 }, { name: 'Dragon Flag', qty: 9 }, { name: 'Back Lever', qty: 15 }, { name: 'Planche', qty: 5 }],
  },
  {
    level: 63, is_boss: false, name: 'Tuck Planche',
    description: 'Front lever and one-arm push-up volume.',
    exercises: [{ name: 'Muscle-up', qty: 9 }, { name: 'Handstand Push-up', qty: 11 }, { name: 'Dragon Flag', qty: 9 }, { name: 'Front Lever', qty: 12 }, { name: 'One-Arm Push-up', qty: 6 }],
  },
  {
    level: 64, is_boss: false, name: 'Human Flag Hold',
    description: 'Five seconds of human flag. Raw lateral strength.',
    exercises: [{ name: 'Muscle-up', qty: 9 }, { name: 'Handstand Push-up', qty: 12 }, { name: 'Dragon Flag', qty: 10 }, { name: 'Human Flag', qty: 5 }, { name: 'Planche', qty: 8 }],
  },
  {
    level: 65, is_boss: false, name: 'Lever Mastery',
    description: 'Front lever hits 15 seconds.',
    exercises: [{ name: 'Muscle-up', qty: 10 }, { name: 'Handstand Push-up', qty: 12 }, { name: 'Dragon Flag', qty: 10 }, { name: 'Front Lever', qty: 15 }, { name: 'One-Arm Push-up', qty: 6 }],
  },
  {
    level: 66, is_boss: false, name: 'Full Static Power',
    description: 'All statics getting longer and stronger.',
    exercises: [{ name: 'Muscle-up', qty: 10 }, { name: 'Handstand Push-up', qty: 12 }, { name: 'Dragon Flag', qty: 10 }, { name: 'Human Flag', qty: 8 }, { name: 'Planche', qty: 10 }],
  },
  {
    level: 67, is_boss: false, name: 'Advanced Compound',
    description: 'Front and back lever in the same session.',
    exercises: [{ name: 'Muscle-up', qty: 11 }, { name: 'Handstand Push-up', qty: 13 }, { name: 'Dragon Flag', qty: 12 }, { name: 'Front Lever', qty: 18 }, { name: 'Back Lever', qty: 20 }],
  },
  {
    level: 68, is_boss: false, name: 'Elite Static',
    description: 'Planche and human flag reaching their peak.',
    exercises: [{ name: 'Muscle-up', qty: 11 }, { name: 'Handstand Push-up', qty: 13 }, { name: 'Dragon Flag', qty: 12 }, { name: 'Human Flag', qty: 10 }, { name: 'Planche', qty: 12 }],
  },
  {
    level: 69, is_boss: false, name: 'Peak Performance',
    description: 'One step from the summit.',
    exercises: [{ name: 'Muscle-up', qty: 12 }, { name: 'Handstand Push-up', qty: 14 }, { name: 'Dragon Flag', qty: 12 }, { name: 'Front Lever', qty: 20 }, { name: 'One-Arm Push-up', qty: 7 }],
  },
  {
    level: 70, is_boss: true, name: 'Calisthenics Master',
    description: 'The ultimate boss. Every elite skill at peak volume. You made it.',
    exercises: [{ name: 'Muscle-up', qty: 12 }, { name: 'Handstand Push-up', qty: 15 }, { name: 'Dragon Flag', qty: 12 }, { name: 'Front Lever', qty: 20 }, { name: 'Human Flag', qty: 12 }, { name: 'Planche', qty: 15 }, { name: 'One-Arm Push-up', qty: 8 }],
  },
];

async function run() {
  const { createClient } = require('@supabase/supabase-js');
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('Missing Supabase credentials.');
    process.exit(1);
  }

  const supabase = createClient(url, key);

  // Idempotency check
  const { data: existing } = await supabase.from('map_levels').select('id').limit(1);
  if (existing && existing.length > 0) {
    console.log('map_levels already seeded — skipping.');
    return;
  }

  // Build exercise name → id map
  const { data: exercises, error: exErr } = await supabase.from('exercises').select('id, name');
  if (exErr) { console.error('Failed to fetch exercises:', exErr); process.exit(1); }

  const exerciseMap = {};
  for (const ex of exercises) exerciseMap[ex.name] = ex.id;

  console.log(`Found ${exercises.length} exercises. Seeding ${PLANS.length} plans...`);

  let inserted = 0;
  for (const plan of PLANS) {
    // Insert workout plan
    const { data: planData, error: planErr } = await supabase
      .from('workout_plans')
      .insert({ name: plan.name, description: plan.description })
      .select()
      .single();

    if (planErr) {
      console.error(`Failed to insert plan "${plan.name}":`, planErr);
      process.exit(1);
    }

    // Insert exercises
    const exerciseRows = plan.exercises.map((ex, idx) => {
      const exerciseId = exerciseMap[ex.name];
      if (!exerciseId) {
        console.warn(`  ⚠ Exercise not found: "${ex.name}" (level ${plan.level})`);
        return null;
      }
      return { workout_plan_id: planData.id, exercise_id: exerciseId, order_index: idx + 1, quantity: ex.qty };
    }).filter(Boolean);

    if (exerciseRows.length > 0) {
      const { error: exInsertErr } = await supabase.from('workout_plan_exercises').insert(exerciseRows);
      if (exInsertErr) {
        console.error(`Failed to insert exercises for plan "${plan.name}":`, exInsertErr);
        process.exit(1);
      }
    }

    // Insert map level
    const { error: levelErr } = await supabase
      .from('map_levels')
      .insert({ level_number: plan.level, workout_plan_id: planData.id, is_boss: plan.is_boss });

    if (levelErr) {
      console.error(`Failed to insert map_level ${plan.level}:`, levelErr);
      process.exit(1);
    }

    inserted++;
    const marker = plan.is_boss ? ' ⭐ BOSS' : '';
    console.log(`  ✓ Level ${plan.level}${marker}: ${plan.name}`);
  }

  console.log(`\nDone! Seeded ${inserted} levels.`);
}

run().catch((err) => { console.error(err); process.exit(1); });
