import Anthropic from '@anthropic-ai/sdk';
import { COACH_SYSTEM_PROMPT } from '../constants';
import type { ChatMessage, UserProfile } from '../types';

const client = new Anthropic({
  apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '',
  dangerouslyAllowBrowser: true,
});

function buildSystemPrompt(profile: UserProfile | null): string {
  if (!profile) return COACH_SYSTEM_PROMPT;

  return `${COACH_SYSTEM_PROMPT}

USER PROFILE:
- Name: ${profile.name || 'User'}
- Goal: ${profile.goal.replace('_', ' ')}
- Experience: ${profile.experienceLevel}
- Equipment: ${profile.equipment.join(', ')}
- Training days/week: ${profile.daysPerWeek}
- Units: ${profile.unitSystem === 'metric' ? 'kg/km' : 'lb/miles'}`;
}

export async function sendMessageToCoach(
  messages: ChatMessage[],
  profile: UserProfile | null,
  onChunk?: (chunk: string) => void,
): Promise<string> {
  const apiMessages = messages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  if (onChunk) {
    // Streaming
    let fullText = '';
    const stream = await client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: buildSystemPrompt(profile),
      messages: apiMessages,
    });

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        fullText += chunk.delta.text;
        onChunk(chunk.delta.text);
      }
    }
    return fullText;
  } else {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: buildSystemPrompt(profile),
      messages: apiMessages,
    });

    const block = response.content[0];
    return block.type === 'text' ? block.text : '';
  }
}

export async function generateWorkoutPlan(profile: UserProfile): Promise<string> {
  const prompt = `Generate a ${profile.daysPerWeek}-day per week workout plan for me.

My profile:
- Goal: ${profile.goal.replace('_', ' ')}
- Experience: ${profile.experienceLevel}
- Equipment: ${profile.equipment.join(', ')}

Please structure it clearly with:
1. A brief overview
2. Each day's workout with exercises, sets, and reps
3. A rest day recommendation
4. Key form tips for the main movements

Format it so I can easily follow along.`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    system: buildSystemPrompt(profile),
    messages: [{ role: 'user', content: prompt }],
  });

  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}
