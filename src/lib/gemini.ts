import { GoogleGenAI, Type } from "@google/genai";
import { AIRecommendation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getHealthRecommendations(userData: any): Promise<AIRecommendation | null> {
  const prompt = `
    As a health and wellness assistant for a period tracking app called LunaFlow, provide personalized recommendations based on the following user profile:
    - Name: ${userData.name}
    - Age: ${userData.age}
    - Weight: ${userData.weight}kg
    - Height: ${userData.height}cm
    - Last Period: ${userData.lastPeriodDate}
    - Cycle Regularity: ${userData.isRegular ? 'Regular' : 'Irregular'}
    - Taking Pills: ${userData.takingPills ? 'Yes' : 'No'}
    - Sexually Active: ${userData.sexuallyActive ? 'Yes' : 'No'}
    - Sleep Routine: ${userData.sleepRoutine}

    Provide:
    1. A daily diet plan focused on hormonal balance.
    2. An exercise recommendation suitable for their current phase.
    3. Suggestions for improving mood swings and sexual wellness.
    4. A brief encouraging message.

    Keep each section concise, aesthetic, and easy to read.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diet: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["title", "content"]
            },
            exercise: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["title", "content"]
            },
            wellness: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["title", "content"]
            },
            message: { type: Type.STRING }
          },
          required: ["diet", "exercise", "wellness", "message"]
        }
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return null;
  }
}

export async function getDailyTip() {
  const prompt = "Provide a short, aesthetic daily wellness tip for a woman tracking her menstrual cycle. Focus on self-care, nutrition, or mindfulness. Keep it under 30 words.";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Take a moment to breathe and appreciate your body's natural rhythm.";
  }
}
