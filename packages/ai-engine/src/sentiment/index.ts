import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

export interface SentimentResult {
  score: number;
  label: string;
  color: string;
}

const SENTIMENT_MAP: Record<string, { color: string }> = {
  joy: { color: '#FFD700' },
  sadness: { color: '#4169E1' },
  anger: { color: '#FF4500' },
  fear: { color: '#8B008B' },
  surprise: { color: '#00CED1' },
  disgust: { color: '#556B2F' },
  neutral: { color: '#C0C0C0' },
  love: { color: '#FF69B4' },
  hope: { color: '#7CFC00' },
  anxiety: { color: '#FF8C00' },
};

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  try {
    // Temporary compatibility cast for mixed AI SDK model type versions in this monorepo.
    const { text: result } = await generateText({
      model: anthropic('claude-3-5-haiku-latest') as never,
      prompt: `Analyze the sentiment of the following text. Respond with ONLY a JSON object with two fields:
- "label": one of [joy, sadness, anger, fear, surprise, disgust, neutral, love, hope, anxiety]
- "score": a number from -1 (most negative) to 1 (most positive)

Text: "${text}"`,
    });

    const parsed = JSON.parse(result);
    const label = parsed.label?.toLowerCase() ?? 'neutral';
    const score = typeof parsed.score === 'number' ? parsed.score : 0;
    const color = SENTIMENT_MAP[label]?.color ?? SENTIMENT_MAP.neutral.color;

    return { score, label, color };
  } catch {
    return { score: 0, label: 'neutral', color: '#C0C0C0' };
  }
}
