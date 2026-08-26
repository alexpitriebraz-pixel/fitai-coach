export async function healthRoutes(app) {
  app.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }));
  app.get('/', async () => ({ name: 'FitAI Coach API', version: '1.0.0' }));
}
