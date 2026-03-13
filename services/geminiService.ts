import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESUME_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    personalInfo: {
      type: Type.OBJECT,
      properties: {
        fullName: { type: Type.STRING },
        title: { type: Type.STRING },
        summary: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        location: { type: Type.STRING },
        website: { type: Type.STRING },
      },
    },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          company: { type: Type.STRING },
          duration: { type: Type.STRING },
          description: { type: Type.STRING },
        },
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          degree: { type: Type.STRING },
          school: { type: Type.STRING },
          year: { type: Type.STRING },
        },
      },
    },
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    languages: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
};

export const generateResumeFromInput = async (
  currentResume: ResumeData,
  userInput: string,
  imageParts: string[] = []
): Promise<{ resume: Partial<ResumeData>; feedback: string }> => {
  
  const model = "gemini-2.5-flash";
  
  const parts: any[] = [];

  // Add images if present (e.g. photo of old resume)
  imageParts.forEach(base64 => {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg", 
        data: base64
      }
    });
  });

  parts.push({
    text: `
    You are a professional resume builder assistant for the Indian workforce. 
    Your goal is to extract resume information from the user's input and update the existing resume data structure.
    
    Current Resume Data (JSON):
    ${JSON.stringify(currentResume)}

    User Input: "${userInput}"

    Instructions:
    1. Analyze the user input (and images if provided).
    2. Extract relevant details (Name, Job titles, Skills, etc.).
    3. Infer skills if they describe tasks (e.g., "I drive a truck" -> Skill: "Commercial Driving").
    4. Translate into professional English if the input is in Hindi, Hinglish, or other languages.
    5. Merge with the Current Resume Data. Do not delete existing data unless explicitly asked.
    6. Return the FULL updated resume structure conforming to the schema.
    `
  });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: RESUME_SCHEMA,
        systemInstruction: "You are a helpful, professional HR assistant. Always output valid JSON matching the schema.",
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return { resume: data, feedback: "Resume updated successfully!" };
    }
    return { resume: currentResume, feedback: "Could not parse AI response." };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateChatResponse = async (messages: {role: string, text: string}[]) => {
  // Lightweight chat for the conversational UI, distinct from the strict extraction
  const model = "gemini-2.5-flash";
  try {
    const history = messages.map(m => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text }]
    }));

    const chat = ai.chats.create({
        model,
        history: history.slice(0, -1), // history up to last message
        config: {
            systemInstruction: "You are a friendly resume assistant named 'Sahayak'. You help workers created resumes. Keep answers short, encouraging, and ask for specific details if missing (like experience or skills).",
        }
    });

    const result = await chat.sendMessage({ message: messages[messages.length - 1].text });
    return result.text;
  } catch (e) {
    return "I'm having trouble connecting. Please try again.";
  }
}
