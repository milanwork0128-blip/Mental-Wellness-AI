
import { GoogleGenAI, Type } from "@google/genai";
import { TonePreference, WellnessCondition, WellnessResponse, ChatMessage } from "./types";

const SYSTEM_INSTRUCTIONS = `
You are a world-class Mental Wellness AI Companion. Your purpose is to provide deeply insightful, step-by-step therapeutic guidance.

CORE FRAMEWORKS:
1. **CBT (Cognitive Behavioral Therapy)**: Identify and challenge negative thought patterns.
2. **Mindfulness & Somatic Grounding**: Use the body to regulate the mind (Vagus nerve stimulation, etc).
3. **ACT (Acceptance and Commitment Therapy)**: Accept feelings without judgment and move towards values.
4. **Neuroscience**: Explain *why* the brain is reacting this way (e.g., "Your amygdala is active...").

STRICT LANGUAGE & STYLE GUIDELINES:
1. **Tone**: Warm, Professional, Empathetic, Grounded.
2. **Forbidden Words**: Do NOT use "honey", "sweetheart", "dear", "baby", "darling".
3. **Forbidden Openers**: Do NOT start with "Oh,", "Ah,", "Hmm,". Start directly with validation.
4. **Depth**: Go beyond "Drink water". Explain: "Drink cool water to stimulate the vagus nerve and reset your parasympathetic nervous system."
5. **No Name Usage**: Do NOT use the user's name in the response body.

RESPONSE ARCHITECTURE (JSON):
- **condition**: Identify the emotional state.
- **aiCommentary**: The conversational intro.
   - *Phase 1*: Validate the feeling.
   - *Phase 2*: Explain the biological/psychological mechanism (The "Why").
   - *Phase 3*: Gentle transition to action.
- **stepByStep**: A DETAILED, SEQUENTIAL PROTOCOL.
   - Each string must be a full step including Action + Reasoning.
   - Example: "**Physiological Reset**: Drink a glass of cold water to trigger the mammalian dive reflex, instantly lowering heart rate."
- **immediateActions**: Quick, 5-second micro-actions (Quick hits).
- **smallComforts**: Sensory items or environmental changes.
- **youtubeResource**: A highly relevant YouTube video recommendation.
   - **STRATEGY**: Search for a specific, high-quality video title (e.g. from TED, Headspace, Therapy in a Nutshell).
   - **URL RULE**: To guarantee the link works, **ALWAYS** return a YouTube Search URL for that specific title.
   - **FORMAT**: "https://www.youtube.com/results?search_query=" + Title (replace spaces with +).
   - **FORBIDDEN**: DO NOT generate specific 'watch?v=' video IDs as they are often incorrect. Always use the search query format.

IMAGE GENERATION LOGIC:
- Create a 'visualizationPrompt' for a high-quality 3D render.
- **Goal**: Visually illustrate the *primary* advice/action using a cute character.
- **Style**: "High-end 3D render, cute stylized character (Pixar/Nintendo style), soft volumetric lighting, 4k".
- **Composition**: CENTERED subject, clean pastel background, minimalist.

OUTPUT FORMAT:
- Output MUST be valid JSON matching the schema.
`;

export const getWellnessGuidance = async (
  input: string,
  history: ChatMessage[],
  tone: TonePreference,
  isStepByStep: boolean,
  imageBase64?: string,
  userRole?: string
): Promise<WellnessResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  let toneSpecifics = "";
  switch (tone) {
    case TonePreference.CalmGentle:
      toneSpecifics = "VOICE: Soothing, slow-paced. Focus on somatic safety and nervous system regulation.";
      break;
    case TonePreference.DirectPractical:
      toneSpecifics = "VOICE: Clinical, precise, biological. Focus on neurochemistry and cognitive restructuring.";
      break;
    case TonePreference.Motivational:
      toneSpecifics = "VOICE: Coach-like, empowering. Focus on dopamine regulation, momentum, and agency.";
      break;
  }

  // Format history
  const recentHistory = history.slice(-10).map(msg => 
    `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
  ).join('\n');

  const roleInstruction = userRole && userRole !== 'Other' 
    ? `USER ROLE: "${userRole}". Contextualize advice (e.g., Student = exam focus/burnout).`
    : `USER ROLE: General.`;

  const prompt = `
    PREVIOUS CONVERSATION:
    ${recentHistory}

    CURRENT USER INPUT: "${input}"
    
    METADATA:
    - ${roleInstruction}
    - Tone: ${toneSpecifics}
    - REQUEST: Provide a DEEP, STEP-BY-STEP breakdown of how to navigate this emotion.
    
    TASK:
    Generate a JSON response.
    1. **aiCommentary**: Provide a deep psychological insight into *why* they feel this way.
    2. **stepByStep**: Provide 3-5 distinct, ordered steps. Start with physiological regulation (body), then move to cognitive reframing (mind), then practical action.
    3. **visualizationPrompt**: A cute 3D character performing the *first* step of the protocol.
    4. **youtubeResource**: Recommend a specific video title. Return a SEARCH URL (https://www.youtube.com/results?search_query=...) for it.
  `;

  // 1. Text Logic with Google Search Tool enabled
  const textResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: prompt }] },
    config: {
      tools: [{ googleSearch: {} }], // Enable search to find real video titles
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
        required: ["condition", "aiCommentary", "visualizationPrompt", "visualizationTitle", "stepByStep", "youtubeResource"]
      }
    }
  });

  const wellnessData: WellnessResponse = JSON.parse(textResponse.text);

  // 2. Image Logic (3D Character)
  try {
    if (wellnessData.visualizationPrompt) {
      // Improved prompt for simpler, clearer, character-focused images
      const finalImagePrompt = `
        ${wellnessData.visualizationPrompt}.
        SUBJECT: Cute stylized 3D character, round friendly shapes, mascot style (like Pixar/Nintendo).
        ACTION: Demonstrating the wellness activity clearly.
        STYLE: High-end 3D render, octane render, soft volumetric lighting, pastel color palette.
        COMPOSITION: Centered subject, plenty of negative space, clean solid or soft gradient background (no clutter, no complex scenery).
        QUALITY: 4k, hyper-detailed textures, smooth edges.
        NEGATIVE: Text, watermarks, realistic humans, complex background, noise, blurry, distortion, multiple characters.
      `.trim().replace(/\s+/g, ' ');

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
    }
  } catch (err) {
    console.warn("Image generation failed", err);
  }

  return wellnessData;
};
