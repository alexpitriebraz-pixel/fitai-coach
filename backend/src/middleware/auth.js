import { db } from '../db/index.js';

// Busca ou cria usuário pelo device_id (header x-device-id)
// Para MVP: sem senha, o device_id é o identificador único
export async function resolveUser(request, reply) {
  const deviceId = request.headers['x-device-id'];
  if (!deviceId) {
    return reply.code(401).send({ error: 'Missing x-device-id header' });
  }

  const { rows } = await db.query(
    `INSERT INTO users (device_id) VALUES ($1)
     ON CONFLICT (device_id) DO UPDATE SET updated_at = NOW()
     RETURNING *`,
    [deviceId],
  );

  request.user = rows[0];
}
