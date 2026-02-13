import OpenAI from 'openai';
import { env } from '../config/env.js';
import type { DetectionResult } from './anomaly.service.js';

const client = env.openAiApiKey ? new OpenAI({ apiKey: env.openAiApiKey }) : null;

export async function explainAnomaly(input: {
  message: string;
  host: string;
  detection: DetectionResult;
}): Promise<{ explanation: string; riskScore: number; recommendedSteps: string[] }> {
  if (!client) {
    return {
      explanation:
        'OpenAI API key is not configured. Returning heuristic explanation only. Configure OPENAI_API_KEY for AI-generated incident summaries.',
      riskScore: input.detection.riskScore,
      recommendedSteps: input.detection.recommendedSteps
    };
  }

  const prompt = `You are a SOC analyst assistant. Analyze this security event and return JSON with keys: explanation (string), riskScore (0-100 number), recommendedSteps (array of 3 concise steps).
Host: ${input.host}
Detection type: ${input.detection.type}
Severity: ${input.detection.severity}
Message: ${input.message}`;

  const completion = await client.chat.completions.create({
    model: env.openAiModel,
    temperature: 0.2,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });

  const content = completion.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(content) as {
    explanation?: string;
    riskScore?: number;
    recommendedSteps?: string[];
  };

  return {
    explanation: parsed.explanation ?? input.detection.summary,
    riskScore: Math.max(0, Math.min(100, parsed.riskScore ?? input.detection.riskScore)),
    recommendedSteps: parsed.recommendedSteps?.length ? parsed.recommendedSteps : input.detection.recommendedSteps
  };
}
