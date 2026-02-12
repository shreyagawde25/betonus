import { Schema, model } from 'mongoose';

export interface ILogEntry {
  host: string;
  source: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  ingestedAt: Date;
}

const logEntrySchema = new Schema<ILogEntry>(
  {
    host: { type: String, required: true, index: true },
    source: { type: String, required: true },
    level: { type: String, enum: ['info', 'warn', 'error'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, required: true },
    metadata: { type: Schema.Types.Mixed },
    ingestedAt: { type: Date, default: () => new Date() }
  },
  { timestamps: true }
);

export const LogEntryModel = model<ILogEntry>('LogEntry', logEntrySchema);
