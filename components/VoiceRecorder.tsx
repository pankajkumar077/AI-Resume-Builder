import React, { useState, useEffect } from 'react';
import { Mic, Square, AlertCircle } from 'lucide-react';

interface Props {
  onTranscript: (text: string) => void;
  isProcessing: boolean;
}

export const VoiceRecorder: React.FC<Props> = ({ onTranscript, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-IN'; // Default to Indian English

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          onTranscript(finalTranscript);
          setIsRecording(false);
          recognitionInstance.stop();
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setError("Microphone error. Please type instead.");
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setError("Voice input not supported in this browser.");
    }
  }, [onTranscript]);

  const toggleRecording = () => {
    if (!recognition) return;
    
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setError(null);
      recognition.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {error && (
        <div className="text-red-500 text-xs mb-2 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </div>
      )}
      <button
        onClick={toggleRecording}
        disabled={isProcessing || !!error}
        className={`p-3 rounded-full transition-all shadow-md ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse text-white' 
            : 'bg-brand-600 hover:bg-brand-700 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isRecording ? "Stop Recording" : "Start Voice Input"}
      >
        {isRecording ? <Square size={24} /> : <Mic size={24} />}
      </button>
      <span className="text-xs text-slate-500 mt-2 font-medium">
        {isRecording ? 'Listening...' : 'Tap to Speak'}
      </span>
    </div>
  );
};