import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json({ limit: '10mb' }));

const geminiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const openaiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';

const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;
const openaiClient = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

const MODEL_CANDIDATES = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro'];
const OPENAI_MODELS = ['gpt-4o-mini', 'gpt-4.1-mini'];

const INSTRUCTIONS = `You are Sahayak, an AI Resume Builder. Extract info into JSON:
{
  "personalInfo": { "fullName": "", "title": "", "email": "", "phone": "", "location": "", "summary": "" },
  "experience": [{ "role": "", "company": "", "duration": "", "description": "" }],
  "education": [{ "degree": "", "school": "", "year": "" }],
  "skills": [],
  "languages": []
}`;

const extractLocal = (currentResume, userInput) => {
  const text = userInput.trim().replace(/\s+/g, ' ');
  const updated = {};
  const personalInfo = {};
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/(?:\+?\d{1,3}[\s-]?)?(?:\d{10}|\d{5}[\s-]?\d{5})/);
  if (emailMatch) personalInfo.email = emailMatch[0];
  if (phoneMatch) personalInfo.phone = phoneMatch[0].trim();
  if (Object.keys(personalInfo).length > 0) updated.personalInfo = personalInfo;
  return updated;
};

const runGeminiModel = async (modelName, parts) => {
  const model = genAI.getGenerativeModel({ model: modelName });
  return await model.generateContent(parts);
};

const runGeminiChat = async (messages) => {
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'ai' ? 'model' : 'user',
    parts: [{ text: m.text }],
  }));

  const model = genAI.getGenerativeModel({ model: MODEL_CANDIDATES[0] });
  const chat = model.startChat({ history });
  const result = await chat.sendMessage(messages[messages.length - 1].text);
  return result.response.text();
};

const runGeminiExtract = async (currentResume, userInput, imageParts = []) => {
  const prompt = `${INSTRUCTIONS}\n\nCurrent Data: ${JSON.stringify(currentResume)}\n\nInput: ${userInput}\n\nReturn ONLY JSON.`;
  const parts = [{ text: prompt }];
  imageParts.forEach((data) => parts.push({ inlineData: { data, mimeType: 'image/jpeg' } }));
  const result = await runGeminiModel(MODEL_CANDIDATES[0], parts);
  const text = await result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
};

const runOpenAIChat = async (messages) => {
  const formatted = messages.map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));
  const response = await openaiClient.chat.completions.create({
    model: OPENAI_MODELS[0],
    messages: formatted,
  });
  return response.choices?.[0]?.message?.content || '';
};

const runOpenAIExtract = async (currentResume, userInput) => {
  const prompt = `${INSTRUCTIONS}\n\nCurrent Data: ${JSON.stringify(currentResume)}\n\nInput: ${userInput}\n\nReturn ONLY JSON.`;
  const response = await openaiClient.chat.completions.create({
    model: OPENAI_MODELS[0],
    messages: [{ role: 'user', content: prompt }],
  });
  const text = response.choices?.[0]?.message?.content || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
};

const generateResumeFromInput = async (currentResume, userInput, imageParts = []) => {
  if (!geminiKey && !openaiKey) {
    return { resume: extractLocal(currentResume, userInput, imageParts), feedback: 'Local Mode' };
  }

  try {
    if (genAI) {
      const resume = await runGeminiExtract(currentResume, userInput, imageParts);
      return { resume, feedback: 'Updated with Gemini' };
    }

    if (openaiClient) {
      const resume = await runOpenAIExtract(currentResume, userInput);
      return { resume, feedback: 'Updated with OpenAI' };
    }
  } catch (error) {
    console.error('Resume extraction error:', error);
  }

  return { resume: extractLocal(currentResume, userInput, imageParts), feedback: 'Local Fallback' };
};

const generateChatResponse = async (messages) => {
  if (!geminiKey && !openaiKey) {
    return "I'm in local mode. Please add a valid Gemini or OpenAI API key.";
  }

  try {
    if (genAI) {
      return await runGeminiChat(messages);
    }

    if (openaiClient) {
      return await runOpenAIChat(messages);
    }
  } catch (error) {
    console.error('Chat error:', error);
  }

  return "I'm having trouble connecting to the AI service. Please verify your API key.";
};

app.post('/api/assistant', async (req, res) => {
  try {
    const { messages, currentResume, userInput, imageParts } = req.body;
    const [chatResponse, extraction] = await Promise.all([
      generateChatResponse(messages || []),
      generateResumeFromInput(currentResume || {}, userInput || '', imageParts || []),
    ]);

    res.json({
      chatResponse,
      resume: extraction.resume || {},
      feedback: extraction.feedback,
    });
  } catch (error) {
    console.error('Assistant endpoint error:', error);
    res.status(500).json({ error: 'Assistant request failed' });
  }
});

app.get('/health', (_req, res) => {
  res.status(200).send('healthy');
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
