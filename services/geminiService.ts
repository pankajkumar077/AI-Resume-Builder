import { GoogleGenerativeAI } from "@google/generative-ai";
import { ResumeData } from "../types";

// Get API Key from environment variables
// @ts-ignore
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Standard model candidates
const MODEL_CANDIDATES = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];

const INSTRUCTIONS = `You are Sahayak, an AI Resume Builder. Extract info into JSON:
{
  "personalInfo": { "fullName": "", "title": "", "email": "", "phone": "", "location": "", "summary": "" },
  "experience": [{ "role": "", "company": "", "duration": "", "description": "" }],
  "education": [{ "degree": "", "school": "", "year": "" }],
  "skills": [],
  "languages": []
}`;

const extractLocal = (currentResume: ResumeData, userInput: string): Partial<ResumeData> => {
  const text = userInput.trim().replace(/\s+/g, ' ');
  const updated: Partial<ResumeData> = {};
  const personalInfo: any = {};
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/(?:\+?\d{1,3}[\s-]?)?(?:\d{10}|\d{5}[\s-]?\d{5})/);
  if (emailMatch) personalInfo.email = emailMatch[0];
  if (phoneMatch) personalInfo.phone = phoneMatch[0].trim();
  if (Object.keys(personalInfo).length > 0) updated.personalInfo = personalInfo;
  return updated;
};

export const generateResumeFromInput = async (
  currentResume: ResumeData,
  userInput: string,
  imageParts: string[] = []
): Promise<{ resume: Partial<ResumeData>; feedback: string }> => {
  if (!genAI) return { resume: extractLocal(currentResume, userInput), feedback: "Local Mode" };

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = `${INSTRUCTIONS}\n\nCurrent Data: ${JSON.stringify(currentResume)}\n\nInput: ${userInput}\n\nReturn ONLY JSON.`;
      
      const parts: any[] = [{ text: prompt }];
      imageParts.forEach(data => parts.push({ inlineData: { data, mimeType: "image/jpeg" } }));

      const result = await model.generateContent(parts);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return {
        resume: jsonMatch ? JSON.parse(jsonMatch[0]) : {},
        feedback: `Updated with ${modelName}`
      };
    } catch (e) {
      console.warn(`Model ${modelName} failed during extraction.`);
    }
  }
  return { resume: extractLocal(currentResume, userInput), feedback: "Local Fallback" };
};

export const generateChatResponse = async (messages: { role: string; text: string }[]) => {
  if (!genAI) return "I'm in local mode. Please add a valid Gemini API key.";

  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'ai' ? 'model' : 'user',
    parts: [{ text: m.text }],
  }));
  const firstUserIndex = history.findIndex(m => m.role === 'user');
  const validHistory = firstUserIndex !== -1 ? history.slice(firstUserIndex) : [];

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const chat = model.startChat({ history: validHistory });
      const result = await chat.sendMessage(messages[messages.length - 1].text);
      return result.response.text();
    } catch (e: any) {
      console.error(`Chat failed with ${modelName}:`, e.message);
    }
  }

  return "I'm having trouble connecting to Gemini. Please ensure your API key is correct and has access.";
};
