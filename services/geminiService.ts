import { ResumeData } from "../types";

interface AssistantRequest {
  messages: { role: string; text: string }[];
  currentResume: ResumeData;
  userInput: string;
  imageParts?: string[];
}

interface AssistantResponse {
  chatResponse: string;
  resume: Partial<ResumeData>;
  feedback: string;
}

const apiRequest = async (body: AssistantRequest): Promise<AssistantResponse> => {
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Assistant API error: ${response.statusText}`);
  }

  return response.json();
};

export const assistantRequest = async (
  messages: { role: string; text: string }[],
  currentResume: ResumeData,
  userInput: string,
  imageParts: string[] = []
): Promise<AssistantResponse> => {
  return apiRequest({ messages, currentResume, userInput, imageParts });
};
