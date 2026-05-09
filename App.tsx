import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { ResumeData, AppView, ResumeTemplate } from './types';
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
  Sun,
  User,
  Lock,
  Mail,
  ArrowRight
} from 'lucide-react';

const EMPTY_RESUME: ResumeData = {
  id: '',
  versionName: 'My Resume',
  updatedAt: Date.now(),
  templateId: ResumeTemplate.MODERN,
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

// --- Sub Components ---

const FeatureCard = ({ icon: Icon, title, desc }: any) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-700 transition-all group">
    <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4 group-hover:scale-110 transition-transform">
      <Icon size={24} />
    </div>
    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const ShareModal = ({ show, onClose, shareUrl, copied, onCopy }: any) => {
  if (!show) return null;
  const isUrlTooLongForQr = shareUrl.length > 2000;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative transform transition-all scale-100 border border-slate-200 dark:border-slate-700">
        <button 
          onClick={onClose}
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
            onClick={onCopy}
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

const Dashboard = ({ 
  onToggleTheme, isDarkMode, onCreateNew, onViewTemplates, resumes, onSelectResume,
  isAuthenticated, user, onLogin, onSignup, onLogout 
}: any) => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
    <div className="bg-brand-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-brand-800/30 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-900/40 rounded-full blur-[100px]"></div>
      </div>
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-32 relative z-10">
        <nav className="flex justify-between items-center mb-16">
           <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
             <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
               <FileText size={20} className="text-white" />
             </div>
             BharatResume
           </div>
           
           <div className="flex items-center gap-4">
             <button onClick={onToggleTheme} className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             
             {!isAuthenticated ? (
               <div className="flex items-center gap-2">
                 <button 
                   onClick={onLogin}
                   className="px-5 py-2 rounded-xl text-sm font-bold text-white hover:bg-white/10 transition-all"
                 >
                   Log In
                 </button>
                 <button 
                   onClick={onSignup}
                   className="px-5 py-2 rounded-xl text-sm font-bold bg-white text-brand-950 hover:bg-brand-50 transition-all shadow-lg"
                 >
                   Sign Up
                 </button>
               </div>
             ) : (
               <div className="flex items-center gap-3">
                 <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-bold">{user?.name}</span>
                    <span className="text-[10px] opacity-60">{user?.email}</span>
                 </div>
                 <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold border-2 border-white/20 shadow-lg">
                    {user?.name?.charAt(0)}
                 </div>
                 <button 
                   onClick={onLogout}
                   className="p-2 text-white/60 hover:text-white transition-colors"
                   title="Logout"
                 >
                   <X size={20} />
                 </button>
               </div>
             )}
           </div>
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
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button onClick={onCreateNew} className="bg-brand-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-400 transition-all shadow-lg flex items-center justify-center gap-2 transform active:scale-95">
                <Plus size={20} /> Create Free Resume
              </button>
              <button onClick={onViewTemplates} className="px-8 py-4 rounded-xl font-bold text-white border border-white/20 hover:bg-white/10 transition-all backdrop-blur-sm">
                View Templates
              </button>
            </div>
          </div>
          <div className="flex-1 relative hidden md:block">
             <div className="absolute inset-0 bg-brand-500 blur-[80px] opacity-20"></div>
             <div className="relative bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-sm shadow-2xl transform rotate-2">
                <div className="bg-white rounded-xl overflow-hidden opacity-90 p-6 space-y-4">
                  <div className="h-8 w-1/2 bg-slate-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-slate-100 rounded"></div>
                    <div className="h-3 w-5/6 bg-slate-100 rounded"></div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
    <div className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <FeatureCard icon={Mic} title="Voice to Resume" desc="Just speak about your experience in English or Hinglish." />
         <FeatureCard icon={Cpu} title="AI Optimization" desc="Our Gemini-powered engine ensures your resume keywords match." />
         <FeatureCard icon={Globe} title="Universal Access" desc="Mobile-first design means you can build from any device." />
      </div>
    </div>
    <div className="bg-slate-100 dark:bg-slate-950/50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Your Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button onClick={onCreateNew} className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-brand-500 transition-all min-h-[240px] group">
            <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-500 mb-4 transition-colors"><Plus size={32} /></div>
            <span className="font-bold text-lg text-slate-700 dark:text-slate-300">Create New Resume</span>
          </button>
          {resumes.map((resume: any) => (
            <div key={resume.id} onClick={() => onSelectResume(resume)} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-slate-200 dark:border-slate-700 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center shadow-lg"><FileText size={22} /></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md">V 1.0</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 truncate">{resume.personalInfo.fullName || 'Untitled Resume'}</h3>
              <p className="text-xs text-slate-500 mb-4">Edited {new Date(resume.updatedAt).toLocaleDateString()}</p>
              <div className="flex items-center text-brand-600 dark:text-brand-400 text-sm font-bold group-hover:translate-x-2 transition-transform">Open Editor <ChevronRight size={16} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const TemplatesView = ({ onBack, onSelectTemplate }: any) => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-slate-400 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-slate-700 rounded-xl transition-colors"><Home size={24} /></button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Choose a Template</h1>
      </div>
    </nav>
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { id: ResumeTemplate.MODERN, name: 'Modern', desc: 'Clean, two-column layout with professional blue accents.' },
          { id: ResumeTemplate.CLASSIC, name: 'Classic', desc: 'Traditional serif layout, perfect for formal industries.' },
          { id: ResumeTemplate.MINIMALIST, name: 'Minimalist', desc: 'Sleek, airy design focused on typography and clarity.' },
          { id: ResumeTemplate.PROFESSIONAL, name: 'Professional', desc: 'Modern side-bar layout with high impact visuals.' }
        ].map((template) => (
          <div key={template.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition-all group shadow-sm flex flex-col">
            <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-700/50 p-4 relative overflow-hidden">
               <div className="absolute inset-0 bg-brand-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => onSelectTemplate(template.id)} className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">Use Template</button>
               </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{template.name}</h3>
              <p className="text-sm text-slate-500 mb-6">{template.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AuthModal = ({ show, mode, onClose, onSwitchMode, onAuthSuccess }: any) => {
  if (!show) return null;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock authentication
    setTimeout(() => {
      setIsLoading(false);
      onAuthSuccess({ name: name || 'User', email });
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative border border-slate-200 dark:border-slate-700">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-full transition-all"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-100 dark:border-brand-800">
            {mode === 'login' ? <Lock size={32} /> : <User size={32} />}
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {mode === 'login' ? 'Login to access your resumes' : 'Join thousands of job seekers today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" required
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" disabled={isLoading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : (
              <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={onSwitchMode}
              className="ml-2 text-brand-600 dark:text-brand-400 font-bold hover:underline"
            >
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const EditorLayout = ({ 
  currentResume, setView, onToggleTheme, isDarkMode, isSharedView, setShowShareModal, handlePrint, 
  mobileTab, setMobileTab, handleUpdateResume 
}: any) => (
  <div className="flex flex-col bg-slate-50 dark:bg-slate-900 h-screen overflow-hidden">
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between shrink-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <button onClick={() => setView(AppView.DASHBOARD)} className="p-2 text-slate-400 hover:text-brand-700 hover:bg-brand-50 rounded-xl transition-colors"><Home size={20} /></button>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
        <h2 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate max-w-[200px]">{currentResume.personalInfo.fullName || 'Untitled'}</h2>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setView(AppView.TEMPLATES)} className="p-2 text-slate-400 hover:text-brand-700 rounded-xl transition-colors" title="Change Template"><Layout size={18} /></button>
        <button onClick={onToggleTheme} className="p-2 text-slate-400 hover:text-brand-700 rounded-xl transition-colors">{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
        {!isSharedView && <button onClick={() => setShowShareModal(true)} className="p-2 md:px-4 md:py-2 text-brand-700 bg-brand-50 border border-brand-200 rounded-xl font-medium text-sm flex items-center gap-2"><Share2 size={18} /> <span className="hidden md:inline">Share</span></button>}
        <button onClick={handlePrint} className="bg-brand-600 hover:bg-brand-700 text-white p-2 md:px-5 md:py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-brand-600/20 transition-all"><Download size={18} /> <span className="hidden md:inline">Download PDF</span></button>
      </div>
    </header>

    <div className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex">
      <button onClick={() => setMobileTab('editor')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 ${mobileTab === 'editor' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500'}`}><PenTool size={16} /> Editor</button>
      <button onClick={() => setMobileTab('preview')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 ${mobileTab === 'preview' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500'}`}><Eye size={16} /> Preview</button>
    </div>

    <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
      <div className={`bg-white dark:bg-slate-800 md:border-r border-slate-200 dark:border-slate-700 flex flex-col z-20 w-full md:w-[450px] h-full ${mobileTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
        {!isSharedView ? (
          <>
            <div className="h-[45vh] md:h-auto md:flex-[0.8] flex flex-col border-b border-slate-200 dark:border-slate-700 shrink-0">
               <div className="flex-1 overflow-hidden relative bg-slate-50/50 dark:bg-slate-900/50">
                  <ChatAssistant currentResume={currentResume} onUpdateResume={handleUpdateResume} />
               </div>
            </div>
            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 min-h-0">
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <FormEditor data={currentResume} onChange={handleUpdateResume} />
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-slate-500 mt-10"><Layout size={48} className="mx-auto mb-4 text-slate-300" /><p>Editor tools are disabled in shared view.</p></div>
        )}
      </div>
      <div className={`bg-slate-200/80 dark:bg-slate-950 md:flex-1 flex flex-col items-center relative ${mobileTab === 'editor' ? 'hidden md:flex' : 'flex'} overflow-y-auto h-full`}>
           <div className="w-full max-w-[210mm] py-8 md:py-10 px-4 transition-transform duration-300 origin-top">
              <div id="resume-preview-container" className="bg-white shadow-2xl mx-auto">
                <ResumePreview data={currentResume} />
              </div>
           </div>
      </div>
    </div>
  </div>
);

function App() {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [currentResume, setCurrentResume] = useState<ResumeData>(EMPTY_RESUME);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [copied, setCopied] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('data');
    if (sharedData) {
      const data = decodeData(sharedData);
      if (data) {
        setCurrentResume({ ...EMPTY_RESUME, ...data, personalInfo: { ...EMPTY_RESUME.personalInfo, ...data.personalInfo } });
        setIsSharedView(true);
        setView(AppView.PREVIEW);
        setMobileTab('preview');
      }
    } else {
      const stored = localStorage.getItem('bharat_resumes');
      if (stored) setResumes(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (!isSharedView) localStorage.setItem('bharat_resumes', JSON.stringify(resumes));
  }, [resumes, isSharedView]);

  const handleCreateNew = () => {
    const newResume = { ...EMPTY_RESUME, id: Date.now().toString() };
    setCurrentResume(newResume);
    setResumes(prev => [newResume, ...prev]);
    setView(AppView.TEMPLATES);
    setIsSharedView(false);
  };

  const handleUpdateResume = (updatedPart: Partial<ResumeData>) => {
    if (isSharedView) return;
    const updated = { ...currentResume, ...updatedPart, personalInfo: updatedPart.personalInfo ? { ...currentResume.personalInfo, ...updatedPart.personalInfo } : currentResume.personalInfo, updatedAt: Date.now() };
    setCurrentResume(updated);
    setResumes(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const shareUrl = (() => {
    try {
      const { id, notes, updatedAt, versionName, ...shareableData } = currentResume;
      const base64 = encodeData(shareableData);
      const url = new URL(window.location.origin + window.location.pathname);
      if (base64) url.searchParams.set('data', base64);
      return url.toString();
    } catch (e) {
      return window.location.href;
    }
  })();

  return (
    <>
      {view === AppView.DASHBOARD && (
        <Dashboard 
          onToggleTheme={toggleTheme} isDarkMode={isDarkMode} 
          onCreateNew={handleCreateNew} onViewTemplates={() => setView(AppView.TEMPLATES)}
          resumes={resumes} onSelectResume={(r: any) => { setCurrentResume(r); setView(AppView.EDITOR); }}
          isAuthenticated={isAuthenticated} user={user}
          onLogin={() => { setAuthMode('login'); setShowAuthModal(true); }}
          onSignup={() => { setAuthMode('signup'); setShowAuthModal(true); }}
          onLogout={() => { setIsAuthenticated(false); setUser(null); }}
        />
      )}
      {view === AppView.TEMPLATES && (
        <TemplatesView 
          onBack={() => setView(AppView.DASHBOARD)}
          onSelectTemplate={(tid: any) => { handleUpdateResume({ templateId: tid }); setView(AppView.EDITOR); }}
        />
      )}
      {(view === AppView.EDITOR || view === AppView.PREVIEW) && (
        <EditorLayout 
          currentResume={currentResume} setView={setView} onToggleTheme={toggleTheme} 
          isDarkMode={isDarkMode} isSharedView={isSharedView} setShowShareModal={setShowShareModal} 
          handlePrint={() => window.print()} mobileTab={mobileTab} setMobileTab={setMobileTab}
          handleUpdateResume={handleUpdateResume}
        />
      )}
      <ShareModal 
        show={showShareModal} onClose={() => setShowShareModal(false)} shareUrl={shareUrl}
        copied={copied} onCopy={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      />
      <AuthModal 
        show={showAuthModal} mode={authMode} 
        onClose={() => setShowAuthModal(false)} 
        onSwitchMode={() => setAuthMode(prev => prev === 'login' ? 'signup' : 'login')}
        onAuthSuccess={(userData: any) => { setIsAuthenticated(true); setUser(userData); }}
      />
    </>
  );
}

export default App;