import type { Request, Response } from 'express';
import { AlertModel } from '../models/Alert.js';
import { LogEntryModel } from '../models/LogEntry.js';
import { detectAnomaly } from '../services/anomaly.service.js';
import { explainAnomaly } from '../services/ai.service.js';

export async function listAlerts(_req: Request, res: Response): Promise<void> {
  const alerts = await AlertModel.find().sort({ createdAt: -1 }).limit(50).lean();
  res.json({ alerts });
}

export async function summarizeAlert(req: Request, res: Response): Promise<void> {
  const { alertId } = req.params;
  const alert = await AlertModel.findById(alertId);
  if (!alert) {
    res.status(404).json({ message: 'Alert not found.' });
    return;
  }

  const logEntry = await LogEntryModel.findById(alert.logEntryId);
  if (!logEntry) {
    res.status(404).json({ message: 'Log entry for alert not found.' });
    return;
  }

  const detection = detectAnomaly({ host: logEntry.host, level: logEntry.level, message: logEntry.message });
  const aiResult = await explainAnomaly({ host: logEntry.host, message: logEntry.message, detection });

  alert.aiExplanation = aiResult.explanation;
  alert.riskScore = aiResult.riskScore;
  alert.recommendedSteps = aiResult.recommendedSteps;
  await alert.save();

  res.json({
    alertId: alert.id,
    explanation: alert.aiExplanation,
    riskScore: alert.riskScore,
    recommendedSteps: alert.recommendedSteps
  });
}
