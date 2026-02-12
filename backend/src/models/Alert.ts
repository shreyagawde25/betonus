import { Schema, model, Types } from 'mongoose';

export interface IAlert {
  logEntryId: Types.ObjectId;
  host: string;
  summary: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  recommendedSteps: string[];
  aiExplanation?: string;
  status: 'open' | 'acknowledged' | 'resolved';
}

const alertSchema = new Schema<IAlert>(
  {
    logEntryId: { type: Schema.Types.ObjectId, ref: 'LogEntry', required: true, index: true },
    host: { type: String, required: true, index: true },
    summary: { type: String, required: true },
    type: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    riskScore: { type: Number, required: true },
    recommendedSteps: { type: [String], default: [] },
    aiExplanation: { type: String },
    status: { type: String, enum: ['open', 'acknowledged', 'resolved'], default: 'open' }
  },
  { timestamps: true }
);

export const AlertModel = model<IAlert>('Alert', alertSchema);
