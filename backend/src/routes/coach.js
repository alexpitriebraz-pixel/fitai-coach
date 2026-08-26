import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db/index.js';
import { resolveUser } from '../middleware/auth.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const FREE_DAILY_LIMIT = parseInt(process.env.FREE_DAILY_LIMIT ?? '3', 10);

const SYSTEM_PROMPT = `You are FitAI Coach, an expert, encouraging personal fitness coach. Your role is to:

1. Provide personalized fitness and nutrition guidance based on the user's goals, experience level, and available equipment.
2. Generate structured workout plans tailored to the user's profile.
3. Motivate and support users on their fitness journey.
4. Adapt plans when users give feedback (too hard, no equipment, short on time).
5. Give practical, evidence-based advice on exercise technique, nutrition, and recovery.

IMPORTANT: You are NOT a medical professional. For any medical concerns, injuries, or health conditions, ALWAYS recommend consulting a doctor. Never diagnose or treat medical conditions. Emphasize safety and proper form.`;

function buildSystemPrompt(user) {
  if (!user.goal) return SYSTEM_PROMPT;
  return `${SYSTEM_PROMPT}

USER PROFILE:
- Name: ${user.name ?? 'User'}
- Goal: ${user.goal?.replace('_', ' ')}
- Experience: ${user.experience_level}
- Equipment: ${(user.equipment ?? []).join(', ')}
- Training days/week: ${user.days_per_week}
- Units: ${user.unit_system === 'metric' ? 'kg/km' : 'lb/miles'}`;
}

export async function coachRoutes(app) {
  // POST /coach/chat — envia mensagem, retorna resposta (streaming via SSE)
  app.post('/coach/chat', { preHandler: resolveUser }, async (req, reply) => {
    const { messages } = req.body ?? {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return reply.code(400).send({ error: 'messages array required' });
    }

    // Verificar limite diário (usuários não-premium)
    const isPremium = req.user.settings?.isPremium === true;
    if (!isPremium) {
      const { rows } = await db.query(
        `SELECT COUNT(*) FROM chat_messages
         WHERE user_id = $1 AND role = 'user' AND created_at > NOW() - INTERVAL '1 day'`,
        [req.user.id],
      );
      const usedToday = parseInt(rows[0].count, 10);
      if (usedToday >= FREE_DAILY_LIMIT) {
        return reply.code(429).send({
          error: 'daily_limit_reached',
          used: usedToday,
          limit: FREE_DAILY_LIMIT,
        });
      }
    }

    // Salvar mensagem do usuário
    const lastUserMsg = messages[messages.length - 1];
    await db.query(
      'INSERT INTO chat_messages (user_id, role, content) VALUES ($1, $2, $3)',
      [req.user.id, 'user', lastUserMsg.content],
    );

    // Resposta em streaming SSE
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.flushHeaders();

    let fullText = '';
    try {
      const stream = client.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: buildSystemPrompt(req.user),
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          fullText += chunk.delta.text;
          reply.raw.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
        }
      }

      // Salvar resposta do assistant
      await db.query(
        'INSERT INTO chat_messages (user_id, role, content) VALUES ($1, $2, $3)',
        [req.user.id, 'assistant', fullText],
      );

      reply.raw.write('data: [DONE]\n\n');
    } catch (err) {
      reply.raw.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    } finally {
      reply.raw.end();
    }
  });

  // GET /coach/history — histórico de chat do usuário
  app.get('/coach/history', { preHandler: resolveUser }, async (req) => {
    const limit = parseInt(req.query.limit ?? '50', 10);
    const { rows } = await db.query(
      'SELECT * FROM chat_messages WHERE user_id = $1 ORDER BY created_at ASC LIMIT $2',
      [req.user.id, limit],
    );
    return rows;
  });

  // DELETE /coach/history — limpa histórico
  app.delete('/coach/history', { preHandler: resolveUser }, async (req, reply) => {
    await db.query('DELETE FROM chat_messages WHERE user_id = $1', [req.user.id]);
    return reply.code(204).send();
  });
}
