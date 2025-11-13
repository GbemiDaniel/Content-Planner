import { GoogleGenAI, Type } from '@google/genai';
import type { PostScore } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development, in a real environment this check is not needed.
  console.warn("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });


export async function checkReadiness(content: string[], tones: string[]): Promise<string> {
  if (!content || content.every(c => c.trim() === '')) {
    return "Content is empty. Please write something before checking readiness.";
  }

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

export async function suggestHashtags(content: string[]): Promise<string> {
  if (!content || content.every(c => c.trim() === '')) {
    return "Content is empty. Please write something before suggesting hashtags.";
  }

  const contentString = content.map((post, index) => `Post ${index + 1}: "${post}"`).join('\n');

  const prompt = `
    You are an expert X (formerly Twitter) social media strategist.
    Based on the following content, suggest 5-7 relevant hashtags.
    Categorize them into 'Popular' (for broad reach) and 'Niche' (for a targeted audience).
    For each category, provide a brief, one-sentence explanation of its strategic value.
    Format the output clearly with headings for each category. Use markdown for formatting.

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
    console.error("Error calling Gemini API for hashtags:", error);
    throw new Error("Failed to get hashtag suggestions from AI. Please check your API key and try again.");
  }
}

export async function brainstormIdeas(topic?: string): Promise<string[]> {
  const prompt = topic
    ? `You are an expert X (formerly Twitter) content creator specializing in viral content. Based on the topic "${topic}", generate 3 distinct and engaging post ideas. Each idea must be under 280 characters, include 2-3 relevant hashtags, and be formatted to maximize engagement (e.g., using questions, bold statements, or lists).`
    : `You are an expert X (formerly Twitter) content creator specializing in viral content. Generate 3 engaging post ideas based on current trending topics in technology, science, and culture. Each idea must be under 280 characters, include 2-3 relevant hashtags, and be formatted to maximize engagement (e.g., using questions, bold statements, or lists).`;

  const finalPrompt = `${prompt}
  
  Return your response as a JSON array of strings, where each string is a complete post idea. For example: ["Post idea 1...", "Post idea 2...", "Post idea 3..."].`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: finalPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: "An engaging post idea for X.",
          },
        },
      },
    });

    const jsonString = response.text;
    const ideas = JSON.parse(jsonString);
    
    if (Array.isArray(ideas) && ideas.every(item => typeof item === 'string')) {
        return ideas;
    } else {
        throw new Error("AI returned data in an unexpected format.");
    }

  } catch (error) {
    console.error("Error calling Gemini API for brainstorming:", error);
    if (error instanceof SyntaxError) {
        throw new Error("Failed to parse AI response. The AI may have returned an invalid format.");
    }
    throw new Error("Failed to get brainstorming ideas from AI. Please check your API key and try again.");
  }
}

export async function rephrasePost(content: string, tones: string[]): Promise<string> {
    if (!content.trim()) {
        return content; // Return original content if empty
    }

    const toneString = tones.length > 0 ? `Desired Tones: ${tones.join(', ')}` : 'No specific tone was selected.';

    const prompt = `
        You are an expert X (formerly Twitter) copywriter. Your task is to rephrase the following text to maximize engagement, clarity, and impact, while adhering to the specified tones.
        The rephrased text MUST be under 280 characters.
        Return ONLY the rephrased text, without any additional commentary, introductory phrases, or markdown formatting.

        ${toneString}
        Original Text: "${content}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error calling Gemini API for rephrasing:", error);
        throw new Error("Failed to rephrase post from AI. Please check your API key and try again.");
    }
}

