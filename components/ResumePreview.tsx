import React from 'react';
import { ResumeData } from '../types';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';

interface Props {
  data: ResumeData;
  className?: string;
}

export const ResumePreview: React.FC<Props> = ({ data, className }) => {
  const { personalInfo, experience, education, skills, languages } = data;

  return (
    <div className={`bg-white shadow-lg p-8 max-w-[210mm] mx-auto min-h-[297mm] text-slate-800 ${className}`} id="resume-preview">
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
        {/* Main Column */}
        <div className="md:col-span-2">
          {/* Experience */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-brand-900 border-b border-slate-200 pb-1 mb-4">Work Experience</h2>
            <div className="space-y-5">
              {experience.length === 0 && <p className="text-slate-400 italic">No experience added yet.</p>}
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

          {/* Education */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-brand-900 border-b border-slate-200 pb-1 mb-4">Education</h2>
            <div className="space-y-4">
              {education.length === 0 && <p className="text-slate-400 italic">No education added yet.</p>}
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

        {/* Sidebar Column */}
        <div className="md:col-span-1">
          {/* Skills */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-brand-900 border-b border-slate-200 pb-1 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.length === 0 && <p className="text-slate-400 italic text-sm">No skills added.</p>}
              {skills.map((skill, index) => (
                <span key={index} className="bg-brand-50 text-brand-700 px-2 py-1 rounded text-sm font-medium border border-brand-100">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-brand-900 border-b border-slate-200 pb-1 mb-4">Languages</h2>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              {languages.length === 0 && <p className="text-slate-400 italic">No languages added.</p>}
              {languages.map((lang, index) => (
                <li key={index}>{lang}</li>
              ))}
            </ul>
          </div>
          
          {/* Generated By Badge */}
          <div className="mt-12 pt-4 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Built with BharatResume</p>
          </div>
        </div>
      </div>
    </div>
  );
};