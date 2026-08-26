import Fastify from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health.js';
import { userRoutes } from './routes/users.js';
import { coachRoutes } from './routes/coach.js';
import { workoutRoutes } from './routes/workouts.js';

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

app.register(healthRoutes);
app.register(userRoutes);
app.register(coachRoutes);
app.register(workoutRoutes);

// Global error handler
app.setErrorHandler((err, req, reply) => {
  app.log.error(err);
  reply.code(err.statusCode ?? 500).send({ error: err.message });
});

try {
  await app.listen({ port: parseInt(process.env.PORT ?? '3000', 10), host: '0.0.0.0' });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
