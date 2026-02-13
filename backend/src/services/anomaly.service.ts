import type { ILogEntry } from '../models/LogEntry.js';

export interface DetectionResult {
  flagged: boolean;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  summary: string;
  recommendedSteps: string[];
}

const suspiciousPatterns = [
  { regex: /failed password|invalid user|authentication failure/i, type: 'auth_bruteforce', severity: 'high' as const, riskScore: 78 },
  { regex: /sudo:.*authentication failure|permission denied/i, type: 'privilege_escalation', severity: 'high' as const, riskScore: 82 },
  { regex: /new ssh key|authorized_keys/i, type: 'credential_change', severity: 'medium' as const, riskScore: 64 },
  { regex: /port scan|nmap|masscan/i, type: 'network_recon', severity: 'medium' as const, riskScore: 60 },
  { regex: /malware|ransomware|trojan/i, type: 'malware_signal', severity: 'critical' as const, riskScore: 94 }
];

export function detectAnomaly(log: Pick<ILogEntry, 'message' | 'level' | 'host'>): DetectionResult {
  for (const pattern of suspiciousPatterns) {
    if (pattern.regex.test(log.message)) {
      return {
        flagged: true,
        type: pattern.type,
        severity: pattern.severity,
        riskScore: pattern.riskScore,
        summary: `Suspicious ${pattern.type.replace('_', ' ')} behavior detected on ${log.host}.`,
        recommendedSteps: [
          'Validate user and source IP legitimacy.',
          'Inspect related logs from the last 30 minutes.',
          'Temporarily restrict suspicious account/IP if activity continues.'
        ]
      };
    }
  }

  if (log.level === 'error') {
    return {
      flagged: true,
      type: 'error_spike',
      severity: 'low',
      riskScore: 35,
      summary: `Error-level event detected on ${log.host}.`,
      recommendedSteps: ['Review stack/system trace and correlate with auth/network logs.']
    };
  }

  return {
    flagged: false,
    type: 'normal',
    severity: 'low',
    riskScore: 5,
    summary: 'No anomaly detected.',
    recommendedSteps: []
  };
}
