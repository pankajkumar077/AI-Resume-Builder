import React from 'react';
import { ResumeData, ResumeTemplate } from '../types';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';

interface Props {
  data: ResumeData;
  className?: string;
}

const ModernTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, experience, education, skills, languages } = data;
  return (
    <div className="p-8">
      {/* Header */}
      <div className="border-b-2 border-brand-600 pb-6 mb-6">
        <h1 className="text-4xl font-bold text-slate-900 uppercase tracking-wide">{personalInfo.fullName || 'Your Name'}</h1>
        <p className="text-xl text-brand-600 font-medium mt-1">{personalInfo.title || 'Job Title'}</p>
        
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
          {personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone size={14} /> <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail size={14} /> <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-1">
              <MapPin size={14} /> <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-1">
              <Globe size={14} /> <span>{personalInfo.website}</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-brand-900 border-b border-slate-200 pb-1 mb-3">Professional Summary</h2>
          <p className="text-slate-700 leading-relaxed">{personalInfo.summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-brand-900 border-b border-slate-200 pb-1 mb-4">Work Experience</h2>
            <div className="space-y-5">
              {experience.map((job, index) => (
                <div key={index}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-800">{job.role}</h3>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded">{job.duration}</span>
                  </div>
                  <p className="text-brand-600 font-medium text-sm mb-2">{job.company}</p>
                  <p className="text-slate-600 text-sm whitespace-pre-line">{job.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-brand-900 border-b border-slate-200 pb-1 mb-4">Education</h2>
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index}>
                  <h3 className="font-bold text-slate-800">{edu.degree}</h3>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-brand-600">{edu.school}</span>
                    <span className="text-slate-500">{edu.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-brand-900 border-b border-slate-200 pb-1 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span key={index} className="bg-brand-50 text-brand-700 px-2 py-1 rounded text-sm font-medium border border-brand-100">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-brand-900 border-b border-slate-200 pb-1 mb-4">Languages</h2>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              {languages.map((lang, index) => (
                <li key={index}>{lang}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClassicTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, experience, education, skills, languages } = data;
  return (
    <div className="p-10 font-serif">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{personalInfo.fullName || 'Your Name'}</h1>
        <div className="flex justify-center flex-wrap gap-3 text-sm text-slate-600 italic">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.location && <span>• {personalInfo.location}</span>}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-800 mb-3">Objective</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      <div className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-800 mb-4">Professional Experience</h2>
        <div className="space-y-6">
          {experience.map((job, index) => (
            <div key={index}>
              <div className="flex justify-between font-bold text-sm">
                <span>{job.company}</span>
                <span>{job.duration}</span>
              </div>
              <div className="italic text-sm mb-2">{job.role}</div>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-snug">{job.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-800 mb-4">Education</h2>
        <div className="space-y-3">
          {education.map((edu, index) => (
            <div key={index} className="flex justify-between text-sm">
              <div>
                <span className="font-bold">{edu.school}</span>, {edu.degree}
              </div>
              <span>{edu.year}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Skills & Languages */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-800 mb-3">Skills</h2>
          <p className="text-sm text-slate-700">{skills.join(', ')}</p>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-800 mb-3">Languages</h2>
          <p className="text-sm text-slate-700">{languages.join(', ')}</p>
        </div>
      </div>
    </div>
  );
};

const MinimalistTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, experience, education, skills, languages } = data;
  return (
    <div className="p-12 text-slate-800 font-sans max-w-[800px] mx-auto">
      <header className="mb-12">
        <h1 className="text-5xl font-light tracking-tight text-slate-900 mb-2">{personalInfo.fullName || 'Your Name'}</h1>
        <p className="text-lg text-slate-500 font-medium tracking-wide uppercase">{personalInfo.title || 'Job Title'}</p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
           {personalInfo.email && <span>{personalInfo.email}</span>}
           {personalInfo.phone && <span>{personalInfo.phone}</span>}
           {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </header>

      <section className="mb-10">
        <p className="text-lg text-slate-600 leading-relaxed italic">{personalInfo.summary}</p>
      </section>

      <div className="space-y-12">
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Experience</h2>
          <div className="space-y-8">
            {experience.map((job, index) => (
              <div key={index} className="group">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-xl font-medium text-slate-800">{job.role}</h3>
                  <span className="text-sm text-slate-400">{job.duration}</span>
                </div>
                <div className="text-brand-600 mb-3">{job.company}</div>
                <p className="text-slate-500 leading-relaxed text-sm">{job.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Education</h2>
          <div className="space-y-6">
            {education.map((edu, index) => (
              <div key={index} className="flex justify-between items-baseline">
                <div>
                  <h3 className="text-lg font-medium text-slate-800">{edu.degree}</h3>
                  <div className="text-slate-500">{edu.school}</div>
                </div>
                <span className="text-sm text-slate-400">{edu.year}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-12">
           <div>
             <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Expertise</h2>
             <div className="flex flex-wrap gap-x-4 gap-y-2">
                {skills.map((skill, index) => (
                  <span key={index} className="text-sm text-slate-600">{skill}</span>
                ))}
             </div>
           </div>
           <div>
             <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Languages</h2>
             <div className="flex flex-wrap gap-x-4 gap-y-2">
                {languages.map((lang, index) => (
                  <span key={index} className="text-sm text-slate-600">{lang}</span>
                ))}
             </div>
           </div>
        </section>
      </div>
    </div>
  );
};

const ProfessionalTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, experience, education, skills, languages } = data;
  return (
    <div className="p-0 flex min-h-[297mm]">
      {/* Sidebar */}
      <div className="w-1/3 bg-slate-900 text-white p-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">{personalInfo.fullName || 'Your Name'}</h1>
          <p className="text-slate-400 font-medium">{personalInfo.title || 'Job Title'}</p>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-400 mb-3 border-b border-slate-700 pb-1">Contact</h2>
            <div className="space-y-2 text-sm text-slate-300">
               {personalInfo.email && <div className="flex items-center gap-2"><Mail size={14}/> {personalInfo.email}</div>}
               {personalInfo.phone && <div className="flex items-center gap-2"><Phone size={14}/> {personalInfo.phone}</div>}
               {personalInfo.location && <div className="flex items-center gap-2"><MapPin size={14}/> {personalInfo.location}</div>}
               {personalInfo.website && <div className="flex items-center gap-2"><Globe size={14}/> {personalInfo.website}</div>}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-400 mb-3 border-b border-slate-700 pb-1">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span key={index} className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-400 mb-3 border-b border-slate-700 pb-1">Languages</h2>
            <div className="space-y-1 text-sm text-slate-300">
              {languages.map((lang, index) => (
                <div key={index}>{lang}</div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white p-10 text-slate-800">
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-brand-500 pl-4 uppercase tracking-tight">Profile</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{personalInfo.summary}</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-6 border-l-4 border-brand-500 pl-4 uppercase tracking-tight">Experience</h2>
          <div className="space-y-8">
            {experience.map((job, index) => (
              <div key={index} className="relative pl-2">
                <div className="flex justify-between mb-1">
                  <h3 className="font-bold text-slate-800">{job.role}</h3>
                  <span className="text-xs font-medium text-slate-500 uppercase">{job.duration}</span>
                </div>
                <div className="text-brand-600 text-sm font-medium mb-2">{job.company}</div>
                <p className="text-sm text-slate-600">{job.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6 border-l-4 border-brand-500 pl-4 uppercase tracking-tight">Education</h2>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between">
                  <h3 className="font-bold text-slate-800">{edu.degree}</h3>
                  <span className="text-xs font-medium text-slate-500">{edu.year}</span>
                </div>
                <div className="text-slate-600 text-sm">{edu.school}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export const ResumePreview: React.FC<Props> = ({ data, className }) => {
  const renderTemplate = () => {
    switch (data.templateId) {
      case ResumeTemplate.CLASSIC:
        return <ClassicTemplate data={data} />;
      case ResumeTemplate.MINIMALIST:
        return <MinimalistTemplate data={data} />;
      case ResumeTemplate.PROFESSIONAL:
        return <ProfessionalTemplate data={data} />;
      case ResumeTemplate.MODERN:
      default:
        return <ModernTemplate data={data} />;
    }
  };

  return (
    <div className={`bg-white shadow-2xl max-w-[210mm] mx-auto min-h-[297mm] overflow-hidden ${className}`} id="resume-preview">
      {renderTemplate()}
      
      {/* Generated By Badge - Only show if not in Professional sidebar */}
      {data.templateId !== ResumeTemplate.PROFESSIONAL && (
        <div className="pb-8 pt-4 text-center opacity-30">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Built with BharatResume</p>
        </div>
      )}
    </div>
  );
};