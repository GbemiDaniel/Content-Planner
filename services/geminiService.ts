
import { GoogleGenAI } from '@google/genai';
import type { Tone } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function checkReadiness(content: string[], tones: Tone[]): Promise<string> {
  if (!content || content.every(c => c.trim() === '')) {
    return "Content is empty. Please write something before checking readiness.";
  }

  // FIX: Removed unused `model` variable that used a deprecated API access pattern.
  const toneString = tones.length > 0 ? `The desired tones are: ${tones.join(', ')}.` : 'No specific tone was selected.';
  
  const contentString = content.map((post, index) => `Post ${index + 1}: "${post}"`).join('\n');

  const prompt = `
    You are an expert X (formerly Twitter) content strategist. Your task is to analyze the following post or thread and provide concise, actionable feedback.
    The user wants to check if their content is ready to post.
    ${toneString}

    Analyze the content based on clarity, engagement potential, character count, and alignment with the selected tones.
    Provide your feedback in a brief, easy-to-read format. Use bullet points for suggestions.
    - Start with a one-sentence overall assessment.
    - Provide 2-3 specific, constructive suggestions for improvement.
    - Mention if the content aligns well with the chosen tones, or how to improve it.
    - Suggest relevant hashtags if appropriate.

    Here is the content:
    ${contentString}
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get feedback from AI. Please check your API key and try again.");
  }
}
