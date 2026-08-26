import { db } from './index.js';

const schema = `
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id   TEXT UNIQUE NOT NULL,
    name        TEXT,
    age         INT,
    goal        TEXT,
    experience_level TEXT,
    equipment   TEXT[],
    days_per_week INT,
    unit_system TEXT DEFAULT 'metric',
    settings    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS workout_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    exercises       JSONB NOT NULL DEFAULT '[]',
    estimated_duration INT,
    difficulty      TEXT,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS workout_logs (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id          UUID REFERENCES workout_plans(id) ON DELETE SET NULL,
    plan_name        TEXT,
    exercises        JSONB NOT NULL DEFAULT '[]',
    started_at       TIMESTAMPTZ NOT NULL,
    completed_at     TIMESTAMPTZ,
    duration_minutes INT,
    notes            TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON workout_logs(user_id);
  CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
  CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id ON workout_plans(user_id);
`;

async function migrate() {
  console.log('[migrate] Running schema...');
  try {
    await db.query(schema);
    console.log('[migrate] Done.');
  } catch (err) {
    console.error('[migrate] Error:', err.message);
    process.exit(1);
  } finally {
    await db.end();
  }
}

migrate();
