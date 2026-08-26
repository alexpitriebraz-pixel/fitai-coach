import { db } from '../db/index.js';
import { resolveUser } from '../middleware/auth.js';

export async function userRoutes(app) {
  // GET /users/me — retorna perfil do usuário
  app.get('/users/me', { preHandler: resolveUser }, async (req) => {
    return req.user;
  });

  // PUT /users/me — atualiza perfil
  app.put('/users/me', { preHandler: resolveUser }, async (req, reply) => {
    const { name, age, goal, experience_level, equipment, days_per_week, unit_system, settings } = req.body ?? {};

    const { rows } = await db.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        age = COALESCE($2, age),
        goal = COALESCE($3, goal),
        experience_level = COALESCE($4, experience_level),
        equipment = COALESCE($5, equipment),
        days_per_week = COALESCE($6, days_per_week),
        unit_system = COALESCE($7, unit_system),
        settings = COALESCE($8, settings),
        updated_at = NOW()
      WHERE id = $9
      RETURNING *`,
      [name, age, goal, experience_level, equipment, days_per_week, unit_system, settings ? JSON.stringify(settings) : null, req.user.id],
    );
    return rows[0];
  });

  // DELETE /users/me — exclui conta e todos os dados (LGPD/App Store compliance)
  app.delete('/users/me', { preHandler: resolveUser }, async (req, reply) => {
    await db.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    return reply.code(204).send();
  });
}