export async function formatPost(content: string, tones: string[]): Promise<string> {
    if (!content.trim()) {
        return content; // Return original content if empty
    }

    const toneString = tones.length > 0 ? `Desired Tones: ${tones.join(', ')}` : 'No specific tone was selected.';

    const prompt = `
        You are an expert X (formerly Twitter) social media editor. Your task is to add formatting to the following text to make it more readable and visually appealing.
        - IMPORTANT: Do NOT change the wording or rephrase the original text. Your only job is to add formatting.
        - Add strategic spacing and line breaks to improve the flow.
        - Add a few relevant emojis to add personality and visual appeal.
        - Structure parts of the text with bullet points or lists if it improves clarity, but without altering the original words.
        - Ensure the final text stays under 280 characters.
        - The core message and wording of the text MUST remain exactly the same.
        - Adhere to the specified tones when choosing emojis and formatting style.

        Return ONLY the formatted text, without any additional commentary or markdown formatting.

        ${toneString}
        Original Text: "${content}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error calling Gemini API for formatting:", error);
        throw new Error("Failed to format post from AI. Please check your API key and try again.");
    }
}


export async function analyzePostFromText(postText: string): Promise<string> {
  if (!postText.trim()) {
    throw new Error("Post text cannot be empty.");
  }

  const prompt = `
    You are a world-class social media analyst, specializing in X (formerly Twitter).
    A user has provided the text of one of their past posts. Your task is to provide a comprehensive analysis to help them learn and improve.

    Here is the post text:
    "${postText}"

    Please structure your feedback in Markdown format with the following sections:

    ### 📈 Overall Assessment
    A brief, one-paragraph summary of the post's effectiveness.

    ### ✅ Strengths
    - Bullet point 1: What the post did well (e.g., clear call to action, good use of humor, relevant hashtag).
    - Bullet point 2: Another positive aspect.

    ### 📉 Areas for Improvement
    - Bullet point 1: Identify a potential flaw (e.g., vague language, missed opportunity for engagement, confusing wording).
    - Bullet point 2: Another area that could be stronger.

    ### 🚀 Optimization for Reposting
    Provide an optimized version of the post text. Explain the key changes you made in a short sentence.
    **Optimized Version:**
    > "[Your rewritten post text here, under 280 characters]"

    ### 🧠 Key Takeaways for the Future
    - Bullet point 1: A concrete lesson the user can apply to their next post.
    - Bullet point 2: Another actionable tip.

    Provide only the analysis. Do not include any introductory or concluding remarks outside of this structure.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for post analysis:", error);
    throw new Error("Failed to get post analysis from AI. Please check your API key and try again.");
  }
}

export async function scorePost(content: string[], tones: string[]): Promise<PostScore> {
    if (!content || content.every(c => c.trim() === '')) {
        throw new Error("Cannot score an empty post.");
    }
    const toneString = tones.length > 0 ? `The desired tones are: ${tones.join(', ')}.` : 'No specific tone was selected.';
    const contentString = content.map((post, index) => `Post ${index + 1}: "${post}"`).join('\n');

    const prompt = `
        You are a quantitative social media analyst. Your task is to score the following X (formerly Twitter) post on a scale of 1-10 across several key metrics.
        Provide a concise, one-sentence rationale for each score.
        ${toneString}

        Content to analyze:
        ${contentString}

        Return your analysis in a JSON object with the specified schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        engagement: {
                            type: Type.OBJECT,
                            properties: {
                                score: { type: Type.INTEGER, description: "Score from 1-10 for engagement potential." },
                                rationale: { type: Type.STRING, description: "Rationale for the engagement score." }
                            }
                        },
                        clarity: {
                            type: Type.OBJECT,
                            properties: {
                                score: { type: Type.INTEGER, description: "Score from 1-10 for clarity and readability." },
                                rationale: { type: Type.STRING, description: "Rationale for the clarity score." }
                            }
                        },
                        toneAlignment: {
                            type: Type.OBJECT,
                            properties: {
                                score: { type: Type.INTEGER, description: "Score from 1-10 for tone alignment." },
                                rationale: { type: Type.STRING, description: "Rationale for the tone alignment score." }
                            }
                        },
                        overall: {
                            type: Type.OBJECT,
                            properties: {
                                score: { type: Type.INTEGER, description: "Score from 1-10 for overall score." },
                                rationale: { type: Type.STRING, description: "Rationale for the overall score." }
                            }
                        }
                    }
                }
            }
        });
        const jsonString = response.text;
        const scoreData = JSON.parse(jsonString);
        return scoreData as PostScore;
    } catch (error) {
        console.error("Error calling Gemini API for post scoring:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to parse AI score response. The AI may have returned an invalid format.");
        }
        throw new Error("Failed to get post score from AI. Please check your API key and try again.");
    }
}
