import { api } from './api';
import type { ChatMessage, UserProfile } from '../types';

export async function sendMessageToCoach(
  messages: ChatMessage[],
  _profile: UserProfile | null,
  onChunk?: (chunk: string) => void,
): Promise<string> {
  const apiMessages = messages.map((m) => ({ role: m.role, content: m.content }));
  let fullText = '';
  await api.streamChat(apiMessages, (chunk) => {
    fullText += chunk;
    onChunk?.(chunk);
  });
  return fullText;
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

  let fullText = '';
  await api.streamChat([{ role: 'user', content: prompt }], (chunk) => {
    fullText += chunk;
  });
  return fullText;
}
