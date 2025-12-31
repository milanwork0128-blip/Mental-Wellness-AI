
import { GoogleGenAI, Type } from "@google/genai";
import { TonePreference, WellnessCondition, WellnessResponse } from "./types";

const SYSTEM_INSTRUCTIONS = `
You are an advanced Mental Wellness AI. Your goal is to provide soothing, practical guidance.

IMAGE GENERATION LOGIC:
- You must generate a 'visualizationPrompt' for a high-quality 3D render.
- SUBJECT: A cute, friendly, stylized 3D character (Pixar/Disney style). NEVER use realistic humans.
- COMPOSITION: Simple, clear, and high-contrast. The character should be clearly performing ONE wellness activity (e.g., sipping tea, stretching, breathing deeply, organizing a single item).
- visualizationTitle: A very short (1-2 words), uppercase title like "STEP OUTSIDE", "5-MINUTE RULE", or "STAY HYDRATED".
- visualizationPrompt: Describe a high-quality 3D render. Example: "A cute stylized 3D character in a cozy sweater holding a giant glass of sparkling water, bright sunny window background, Pixar style, cinematic lighting, soft colors."

QUALITY STANDARDS:
- **Tone**: Match the user's selected preference (Calm, Direct, or Motivational).
- **Format**: Use "**Bold Title**: Description" for list items.
- Output MUST be valid JSON.
`;

export const getWellnessGuidance = async (
  input: string,
  tone: TonePreference,
  isStepByStep: boolean,
  imageBase64?: string,
  userRole?: string
): Promise<WellnessResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  let toneSpecifics = "";
  switch (tone) {
    case TonePreference.CalmGentle:
      toneSpecifics = "VOICE: Soft, maternal, reassuring. Focus on gentle sensory resets.";
      break;
    case TonePreference.DirectPractical:
      toneSpecifics = "VOICE: Professional, concise. Focus on biological and cognitive maintenance.";
      break;
    case TonePreference.Motivational:
      toneSpecifics = "VOICE: High-energy, empowering. Focus on small wins and momentum.";
      break;
  }

  const prompt = `
    User Input: "${input}"
    Role: "${userRole || 'General'}"
    Mode: ${isStepByStep ? 'Step-by-Step' : 'Holistic'}
    
    *** TONE INSTRUCTIONS ***
    ${toneSpecifics}
    
    Generate a JSON response following the system instructions. Focus on ONE main visualizable concept for the image.
  `;

  // 1. Text Logic
  const textResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: prompt }] },
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          condition: { type: Type.STRING },
          confidence: { type: Type.STRING },
          explanation: { type: Type.STRING },
          immediateActionsTitle: { type: Type.STRING },
          immediateActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          smallComfortsTitle: { type: Type.STRING },
          smallComforts: { type: Type.ARRAY, items: { type: Type.STRING } },
          stepByStep: { type: Type.ARRAY, items: { type: Type.STRING } },
          youtubeResource: {
            type: Type.OBJECT,
            properties: { title: { type: Type.STRING }, url: { type: Type.STRING }, reason: { type: Type.STRING } },
            required: ["title", "url", "reason"]
          },
          aiCommentary: { type: Type.STRING },
          gentleReminder: { type: Type.STRING },
          visualizationPrompt: { type: Type.STRING },
          visualizationTitle: { type: Type.STRING }
        },
        required: ["condition", "aiCommentary", "visualizationPrompt", "visualizationTitle"]
      }
    }
  });

  const wellnessData: WellnessResponse = JSON.parse(textResponse.text);

  // 2. Image Logic (3D Character)
  try {
    const finalImagePrompt = `${wellnessData.visualizationPrompt}. Style: Cinematic 3D render, Pixar style, cute character, volumetric lighting, soft shadows, extremely detailed, vibrant yet soothing colors, NO TEXT, NO REAL PEOPLE. High quality art.`;

    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: finalImagePrompt }] },
    });

    for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        wellnessData.visualizationImage = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        break;
      }
    }
  } catch (err) {
    console.warn("Image generation failed", err);
  }

  return wellnessData;
};
