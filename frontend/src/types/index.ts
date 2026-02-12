export interface Alert {
  _id: string;
  host: string;
  summary: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  aiExplanation?: string;
  recommendedSteps: string[];
  createdAt: string;
}

export interface IngestionStatus {
  lastIngestedAt: string | null;
  logsInLast24Hours: number;
}
