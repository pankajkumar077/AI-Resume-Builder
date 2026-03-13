import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { ResumeData, AppView } from './types';
import { ResumePreview } from './components/ResumePreview.tsx';
import { ChatAssistant } from './components/ChatAssistant.tsx';
import { FormEditor } from './components/FormEditor.tsx';
import { 
  MessageSquare, 
  PenTool, 
  Share2, 
  Download, 
  Plus, 
  Briefcase,
  X,
  Check,
  Copy,
  Home,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  FileText,
  Layout,
  Eye,
  Globe,
  Mic,
  Cpu,
  Moon,
  Sun
} from 'lucide-react';

const EMPTY_RESUME: ResumeData = {
  id: '',
  versionName: 'My Resume',
  updatedAt: Date.now(),
  personalInfo: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
  },
  experience: [],
  education: [],
  skills: [],
  languages: [],
  notes: []
};

// --- Helper Functions for Data Encoding ---
const encodeData = (data: any): string => {
  try {
    const cleanData = JSON.parse(JSON.stringify(data, (key, value) => {
      return value === "" || value === null || value === undefined ? undefined : value;
    }));
    const jsonStr = JSON.stringify(cleanData);
    const bytes = new TextEncoder().encode(jsonStr);
    const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    const base64 = btoa(binString);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    console.error("Encoding error", e);
    return "";
  }
};

const decodeData = (base64: string): any => {
  try {
    let str = base64.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    const binString = atob(str);
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
    const jsonStr = new TextDecoder().decode(bytes);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Decoding error", e);
    return null;
  }
};

