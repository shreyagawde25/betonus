import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectToDatabase(): Promise<void> {
  await mongoose.connect(env.mongoUri);
  // eslint-disable-next-line no-console
  console.log('MongoDB connected');
}
