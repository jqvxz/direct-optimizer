
import { GoogleGenAI } from "@google/genai";

// IMPORTANT: In a real application, you must configure the API key through
// a secure environment variable setup. For this example, we assume `process.env.API_KEY` is available.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled. Please set process.env.API_KEY.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getTweakExplanation = async (tweakName: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("AI functionality is disabled. API key is missing.");
  }

  const prompt = `
    You are a helpful assistant for a Windows optimization app.
    Explain the following Windows tweak in a clear, concise, and easy-to-understand way for a non-technical user.
    Use markdown for formatting.
    
    Tweak Name: "${tweakName}"
    
    Structure your explanation with these sections:
    - **What it does:** A simple, one-sentence explanation.
    - **Benefits:** Bullet points on why a user would want to enable this (e.g., performance, privacy, usability).
    - **Potential Risks:** Bullet points on any potential downsides or reasons to be cautious. If there are no major risks, say so.
  `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching explanation from Gemini API:", error);
    return "Could not retrieve an explanation at this time. Please check your connection or API key.";
  }
};