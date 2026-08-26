import { db } from '../db/index.js';
import { resolveUser } from '../middleware/auth.js';

export async function workoutRoutes(app) {
  // --- Planos ---

  app.get('/workouts/plans', { preHandler: resolveUser }, async (req) => {
    const { rows } = await db.query(
      'SELECT * FROM workout_plans WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id],
    );
    return rows;
  });

  app.post('/workouts/plans', { preHandler: resolveUser }, async (req, reply) => {
    const { name, description, exercises, estimated_duration, difficulty, is_ai_generated } = req.body ?? {};
    if (!name || !exercises) return reply.code(400).send({ error: 'name and exercises required' });

    const { rows } = await db.query(
      `INSERT INTO workout_plans (user_id, name, description, exercises, estimated_duration, difficulty, is_ai_generated)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.id, name, description, JSON.stringify(exercises), estimated_duration, difficulty, is_ai_generated ?? false],
    );
    return reply.code(201).send(rows[0]);
  });

  app.delete('/workouts/plans/:id', { preHandler: resolveUser }, async (req, reply) => {
    await db.query('DELETE FROM workout_plans WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    return reply.code(204).send();
  });

  // --- Logs ---

  app.get('/workouts/logs', { preHandler: resolveUser }, async (req) => {
    const limit = parseInt(req.query.limit ?? '30', 10);
    const { rows } = await db.query(
      'SELECT * FROM workout_logs WHERE user_id = $1 ORDER BY started_at DESC LIMIT $2',
      [req.user.id, limit],
    );
    return rows;
  });

  app.post('/workouts/logs', { preHandler: resolveUser }, async (req, reply) => {
    const { plan_id, plan_name, exercises, started_at, completed_at, duration_minutes, notes } = req.body ?? {};
    if (!exercises || !started_at) return reply.code(400).send({ error: 'exercises and started_at required' });

    const { rows } = await db.query(
      `INSERT INTO workout_logs (user_id, plan_id, plan_name, exercises, started_at, completed_at, duration_minutes, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.user.id, plan_id ?? null, plan_name, JSON.stringify(exercises), started_at, completed_at ?? null, duration_minutes ?? null, notes ?? null],
    );
    return reply.code(201).send(rows[0]);
  });

  // GET /workouts/stats — streak + total + semanal
  app.get('/workouts/stats', { preHandler: resolveUser }, async (req) => {
    const { rows: total } = await db.query(
      'SELECT COUNT(*) FROM workout_logs WHERE user_id = $1 AND completed_at IS NOT NULL',
      [req.user.id],
    );
    const { rows: weekly } = await db.query(
      `SELECT COUNT(*) FROM workout_logs
       WHERE user_id = $1 AND completed_at IS NOT NULL AND completed_at > NOW() - INTERVAL '7 days'`,
      [req.user.id],
    );
    const { rows: recent } = await db.query(
      `SELECT DATE(completed_at) as day FROM workout_logs
       WHERE user_id = $1 AND completed_at IS NOT NULL
       ORDER BY completed_at DESC LIMIT 30`,
      [req.user.id],
    );

    // Calcula streak
    let streak = 0;
    const days = [...new Set(recent.map((r) => r.day.toISOString().split('T')[0]))];
    let current = new Date();
    current.setHours(0, 0, 0, 0);
    for (const d of days) {
      const date = new Date(d);
      const diff = Math.round((current - date) / 86400000);
      if (diff === 0 || diff === 1) { streak++; current = date; }
      else break;
    }

    return {
      total_workouts: parseInt(total[0].count, 10),
      weekly_workouts: parseInt(weekly[0].count, 10),
      streak,
    };
  });
}
