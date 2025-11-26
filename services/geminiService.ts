import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";
import { QUESTIONS } from "../constants";

const apiKey = process.env.API_KEY;
// Initialize the client safely. If key is missing, we will handle it in the UI/logic layer mostly, 
// but here we ensure the instance exists.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Define the schema for the structured output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    maturityScore: {
      type: Type.INTEGER,
      description: "A score from 0 to 100 representing philosophical maturity and emotional intelligence.",
    },
    philosophicalPersona: {
      type: Type.STRING,
      description: "A creative title for the user's mindset (e.g., 'The Empathetic Realist', 'The Chaotic Hedonist').",
    },
    generalAnalysis: {
      type: Type.STRING,
      description: "EXTREMELY CONCISE (max 1-2 sentences) analysis of the user's worldview.",
    },
    hasAward: {
      type: Type.BOOLEAN,
      description: "True if the maturity score is above 80 and the answers show deep reflection.",
    },
    awardTitle: {
      type: Type.STRING,
      description: "The name of the award if applicable (e.g., 'The Golden Laurel of Wisdom'). Leave empty if hasAward is false.",
    },
    insights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionId: { type: Type.INTEGER },
          userAnswerSummary: { type: Type.STRING, description: "One very short sentence summarizing what the user said." },
          philosophicalPerspective: { type: Type.STRING, description: "Max 1-2 sentences offering a philosophical critique or validation." },
          relevantQuote: { type: Type.STRING, description: "A real quote from a famous philosopher that relates to this specific problem/answer." },
          philosopher: { type: Type.STRING, description: "Name of the philosopher who said the quote." }
        },
        required: ["questionId", "userAnswerSummary", "philosophicalPerspective", "relevantQuote", "philosopher"]
      }
    }
  },
  required: ["maturityScore", "philosophicalPersona", "generalAnalysis", "insights", "hasAward"]
};

export const analyzeAnswers = async (answers: Record<number, string>): Promise<AnalysisResult> => {
  if (!ai) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is set.");
  }

  const promptParts = [
    "You are a wise, empathetic, and deep philosopher.",
    "Analyze the following questionnaire answers to determine the user's philosophical maturity.",
    "Provide a rating, a persona, and for each question, provide deep insight and a relevant real quote from history's great thinkers (Stoics, Existentialists, Eastern Philosophers, etc.).",
    "CRITICAL: KEEP IT SHORT. Max 1-2 sentences per insight. Max 2 sentences for general analysis. Be punchy, profound, and brief.",
    "\nQUESTIONS AND ANSWERS:\n"
  ];

  QUESTIONS.forEach(q => {
    promptParts.push(`Q${q.id}: ${q.text}`);
    promptParts.push(`User Answer: ${answers[q.id] || "No answer provided."}`);
    promptParts.push("---");
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [{ text: promptParts.join("\n") }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are a master philosopher. Be extremely concise. Max 1-2 sentences per analysis. Focus on quality over quantity. Do not write paragraphs."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};