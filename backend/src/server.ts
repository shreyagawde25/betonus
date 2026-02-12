import { app } from './app.js';
import { connectToDatabase } from './config/db.js';
import { env } from './config/env.js';

async function bootstrap(): Promise<void> {
  await connectToDatabase();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', error);
  process.exit(1);
});
