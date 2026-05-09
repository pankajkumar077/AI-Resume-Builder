export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  website?: string;
}

export interface Experience {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface Education {
  degree: string;
  school: string;
  year: string;
}

export enum ResumeTemplate {
  MODERN = 'MODERN',
  CLASSIC = 'CLASSIC',
  MINIMALIST = 'MINIMALIST',
  PROFESSIONAL = 'PROFESSIONAL'
}

export interface ResumeData {
  id: string;
  versionName: string;
  updatedAt: number;
  templateId: ResumeTemplate;
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: string[];
  notes: string[]; // User comments or AI feedback
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  EDITOR = 'EDITOR',
  PREVIEW = 'PREVIEW',
  TEMPLATES = 'TEMPLATES'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}
