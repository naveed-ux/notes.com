
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Strictly following the initialization guidelines for GoogleGenAI
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const summarizeNote = async (content: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Summarize the following study note into 3-5 concise bullet points. Focus on key concepts and actionable takeaways: \n\n${content}`,
  });
  // Fix: Access response.text as a property, not a method
  return response.text || "Could not generate summary.";
};

export const suggestTags = async (title: string, content: string): Promise<string[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on the title "${title}" and content "${content}", suggest 5 relevant keywords/tags for this note.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  try {
    // Fix: Access response.text as a property
    const jsonStr = response.text || "[]";
    return JSON.parse(jsonStr.trim());
  } catch {
    return ["Note", "Study"];
  }
};

export const getStudyQuestions = async (content: string): Promise<string[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate 3 challenging study questions based on this content to help test understanding: \n\n${content}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  try {
    // Fix: Access response.text as a property
    const jsonStr = response.text || "[]";
    return JSON.parse(jsonStr.trim());
  } catch {
    return [];
  }
};