function App() {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [currentResume, setCurrentResume] = useState<ResumeData>(EMPTY_RESUME);
  const [showShareModal, setShowShareModal] = useState(false);
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [copied, setCopied] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Mobile View State
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  useEffect(() => {
    // Check system preference or local storage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // 1. Handle Shared URL Loading
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('data');
    
    if (sharedData) {
      const data = decodeData(sharedData);
      if (data) {
        const merged = { ...EMPTY_RESUME, ...data, personalInfo: { ...EMPTY_RESUME.personalInfo, ...data.personalInfo } };
        setCurrentResume(merged);
        setIsSharedView(true);
        setView(AppView.PREVIEW);
        setMobileTab('preview');
      } else {
        window.history.replaceState({}, '', window.location.pathname);
      }
    } else {
      const stored = localStorage.getItem('bharat_resumes');
      if (stored) {
        try {
          setResumes(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse stored resumes");
        }
      }
    }
  }, []);

  // Save resumes
  useEffect(() => {
    if (!isSharedView) {
      localStorage.setItem('bharat_resumes', JSON.stringify(resumes));
    }
  }, [resumes, isSharedView]);

  const handleCreateNew = () => {
    const newResume = { ...EMPTY_RESUME, id: Date.now().toString() };
    setCurrentResume(newResume);
    setResumes(prev => [newResume, ...prev]);
    setView(AppView.EDITOR);
    setIsSharedView(false);
    setMobileTab('editor');
    if (isSharedView) {
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  const handleSelectResume = (resume: ResumeData) => {
    setCurrentResume(resume);
    setView(AppView.EDITOR);
    setIsSharedView(false);
    setMobileTab('editor');
  };

  const handleUpdateResume = (updatedPart: Partial<ResumeData>) => {
    if (isSharedView) return;
    const updated = { ...currentResume, ...updatedPart, updatedAt: Date.now() };
    setCurrentResume(updated);
    setResumes(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const handlePrint = () => {
    window.print();
  };

  const getShareUrl = () => {
    try {
      const { id, notes, updatedAt, versionName, ...shareableData } = currentResume;
      const base64 = encodeData(shareableData);
      if (!base64) return window.location.href;
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set('data', base64);
      return url.toString();
    } catch (e) {
      return window.location.href;
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSaveSharedToLocal = () => {
    const newResume = { ...currentResume, id: Date.now().toString() };
    const newResumes = [newResume, ...resumes];
    setResumes(newResumes);
    localStorage.setItem('bharat_resumes', JSON.stringify(newResumes));
    setIsSharedView(false);
    setView(AppView.EDITOR);
    window.history.pushState({}, '', window.location.pathname);
  };

  const shareUrl = getShareUrl();
  const isUrlTooLongForQr = shareUrl.length > 2000;

  // --- Sub Components ---

  const ShareModal = () => {
    if (!showShareModal) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative transform transition-all scale-100 border border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setShowShareModal(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-full transition-all"
          >
            <X size={20} />
          </button>
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mb-4 border border-brand-100 dark:border-brand-800">
              <Share2 size={28} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Share Your Resume</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-xs">
              Share this unique link with recruiters. They will see the latest version of your resume.
            </p>
          </div>

          {isUrlTooLongForQr ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 p-4 rounded-xl mb-6 flex gap-3 text-sm">
              <AlertTriangle size={20} className="shrink-0 text-amber-600 dark:text-amber-400" />
              <p>Resume data is too large for a QR code. Please use the direct link below.</p>
            </div>
          ) : (
            <div className="flex justify-center mb-6">
              <div className="p-4 border border-slate-100 dark:border-slate-600 rounded-2xl bg-white shadow-sm">
                <QRCode value={shareUrl} size={160} />
              </div>
            </div>
          )}

          <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-50/50 transition-all">
            <input 
              readOnly 
              value={shareUrl} 
              className="flex-1 bg-transparent border-none px-3 py-2 text-sm text-slate-600 dark:text-slate-300 focus:ring-0 w-full truncate"
            />
            <button 
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-xs uppercase tracking-wide transition-all shadow-sm ${
                copied 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-white hover:text-brand-600 hover:shadow'
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const FeatureCard = ({ icon: Icon, title, desc }: any) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-700 transition-all group">
      <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4 group-hover:scale-110 transition-transform">
        <Icon size={24} />
      </div>
      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );

  const Dashboard = () => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <div className="bg-brand-950 text-white relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-brand-800/30 rounded-full blur-[120px]"></div>
          <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-900/40 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-32 relative z-10">
          <nav className="flex justify-between items-center mb-16">
             <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
               <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                 <FileText size={20} className="text-white" />
               </div>
               BharatResume
             </div>
             <button onClick={toggleTheme} className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
          </nav>

          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-100 text-sm font-medium mb-6 backdrop-blur-md">
                <Sparkles size={14} /> 
                <span>AI-Powered Resume Builder for India</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
                Land Your Dream Job <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-200 to-brand-400">
                  In Minutes, Not Hours
                </span>
              </h1>
              <p className="text-brand-100 text-lg mb-10 max-w-xl mx-auto md:mx-0 leading-relaxed opacity-90">
                Create professional, ATS-friendly resumes using voice commands or simple chat. 
                Specifically designed for the modern workforce.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button 
                  onClick={handleCreateNew}
                  className="bg-brand-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-400 transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 transform active:scale-95"
                >
                  <Plus size={20} /> Create Free Resume
                </button>
                <button className="px-8 py-4 rounded-xl font-bold text-white border border-white/20 hover:bg-white/10 transition-all backdrop-blur-sm">
                  View Templates
                </button>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="flex-1 relative hidden md:block">
               <div className="absolute inset-0 bg-brand-500 blur-[80px] opacity-20"></div>
               <div className="relative bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-sm shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-700">
                  <div className="bg-white rounded-xl overflow-hidden opacity-90">
                    <div className="h-4 bg-slate-100 border-b border-slate-200 flex items-center gap-1 px-2">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    </div>
                    <div className="p-6 space-y-4">
                       <div className="h-8 w-1/2 bg-slate-200 rounded mb-4"></div>
                       <div className="space-y-2">
                         <div className="h-3 w-full bg-slate-100 rounded"></div>
                         <div className="h-3 w-5/6 bg-slate-100 rounded"></div>
                         <div className="h-3 w-4/6 bg-slate-100 rounded"></div>
                       </div>
                       <div className="flex gap-4 pt-4">
                          <div className="h-24 w-1/3 bg-slate-100 rounded"></div>
                          <div className="flex-1 space-y-2">
                             <div className="h-3 w-full bg-slate-100 rounded"></div>
                             <div className="h-3 w-full bg-slate-100 rounded"></div>
                             <div className="h-3 w-2/3 bg-slate-100 rounded"></div>
                          </div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Why Choose BharatResume?</h2>
           <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">We combine advanced AI with simple, intuitive tools to help you present your best self to recruiters.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <FeatureCard 
             icon={Mic} 
             title="Voice to Resume" 
             desc="Just speak about your experience in English or Hinglish. Our AI dictates and formats it instantly." 
           />
           <FeatureCard 
             icon={Cpu} 
             title="AI Optimization" 
             desc="Our Gemini-powered engine ensures your resume keywords match job descriptions perfectly." 
           />
           <FeatureCard 
             icon={Globe} 
             title="Universal Access" 
             desc="Mobile-first design means you can build, edit, and share your resume from any device, anywhere." 
           />
        </div>
      </div>

      {/* Your Resumes Section */}
      <div className="bg-slate-100 dark:bg-slate-950/50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Documents</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Card */}
            <button 
              onClick={handleCreateNew}
              className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-all min-h-[240px] group"
            >
              <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-900/30 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 flex items-center justify-center text-brand-500 dark:text-brand-400 mb-4 transition-colors">
                <Plus size={32} />
              </div>
              <span className="font-bold text-lg text-slate-700 dark:text-slate-300 group-hover:text-brand-700 dark:group-hover:text-brand-400">Create New Resume</span>
            </button>

            {resumes.map(resume => (
              <div 
                key={resume.id} 
                onClick={() => handleSelectResume(resume)}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-slate-200 dark:border-slate-700 flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center shadow-lg">
                    <FileText size={22} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                    V 1.0
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 truncate">{resume.personalInfo.fullName || 'Untitled Resume'}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Edited {new Date(resume.updatedAt).toLocaleDateString()}</p>
                
                <div className="flex-1 bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 mb-4">
                   <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 italic">
                     {resume.personalInfo.summary || 'No summary provided...'}
                   </p>
                </div>

                <div className="flex items-center text-brand-600 dark:text-brand-400 text-sm font-bold group-hover:translate-x-2 transition-transform">
                  Open Editor <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const EditorLayout = () => (
    <div className="flex flex-col bg-slate-50 dark:bg-slate-900 h-screen md:h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => setView(AppView.DASHBOARD)} 
            className="p-2 text-slate-400 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <Home size={20} />
          </button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex flex-col">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base truncate max-w-[120px] md:max-w-[200px]">
              {currentResume.personalInfo.fullName || 'Untitled'}
            </h2>
            <span className="text-[10px] text-brand-600 dark:text-brand-400 font-medium uppercase tracking-wider hidden md:block">
              Auto-saving
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          <button 
            onClick={toggleTheme} 
            className="p-2 text-slate-400 hover:text-brand-700 dark:text-slate-400 dark:hover:text-white rounded-xl transition-colors"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {!isSharedView && (
            <button 
              onClick={() => setShowShareModal(true)}
              className="p-2 md:px-4 md:py-2 text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-slate-700 hover:bg-brand-100 dark:hover:bg-slate-600 border border-brand-200 dark:border-slate-600 rounded-xl font-medium transition-colors text-sm flex items-center gap-2"
            >
              <Share2 size={18} /> <span className="hidden md:inline">Share</span>
            </button>
          )}
          <button 
            onClick={handlePrint}
            className="bg-brand-600 hover:bg-brand-700 text-white p-2 md:px-5 md:py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-brand-600/20 transition-all"
          >
            <Download size={18} /> <span className="hidden md:inline">Download PDF</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Bar - Visible only on small screens */}
      <div className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex">
        <button 
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
            mobileTab === 'editor' ? 'border-brand-600 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 dark:text-slate-400'
          }`}
        >
          <Layout size={16} /> Editor
        </button>
        <button 
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
            mobileTab === 'preview' ? 'border-brand-600 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 dark:text-slate-400'
          }`}
        >
          <Eye size={16} /> Preview
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        
        {/* Left Panel: Tools (Chat & Form) */}
        {/* On Mobile: Hidden if tab is 'preview'. On Desktop: Always Visible fixed width */}
        <div className={`
          bg-white dark:bg-slate-800 md:border-r border-slate-200 dark:border-slate-700 flex flex-col z-20 shadow-xl md:shadow-none
          w-full md:w-[450px] h-full
          ${mobileTab === 'preview' ? 'hidden md:flex' : 'flex'}
        `}>
          {!isSharedView ? (
            <>
              {/* Chat - Fixed height on mobile to allow form scrolling below, or flex on desktop */}
              <div className="h-[45vh] md:h-auto md:flex-[0.8] flex flex-col border-b border-slate-200 dark:border-slate-700 shrink-0">
                 <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                   <div className="p-1 bg-brand-100 dark:bg-brand-900/40 rounded text-brand-600 dark:text-brand-400"><MessageSquare size={14} /></div>
                   <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">AI Assistant</span>
                 </div>
                 <div className="flex-1 overflow-hidden relative bg-slate-50/50 dark:bg-slate-900/50">
                    <ChatAssistant currentResume={currentResume} onUpdateResume={handleUpdateResume} />
                 </div>
              </div>
              
              {/* Form - Takes remaining space */}
              <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 min-h-0">
                <div className="px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-sm z-10 shrink-0">
                   <div className="p-1 bg-purple-100 dark:bg-purple-900/40 rounded text-purple-600 dark:text-purple-400"><PenTool size={14} /></div>
                   <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Manual Editor</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <FormEditor data={currentResume} onChange={handleUpdateResume} />
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 mt-10">
              <Layout size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p>Editor tools are disabled in shared view.</p>
            </div>
          )}
        </div>

        {/* Right Panel: Preview */}
        {/* On Mobile: Hidden if tab is 'editor'. On Desktop: Always Visible (Flex 1) */}
        <div className={`
          bg-slate-200/80 dark:bg-slate-950 md:flex-1 flex flex-col items-center relative
          ${mobileTab === 'editor' ? 'hidden md:flex' : 'flex'}
          overflow-y-auto h-full
        `} id="resume-preview-scroll-container">
             
             <div className="w-full max-w-[210mm] py-8 md:py-10 px-4 md:px-0 transition-transform duration-300 origin-top">
                
                {isSharedView && (
                   <div className="mb-6 bg-brand-600 text-white p-5 rounded-xl flex flex-col sm:flex-row justify-between items-center shadow-xl shadow-brand-900/20 gap-4 mx-auto max-w-lg md:max-w-none">
                     <div className="flex items-center gap-4">
                       <div className="p-2 bg-white/20 rounded-lg">
                         <Eye size={24} />
                       </div>
                       <div>
                         <p className="font-bold text-lg">View Only Mode</p>
                         <p className="text-sm text-brand-100">Clone this resume to make changes.</p>
                       </div>
                     </div>
                     <button onClick={handleSaveSharedToLocal} className="bg-white text-brand-700 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-brand-50 transition-colors shadow-sm whitespace-nowrap w-full sm:w-auto">
                       Clone & Edit
                     </button>
                   </div>
                )}
                
                {/* Resume Container - Targeted by Print CSS */}
                <div id="resume-preview-container" className="bg-white shadow-2xl mx-auto">
                  <ResumePreview data={currentResume} />
                </div>
                
                <div className="mt-8 text-center text-slate-400 text-xs uppercase tracking-widest font-medium pb-10 print:hidden">
                  A4 Preview • {currentResume.personalInfo.fullName}
                </div>
             </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {view === AppView.DASHBOARD ? <Dashboard /> : <EditorLayout />}
      <ShareModal />
    </>
  );
}

export default App;