import type { Request, Response } from 'express';
import { AlertModel } from '../models/Alert.js';
import { LogEntryModel } from '../models/LogEntry.js';
import { detectAnomaly } from '../services/anomaly.service.js';
import { explainAnomaly } from '../services/ai.service.js';

export async function ingestLog(req: Request, res: Response): Promise<void> {
  const { host, source, level, message, timestamp, metadata } = req.body as {
    host: string;
    source: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
  };

  const logEntry = await LogEntryModel.create({
    host,
    source,
    level,
    message,
    timestamp: new Date(timestamp),
    metadata
  });

  const detection = detectAnomaly({ host, level, message });
  if (detection.flagged) {
    const aiResult = await explainAnomaly({ host, message, detection });

    const alert = await AlertModel.create({
      logEntryId: logEntry._id,
      host,
      type: detection.type,
      severity: detection.severity,
      summary: detection.summary,
      riskScore: aiResult.riskScore,
      recommendedSteps: aiResult.recommendedSteps,
      aiExplanation: aiResult.explanation,
      status: 'open'
    });

    res.status(201).json({ ingested: true, flagged: true, alertId: alert.id, detection });
    return;
  }

  res.status(201).json({ ingested: true, flagged: false });
}

export async function ingestBulkLogs(req: Request, res: Response): Promise<void> {
  const logs = req.body.logs as Array<{
    host: string;
    source: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
  }>;

  const results = await Promise.all(
    logs.map(async (entry) => {
      const detection = detectAnomaly({ host: entry.host, level: entry.level, message: entry.message });
      const logEntry = await LogEntryModel.create({ ...entry, timestamp: new Date(entry.timestamp) });
      if (!detection.flagged) return { flagged: false, logEntryId: logEntry.id };

      const aiResult = await explainAnomaly({ host: entry.host, message: entry.message, detection });
      const alert = await AlertModel.create({
        logEntryId: logEntry._id,
        host: entry.host,
        type: detection.type,
        severity: detection.severity,
        summary: detection.summary,
        riskScore: aiResult.riskScore,
        recommendedSteps: aiResult.recommendedSteps,
        aiExplanation: aiResult.explanation,
        status: 'open'
      });
      return { flagged: true, logEntryId: logEntry.id, alertId: alert.id };
    })
  );

  res.status(201).json({ ingested: results.length, results });
}

export async function getIngestionStatus(_req: Request, res: Response): Promise<void> {
  const [lastLog, count24h] = await Promise.all([
    LogEntryModel.findOne().sort({ createdAt: -1 }),
    LogEntryModel.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
  ]);

  res.json({
    lastIngestedAt: lastLog?.createdAt ?? null,
    logsInLast24Hours: count24h
  });
}
