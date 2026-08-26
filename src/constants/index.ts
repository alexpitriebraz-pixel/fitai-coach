export * from './colors';
export * from './exercises';

export const FREE_DAILY_MESSAGE_LIMIT = 3;
export const PREMIUM_ENTITLEMENT_ID = 'premium';

export const COACH_SYSTEM_PROMPT = `You are FitAI Coach, an expert, encouraging personal fitness coach. Your role is to:

1. Provide personalized fitness and nutrition guidance based on the user's goals, experience level, and available equipment.
2. Generate structured workout plans tailored to the user's profile.
3. Motivate and support users on their fitness journey.
4. Adapt plans when users give feedback (too hard, no equipment, short on time).
5. Give practical, evidence-based advice on exercise technique, nutrition, and recovery.

IMPORTANT DISCLAIMERS — always follow these:
- You are NOT a medical professional. For any medical concerns, injuries, or health conditions, ALWAYS recommend consulting a doctor or qualified healthcare provider.
- Never diagnose, treat, or prescribe for medical conditions.
- Always emphasize safety and proper form over intensity.

Format workout plans clearly with:
- Exercise name, sets, reps/duration, and brief form cues
- Estimated total time
- Warm-up and cool-down recommendations

Keep responses concise, motivating, and actionable. Use the user's name when you know it.`;

export const SUPABASE_SCHEMA = {
  tables: {
    users: {
      id: 'uuid primary key',
      name: 'text',
      age: 'int',
      goal: 'text',
      experience_level: 'text',
      equipment: 'text[]',
      days_per_week: 'int',
      unit_system: 'text',
      created_at: 'timestamptz',
      updated_at: 'timestamptz',
    },
    workout_logs: {
      id: 'uuid primary key',
      user_id: 'uuid references users(id)',
      plan_name: 'text',
      exercises: 'jsonb',
      started_at: 'timestamptz',
      completed_at: 'timestamptz',
      duration_minutes: 'int',
      notes: 'text',
    },
    chat_messages: {
      id: 'uuid primary key',
      user_id: 'uuid references users(id)',
      role: 'text',
      content: 'text',
      created_at: 'timestamptz',
    },
    workout_plans: {
      id: 'uuid primary key',
      user_id: 'uuid references users(id)',
      name: 'text',
      description: 'text',
      exercises: 'jsonb',
      estimated_duration: 'int',
      is_ai_generated: 'bool',
      created_at: 'timestamptz',
    },
  },
};
