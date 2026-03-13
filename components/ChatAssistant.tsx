import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Loader2, Bot, User } from 'lucide-react';
import { generateResumeFromInput, generateChatResponse } from '../services/geminiService';
import { ResumeData, ChatMessage } from '../types';
import { VoiceRecorder } from './VoiceRecorder';

interface Props {
  currentResume: ResumeData;
  onUpdateResume: (data: Partial<ResumeData>) => void;
}

export const ChatAssistant: React.FC<Props> = ({ currentResume, onUpdateResume }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'ai', text: 'Namaste! I am Sahayak. I can help you build your resume. Tell me about your work experience, education, or skills. You can speak, type, or upload a photo of an old resume.', timestamp: Date.now() }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride?: string, imageBase64?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() && !imageBase64) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend || (imageBase64 ? "Uploaded an image" : ""),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      // 1. Get conversational response
      const chatResponseText = await generateChatResponse([...messages, userMsg]);
      
      // 2. Try to extract structured data if the input seems informative
      // We run this in parallel or after. Here, strict separation.
      // We pass the *accumulated* context + new input to the extractor
      // For simplicity in this demo, we just pass the current text + image
      const { resume: updatedData } = await generateResumeFromInput(currentResume, textToSend, imageBase64 ? [imageBase64] : []);
      
      if (updatedData) {
        onUpdateResume(updatedData);
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: chatResponseText || "I've updated your resume details.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: "Sorry, I had trouble processing that. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Strip prefix for API
        const data = base64.split(',')[1]; 
        handleSend("Here is an image of my document. Please extract details.", data);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="bg-brand-50 dark:bg-slate-900 p-4 border-b border-brand-100 dark:border-slate-700 flex items-center gap-2">
        <Bot className="text-brand-600 dark:text-brand-400" />
        <h2 className="font-semibold text-brand-900 dark:text-brand-100">Sahayak Assistant</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm ${
              msg.role === 'user' 
                ? 'bg-brand-600 text-white rounded-br-none' 
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
             <div className="bg-white dark:bg-slate-700 p-3 rounded-2xl rounded-bl-none border border-slate-200 dark:border-slate-600 shadow-sm">
                <Loader2 className="animate-spin text-brand-600 dark:text-brand-400" size={16} />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-end gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-700 rounded-full transition-colors"
            title="Upload Image"
          >
            <ImageIcon size={24} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload} 
          />
          
          <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center px-4 py-2 border border-transparent focus-within:border-brand-500 dark:focus-within:border-brand-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type message..."
              className="bg-transparent border-none focus:ring-0 w-full resize-none max-h-24 text-sm py-2 text-slate-900 dark:text-white placeholder:text-slate-400"
              rows={1}
            />
          </div>
          
          {input.trim() ? (
            <button 
              onClick={() => handleSend()}
              disabled={isProcessing}
              className="p-3 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-md transition-all"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
            </button>
          ) : (
            <VoiceRecorder onTranscript={(text) => handleSend(text)} isProcessing={isProcessing} />
          )}
        </div>
      </div>
    </div>
  );
};